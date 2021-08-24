# channel-optimization
Using Segment to optimize which Twilio channel to engage a user on. 
For full setup instructions, see https://www.twilio.com/blog/optimize-preferred-communications-channels-computed-traits

## Requirements
- Node
- Segment account with access to Functions and Personas Advanced
- Twilio account with access to Programmable SMS, Programmable Voice, and a phone number
- Sendgrid account

## Getting Started
1. Fork and clone this repo
2. Initialize Node app with `npm init`
3. Install the following libraries using this command: `npm install --save express twilio @sendgrid/mail analytics-node dotenv`
4. Add a `.env` file in the root of this directory.
5. In the `.env`, copy and paste the following code and add your keys for Twilio, Segment, and Sendgrid, as well your phone number and email where you want to receive notifications from the demo, and lastly your Sendgrid email that you are using to send emails:
```
PORT=3000
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=
SEGMENT_KEY=
PHONE_NUMBER=
EMAIL=
SGEMAIL=
SEGMENT_CALL_SOURCE_FUNCTION_URL=
SEGMENT_PERSONAS_SPACE_ID=
SEGMENT_PROFILE_API_TOKEN=
```

6. On line 18 in `index.js` you will see the `user` variable, update this with a name and a random user id to receive a message.
7. Make sure your local updates are saved and run `node index.js` to start your app.
