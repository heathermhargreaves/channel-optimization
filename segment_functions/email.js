// Learn more about source functions API at
// https://segment.com/docs/connections/sources/source-functions

/**
 * Handle incoming HTTP request
 *
 * @param  {FunctionRequest} request
 * @param  {FunctionSettings} settings
 */
async function onRequest(request, settings) {
	// Grab the request body
	let body = request.json()[0];

	// Confirm that this is an 'email open' event
	if (body.event != 'open') {
		return;
	}

	// Grab user's email from the Twilio webhook
	let email = body.email;

	// Create Segment event payload
	let event_payload = {
		event: 'Notification Engaged',
		anonymousId: email,
		properties: { email: email, channel: 'EMAIL' }
	};

	// Send Segment event
	Segment.track(event_payload);
}
