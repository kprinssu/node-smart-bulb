/*
	Code below is for handling the connection between node and the smart bulb via Bluetooth Low Energy (BLE)
*/
var SmartBulb = require('./smart_bulb');
var noble = require('noble');

//Controller class
function SmartBulbController() {
	this.connected_smart_bulbs = {};
}

//adds a bulb to the connected smart bulbs list
SmartBulbController.prototype.add_bulb = function(bulb_id, smart_bulb)
{
	this.connected_smart_bulbs[bulb_id] = smart_bulb;

	this.status_packet_buffer = new Buffer('0F050400000005FFFF', 'hex');
}

//returns a json object representing if the bulb disconnected or not
SmartBulbController.prototype.disconnect_from_bulb = function(bulb_id)
{
	var bulb = this.connected_smart_bulbs[bulb_id]

	bulb.disconnect();
	return { success: 'Smart bulb was disconnected.' };
}

//returns an array of uuids of the bulbs that we are connected to
//see Reference_Packets.txt on how packets are formatted
SmartBulbController.prototype.list_all_bulbs = function() {
	return { bulb_ids: Object.keys(this.connected_smart_bulbs) };
}

//returns an object representing a bulb
SmartBulbController.prototype.get_bulb = function(bulb_id) {
	var bulb = this.connected_smart_bulbs[bulb_id]

	if(bulb)
	{
		var sanitized_bulb_obj = {};
		sanitized_bulb_obj.hex_colour = bulb.get_colour().hex;
		sanitized_bulb_obj.brightness = bulb.get_brightness();
		sanitized_bulb_obj.turn_on = bulb.get_turned_on_off_status();

		return sanitized_bulb_obj;
	}
	else
	{
		return { error: "Bulb with id " + bulb_id + " was does not exist!" }; 
	}
}


//turns off the bulb
SmartBulbController.prototype.turn_off = function(bulb_id) {
	var bulb = this.connected_smart_bulbs[bulb_id];

	bulb.set_turned_on_off_status(false);

	return this.set_brightness(bulb_id, 0);
}

//turns on the bulb
SmartBulbController.prototype.turn_on = function(bulb_id) {
	var bulb = this.connected_smart_bulbs[bulb_id];

	bulb.set_turned_on_off_status(true);

	return this.set_brightness(bulb_id, 200);
}

SmartBulbController.prototype.update_bulb_status = function(bulb_id) {        
	var bulb = this.connected_smart_bulbs[bulb_id];

	bulb.update_internal_data(this.status_packet_buffer);
}

//sets a colour for the bulb
SmartBulbController.prototype.set_colour = function(bulb_id, hex_colour) {
	var bulb = this.connected_smart_bulbs[bulb_id];

	var rgb_values = hex_to_rgb(hex_colour);
	var brightness_level = bulb.get_brightness();

	return this.set_colour_and_brightness(bulb_id, rgb_values.hex, brightness_level);
}

//sets the brightness for the bulb
SmartBulbController.prototype.set_brightness = function(bulb_id, brightness_level) {
	var bulb = this.connected_smart_bulbs[bulb_id];

	var rgb_values = bulb.get_colour();

	return this.set_colour_and_brightness(bulb_id, rgb_values.hex, brightness_level);
}

//sets the colour and brightness
SmartBulbController.prototype.set_colour_and_brightness = function(bulb_id, hex_colour, brightness_level) {
	var rgb_values = hex_to_rgb(hex_colour);

	var bulb = this.connected_smart_bulbs[bulb_id];

	bulb.set_brightness(brightness_level);
	bulb.set_colour(rgb_values);


	//validation for brightness levels
	//values range from 0 to 200
	if(brightness_level < 0)
	{
		brightness_level = 0;
	}
	else if(brightness_level > 200)
	{
		brightness_level = 200;
	}

	var raw_buffer = new Buffer(17);

	raw_buffer[0] = 0x0F; //15
	raw_buffer[1] = 0x0D; //13
	raw_buffer[2] = 0x03; //3
	raw_buffer[3] = 0x00; //empty?

	//RGB and brightness
	raw_buffer[4] = rgb_values.red;
	raw_buffer[5] = rgb_values.green;
	raw_buffer[6] = rgb_values.blue;
	raw_buffer[7] = brightness_level;

	//x and y coords
	//no idea what this does, seems like it is related to the multiple bulb lightning?
    raw_buffer[8] = 0x02;
    raw_buffer[9] = 0xD1;
    raw_buffer[10] = 0x01;
    raw_buffer[11] = 0x66;

    //last 2 bytes are always 0xFF
    raw_buffer[15] = 0xFF;
    raw_buffer[16] = 0xFF;

    //verification byte
    raw_buffer[14] = 0x01; //start off as 1
    for(var i = 2; i < 14; i++)
    {
    	raw_buffer[14] += raw_buffer[i];
    }

	bulb.write_data(raw_buffer);

	return this.get_bulb(bulb_id);
}

//singleton approach for the controller
smart_bulb_controller_instance = new SmartBulbController();

//smaller helper function to convert hex to rgb values
function hex_to_rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
        hex: hex
    } : null;
}

//do not touch the functions below unless you know what you are doing
//functions below pretain to automatic find/connect of smart bulbs

//only scan for BLE devices when bluetooth device is enabled
noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		console.log('Now scanning for Smart Bulbs....');
		noble.startScanning();
	} 
	else {
		noble.stopScanning();
	}
});

//connection handler
noble.on('discover', function(peripheral) {
	var advertising_name = peripheral.advertisement.localName;

	//only get our bulbs (all bulbs start with the name DELIGHT)
	if(advertising_name == 'DELIGHT')
	{
		console.log('Found a Revogi Smart Bulb with id ' + peripheral.uuid);
		noble.stopScanning();
		connect_to_bulb(peripheral);
		
	}
});

//connect to a smart bulb
function connect_to_bulb(bulb)
{
	bulb.on('disconnect', function() {
    	//start scanning for another bulb
    	noble.startScanning();
	});

	bulb.connect(function(error) {
		console.log('Connected to bulb with id ' + bulb.uuid);

		bulb.discoverServices(['fff0'], function(error, services)
		{
			var main_service = services[0];
			main_service.discoverCharacteristics(['fff3', 'fff4', 'fff6'], function(error, characteristics)
			{
				//get the write characteristic
				var write_characteristic = characteristics[0];

				//reading characteristic
				var reading_characteristic = characteristics[1];

				//useful later?
				var friendly_name_characteristic = characteristics[2];

				//add the bulb for tracking 
				var smart_bulb = new SmartBulb(bulb, write_characteristic, reading_characteristic, friendly_name_characteristic);
				smart_bulb_controller_instance.add_bulb(bulb.uuid, smart_bulb);
				smart_bulb_controller_instance.update_bulb_status(bulb.uuid);


				console.log('Now tracking smart bulb with id ' + bulb.uuid);

				//start scanning for more bulbs
				noble.startScanning();
			});
		});
	});
}
