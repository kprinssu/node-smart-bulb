var noble = require('noble');

//class to hold all the logic 
function SmartBulb(noble_bulb_interface, write_characteristic, reading_characteristic, friendly_name_characteristic)
{
	this.bulb = noble_bulb_interface;
	this.write_characteristic = write_characteristic;
	this.reading_characteristic = reading_characteristic;
	this.friendly_name_characteristic = friendly_name_characteristic;

	this.brightness_level = 200;
	this.rgb_values = { red: 255, blue: 255, green: 255, hex: 'FFFFFF'};
	this.turned_on = true;

	this.connected = true;
}

//writes data to the smart bulb over BLE
//data must be a Buffer
SmartBulb.prototype.write_data = function(data) {
	this.write_characteristic.write(data, false, function(error) {});

	return { success : 'Data was sent to the bulb.'};
}

//returns true if it is connected to a smart bulb
SmartBulb.prototype.is_connected = function() {
	return this.connected;
}

//keep track of brightness levels
SmartBulb.prototype.set_brightness = function (brightness_level) {
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

	this.brightness_level = brightness_level;
}

SmartBulb.prototype.set_turned_on_off_status = function (status) {
	this.turned_on = (status == true) ? true : false;
}

SmartBulb.prototype.get_turned_on_off_status = function () {
	return this.turned_on;
}

//sends a request status packet to bulb
//the bulb then replies back with the same encoding
SmartBulb.prototype.update_internal_data = function (status_packet) {
	var bulb = this;
	this.reading_characteristic.on('read', function(data, is_notification)
	{
		//check if the first two bytes are "right	"
		if(data[0] == 0x0F && data[1] == 0x0E)
		{
			rgb_values = { red: 255, blue: 255, green: 255, hex: 'FFFFFF'};

			rgb_values.red = data[4];
			rgb_values.green = data[5];
			rgb_values.blue = data[6];

			rgb_values.hex = rgb_to_hex(rgb_values);
			bulb.set_colour(rgb_values);

			bulb.set_brightness(data[7]);
			bulb.set_turned_on_off_status(data[7] != 0);
		}
	});

	this.reading_characteristic.notify(true, function()
	{
		bulb.write_data(status_packet, false, function(error) {});
	});
}


//keep track of colour values
SmartBulb.prototype.set_colour = function (rgb_values) {
	this.rgb_values = rgb_values;
}

//return brightness levels
SmartBulb.prototype.get_brightness = function () {
	return this.brightness_level;
}

//return colour values
SmartBulb.prototype.get_colour = function () {
	return this.rgb_values;
}

//disconnect function
SmartBulb.prototype.disconnect = function() {
	this.bulb.disconnect();

	this.connected = false;
}

//helpers to convert from rgb to hex
function rgb_component_to_hex(component) {
    var hex = component.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgb_to_hex(rgb) {
    return "#" + rgb_component_to_hex(rgb.red) + rgb_component_to_hex(rgb.green) + rgb_component_to_hex(rgb.blue);
}


module.exports = SmartBulb;