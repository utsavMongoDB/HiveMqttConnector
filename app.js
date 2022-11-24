const express = require('express')
const app = express()
var mqtt = require("mqtt");
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const bodyParser = require('body-parser');

const port = 8080

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true })); 
app.get('/', (req, res) => {
    res.render('connectedPage')
})

app.post('/connect', (req, res) => {
    console.log("Request Hostname" ,req.body.host)
    connectionData = req.body
    const TOPIC = connectionData.topic //"test_sub"
    const connectionString = connectionData.connectionString //'HostName=iiotdemo.azure-devices.net;DeviceId=iiot-demo-device;SharedAccessKey=DMU9/e2fieif1AFiER6dv/KMBqvRwPW97MjZTpPgrr8=';

    var options = {
        host: connectionData.host,// "f1c1fba3af154c0ab45d23438110bc15.s2.eu.hivemq.cloud",
        port: connectionData.port, //"8883",
        protocol: "mqtts",
        username: connectionData.username, //"utsav.talwar@mongodb.com",
        password: connectionData.password //"test12345",
    };

    //initialize the MQTT client
    var client_mqtt = mqtt.connect(options);
    var client_iot = Client.fromConnectionString(connectionString, Protocol);

    //setup the callbacks
    client_mqtt.on("connect", function () {
        // res.render('connectedPage')
        res.status(200).send("MQTT connection established. Ready to recieve messages!")
        // Subscribe to topic 
        client_mqtt.subscribe(TOPIC);
        // Send message to IOT Hub
        client_mqtt.on('message', function (topic, payload) {
            var message = new Message(payload);
            console.log(message.toString())
            console.log('Sending message: ' + payload);
            // Send data to Iot Hub
            client_iot.sendEvent(message, function (err) {
                if (err) {
                    console.error('Failed to send message to Azure IoT Hub');
                } else {
                    console.log('Message sent to Azure IoT Hub');
                }
            });
        })

        client_mqtt.on("error", function (error) {
            // res.render('errorPage')
            return error;
        });
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
