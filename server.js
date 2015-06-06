/*
	Code below is for the RESTful API
	Documentation will *need* to be provided
*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

//enable express to use body-parse to handle POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//get our port
var port = process.env.PORT || 3000;

//routes
var router = express.Router();

router.get('/', function(request, response) {
    response.json({ error: 'Please see the node-bulb-api documentation for proper routes.' });   

    console.log(request)
});

//register routes
app.use('/', router);


//start the server
app.listen(port);
console.log('node-bulb-api server now running on port ' + port);


/*
	Code below is for handling the connection between node and the smart bulb via Bluetooth Low Energy (BLE)
*/
var noble = require('noble');
var async = require('async');

//only scan for BLE devices when bluetooth device is enabled
noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
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
		console.log('Found a Revogi Smart Bulb with UUID ' + peripheral.uuid);
		explore(peripheral)
		noble.stopScanning();
	}
});


function connect(bulb)
{
	bulb.on('disconnect', function() {
    	//start scanning for another bulb
    	noble.startScanning();
	});

	bulb.connect(function(error) {
		bulb.discoverServices([], function(error, services) {

		});

	});
}


function explore(peripheral) {
  console.log('services and characteristics:');

  peripheral.on('disconnect', function() {
    process.exit(0);
  });

  peripheral.connect(function(error) {
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 0;

      async.whilst(
        function () {
          return (serviceIndex < services.length);
        },
        function(callback) {
          var service = services[serviceIndex];
          var serviceInfo = service.uuid;

          if (service.name) {
            serviceInfo += ' (' + service.name + ')';
          }
          console.log(serviceInfo);

          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;

            async.whilst(
              function () {
                return (characteristicIndex < characteristics.length);
              },
              function(callback) {
                var characteristic = characteristics[characteristicIndex];
                var characteristicInfo = '  ' + characteristic.uuid;

                if (characteristic.name) {
                  characteristicInfo += ' (' + characteristic.name + ')';
                }

                async.series([
                  function(callback) {
                    characteristic.discoverDescriptors(function(error, descriptors) {
                      async.detect(
                        descriptors,
                        function(descriptor, callback) {
                          return callback(descriptor.uuid === '2901');
                        },
                        function(userDescriptionDescriptor){
                          if (userDescriptionDescriptor) {
                            userDescriptionDescriptor.readValue(function(error, data) {
                              if (data) {
                                characteristicInfo += ' (' + data.toString() + ')';
                              }
                              callback();
                            });
                          } else {
                            callback();
                          }
                        }
                      );
                    });
                  },
                  function(callback) {
                        characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                    if (characteristic.properties.indexOf('read') !== -1) {
                      characteristic.read(function(error, data) {
                        if (data) {
                          var string = data.toString('ascii');

                          characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                        }
                        callback();
                      });
                    } else {
                      callback();
                    }
                  },
                  function() {
                    console.log(characteristicInfo);
                    characteristicIndex++;
                    callback();
                  }
                ]);
              },
              function(error) {
                serviceIndex++;
                callback();
              }
            );
          });
        },
        function (err) {
        	console.log(err)
          peripheral.disconnect();
        }
      );
    });
  });
}

