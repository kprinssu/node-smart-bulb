var noble = require('noble');

//class to hold all the logic 
function SmartBulb(noble_bulb_interface, write_characteristic, friendly_name_characteristic)
{
	this.bulb = noble_bulb_interface;
	this.write_characteristic = write_characteristic;
	this.friendly_name_characteristic = friendly_name_characteristic;

	this.brightness_level = 200;
	this.rgb_values = {};

	this.connected = true;
}

//writes data to the smart bulb over BLE
//data must be a Buffer
SmartBulb.prototype.write_data = function(data) {
	this.write_characteristic.write(data, false, function(error) {});
}

//returns true if it is connected to a smart bulb
SmartBulb.prototype.is_connected = function() {
	return this.connected;
}

//keep track of brightness levels
SmartBulb.prototype.set_brightness = function (brightness_level) {
	this.brightness_level = brightness_level;
}

//keep track of colour values
SmartBulb.prototype.set_rgb_values = function (rgb_values) {
	this.rgb_values = rgb_values;
}

//return brightness levels
SmartBulb.prototype.get_brightness = function () {
	return this.brightness_level;
}

//return colour values
SmartBulb.prototype.get_rgb_values = function () {
	return this.rgb_values;
}

//disconnect function
SmartBulb.prototype.disconnect = function() {
	this.bulb.close();

	this.connected = false;
}




module.exports = SmartBulb;