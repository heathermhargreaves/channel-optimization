require('dotenv').config()
const express = require('express')
const app = express()

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
    userId: '14',
    name: 'Stacy',
    number: process.env.PHONE_NUMBER,
    email: process.env.EMAIL
}

// Twilio and Sendgrid info to be used for AB testing logic later
let twilio_info = {
    from: '+15102966273',
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

// Assigning channel name
const channels = [{ name: 'SMS' }, { name: 'CALL' }, { name: 'EMAIL' } ];

const bucket_no = Math.floor(Math.random() * channels.length)

const channel_assigned = channels[bucket_no].name

console.log(`Variation is ${variation}`)

// Segment call to track experiment info
analytics.track({
    userId: user.userId,
    event: 'Notification Sent',
    properties: {
      channel: channel_assigned
    }
});

// AB test logic and Twilio calls for each channel

if(variation === 'SMS') {
  console.log("sending sms")
  twilio.messages
      .create({
          body: twilio_info.body,
          from: twilio_info.from,
          to: user.number
      })
      .then(message => console.log(message.sid));
}
else if (variation === 'CALL') {
  console.log('sending call')
  twilio.calls
  .create({
      twiml: twilio_info.twiml,
      from: twilio_info.from,
      to: user.number,
      method: 'GET',
      statusCallback: "https://platform.segmentapis.com/webhook?n=jk7f61segt56l9mwke32r2x3vs9odsjv&s=ivUKDUJq&t=1628187161&w=QtOD0kOL2Z",
      statusCallbackEvent: ['answered'],
      statusCallbackMethod: 'POST'
  })
  .then(call => console.log(call.sid));
}
else if (variation === 'EMAIL') {
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
  console.log('no bucket assigned')
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
