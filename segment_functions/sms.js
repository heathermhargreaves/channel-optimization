// Learn more about source functions API at
// https://segment.com/docs/connections/sources/source-functions

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */
async function onRequest(request, settings) {
	// Get request body
	let body = request.json();

	// Confirm that the message was received successfully
	if (body.SmsStatus != 'received') {
		return;
	}

	// Grab user's phone number from the Twilio webhook
	let from = body.From;

	// Create Segment event payload
	let event_payload = {
		event: 'Notification Engaged',
		anonymousId: from,
		properties: { phone: from, channel: 'SMS' }
	};

	// Send Segment event
	Segment.track(event_payload);
}
