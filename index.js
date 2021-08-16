require('dotenv').config()
const express = require('express')
const app = express()

const https = require('https')

const port = process.env.PORT

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken); 
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const Analytics = require('analytics-node');
const analytics = new Analytics(process.env.SEGMENT_KEY);

// user profile
let user = {
    userId: '20',
    name: 'Stacy',
    number: process.env.USER_PHONE_NUMBER,
    email: process.env.USER_EMAIL
}

// Twilio and Sendgrid info to be used for notifications
let twilio_info = {
    from: process.env.TWILIO_PHONE_NUMBER,
    body: `Reminder for ${user.name} your appointment is coming up tomorrow`,
    twiml: `<Response><Say>Reminder for ${user.name} your appointment is coming up tomorrow</Say></Response>`
}

const email_msg = {
    to: user.email, 
    from: process.env.SGEMAIL, 
    subject: 'Your Appointment is coming up',
    text: 'Your Appointment is coming up',
    html: `<strong>Your appointment is tomorrow, ${user.name}, let us know if you need to make a change.</strong>`,
  }

analytics.identify({
    userId: user.userId,
    traits: {
      name: user.name,
      email: user.email,
      phone: user.number
    }
});

// Headers for Segment Profile API
const options = {
  hostname: 'profiles.segment.com',
  port: 443,
  path: '/v1/spaces/' + process.env.SEGMENT_PERSONAS_SPACE_ID + '/collections/users/profiles/user_id:' + user.userId + '/traits',
  method: 'GET',
  auth: process.env.SEGMENT_PROFILE_API_TOKEN + ':'
}

// Define async request function to Profile API 
function get_pref(callback){
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
      const data = JSON.parse(d)
      if (data.traits) {
        if (data.traits.preferred_channel) {
          var pref = data.traits.preferred_channel
        }
      } else {
        var pref = null
      }
      callback(pref)
    })
  })

  req.on('error', error => {
    console.error(error)
    const pref=null
    callback(pref)
  })

  req.end()
}

// Assign channel based either on existing preference or randomly
var channel_assigned = ''

get_pref(function(pref){
  if (pref) {
    channel_assigned = pref
    console.log("existing pref, assigning " + channel_assigned)
  } else {
    const channels = [{ name: 'SMS' }, { name: 'CALL' }, { name: 'EMAIL' } ];
    const bucket_no = Math.floor(Math.random() * channels.length)
    channel_assigned = channels[bucket_no].name
    console.log("no existing pref, assigning " + channel_assigned)
  }

  // Segment call to track notification info
  analytics.track({
      userId: user.userId,
      event: 'Notification Sent',
      properties: {
        channel: channel_assigned
      }
  });

  // Twilio calls for each channel
  if(channel_assigned === 'SMS') {
    console.log("sending sms")
    twilio.messages
        .create({
            body: twilio_info.body,
            from: twilio_info.from,
            to: user.number
        })
        .then(message => console.log(message.sid));
  }
  else if (channel_assigned === 'CALL') {
    console.log('sending call')
    twilio.calls
    .create({
        twiml: twilio_info.twiml,
        from: twilio_info.from,
        to: user.number,
        method: 'GET',
        statusCallback: process.env.SEGMENT_CALL_SOURCE_FUNCTION_URL,
        statusCallbackEvent: ['answered'],
        statusCallbackMethod: 'POST'
    })
    .then(call => console.log(call.sid));
  }
  else if (channel_assigned === 'EMAIL') {
    console.log('sending email')
    sgMail
    .send(email_msg)
    .then((response) => {
      console.log(response[0].statusCode)
    })
    .catch((error) => {
      console.error(error)
    })
  }
  else {
    console.log('no channel assigned')
  }

});
