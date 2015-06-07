/*
	Code below is for the RESTful API
	Documentation will *need* to be provided
*/
var smart_bulb = require('./smart_bulb_controller');

var express = require('express');
var app = express();
var body_parser = require('body-parser');

//enable express to use body-parse to handle POST data
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

//get our port
var port = process.env.PORT || 3000;

//routes
var router = express.Router();

app.use('/', express.static('client'));

router.get('/api', function(request, response) {
    response.json({ error: 'Please see the node-bulb-api documentation for proper routes.' });
});


router.route('/api/bulbs').get(function(request, response)
{
	response.json(smart_bulb_controller_instance.list_all_bulbs());
});


router.route('/api/bulbs/:bulb_id').get(function(request, response)
{
	//GET
	response.json(smart_bulb_controller_instance.get_bulb(request.params.bulb_id));
}).put(function(request, response)
{
	//PUT
	var bulb_id = request.params.bulb_id;
	var hex_colour = request.body.hex_colour;
	var brightness_level = request.body.brightness;
	var turn_on = request.body.turn_on;
	
	var bulb = smart_bulb_controller_instance.get_bulb(bulb_id);

	if(!bulb)
	{
		response.json({ error: "The bulb was not found. "});
		return;
	}

	//only change the state of the bulb if it is 'different from the previous state'
	if(turn_on != bulb.turn_on)
	{
		if(turn_on == 'true')
		{
			smart_bulb_controller_instance.turn_on(bulb_id);
		}
	 	else
		{
			smart_bulb_controller_instance.turn_off(bulb_id);
			//do not turn the light on again, so return!
			return;
		}
	}

 	if(hex_colour && brightness_level)
	{
		smart_bulb_controller_instance.set_colour_and_brightness(bulb_id, hex_colour, brightness_level);
	}
	else if(hex_colour)
	{

		smart_bulb_controller_instance.set_colour(bulb_id, hex_colour);
	}
	else if(brightness_level)
	{
		smart_bulb_controller_instance.set_brightness(bulb_id, brightness_level);
	}

	response.json(smart_bulb_controller_instance.get_bulb(bulb_id));


}).delete(function(request, response)
{
	//DELETE
	var bulb_id = request.params.bulb_id;
	smart_bulb_controller_instance.disconnect_from_bulb(bulb_id);
});

//register routes
app.use('/', router);

//clean bluetooth connections by disconnecting
var already_disconnected = false;
function cleanup_bulb_connections(options, err) {
	
	if(already_disconnected)
	{
		return;
	}
	already_disconnected = true;

	console.log("Server now shutting down, closing all bulb bluetooth connections...");
	var bulbs = smart_bulb_controller_instance.list_all_bulbs().bulb_ids;

	bulbs.forEach(function (bulb_id)
	{
		smart_bulb_controller_instance.disconnect_from_bulb(bulb_id);
	});

	process.exit();
}

//do something when app is closing
process.on('exit', cleanup_bulb_connections.bind(null, null));

//catches ctrl+c event
process.on('SIGINT', cleanup_bulb_connections.bind(null, null));

//catches uncaught exceptions
process.on('uncaughtException', cleanup_bulb_connections.bind(null, null));


//start the server
app.listen(port);
console.log('node-bulb-api server now running on port ' + port);