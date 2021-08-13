// Learn more about source functions API at
// https://segment.com/docs/connections/sources/source-functions

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */
async function onRequest(request, settings) {
	// Confirm that the message was received successfully
	if (request.json().SmsStatus != 'received') {
		return;
	}

	// Grab user's phone number from the Twilio webhook
	let from = request.json().From;

	// Create Segment event payload
	let event_payload = {
		event: 'Notification Engaged',
		anonymousId: from,
		properties: { phone: from, channel: 'SMS' }
	};

	// Send Segment events
	Segment.track(event_payload);
}
