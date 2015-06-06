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

router.get('/', function (request, response)
{

});

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
	var hex_colour = request.body.colour;
	var brightness_level = request.body.brightness;
	var on_off_status = request.body.turn_off;

	if(on_off_status == true)
	{
		return smart_bulb_controller_instance.turn_off(bulb_id);
	}
	else if(on_off_status == false)
	{
		return smart_bulb_controller_instance.turn_off(bulb_id);
	}

	if(hex_colour && brightness_level)
	{
		return smart_bulb_controller_instance.set_colour_and_brightness(bulb_id, hex_colour, brightness_level);
	}
	else if(hex_colour)
	{
		return smart_bulb_controller_instance.set_colour(bulb_id, hex_colour);
	}
	else if(brightness_level)
	{
		return smart_bulb_controller_instance.set_brightness(bulb_id, brightness_level);
	}

}).delete(function(request, response)
{
	//DELETE
	var bulb_id = request.params.bulb_id;
	smart_bulb_controller_instance.disconnect_from_bulb(bulb_id);
});

//register routes
app.use('/', router);


//start the server
app.listen(port);
console.log('node-bulb-api server now running on port ' + port);