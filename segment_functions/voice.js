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

	// Confirm that this is a "call answered" event
	if (body.CallStatus != 'in-progress') {
		return;
	}

	// Grab user's phone number from the Twilio webhook
	let called = body.Called;

	// Create Segment event payload
	let event_payload = {
		event: 'Notification Engaged',
		anonymousId: called,
		properties: { phone: called, channel: 'CALL' }
	};

	// Send Segment event
	Segment.track(event_payload);
}
