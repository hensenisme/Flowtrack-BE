const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mqtt = require('mqtt');
const FlowtrackData = require('./models/flowtrackData'); // Import model FlowtrackData

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Import Routes
const flowtrackDataRoutes = require('./routes/flowtrackDataRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const kebunRoutes = require('./routes/kebunRoutes');

// Middleware routes
app.use('/api/flowtrackData', flowtrackDataRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/kebuns', kebunRoutes);

// MQTT Setup
const brokerUrl = process.env.MQTT_BROKER_URL;
const client = mqtt.connect(brokerUrl);

// Format topik
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('main/status/flowtrack/+', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        } else {
            console.log('Subscribed to topic pattern: main/status/flowtrack/+');
        }
    });
});

client.on('message', async (topic, message) => {
    // Update regex for new topic structure
    const topicRegex = /^main\/status\/flowtrack\/(\w+)$/;
    const match = topic.match(topicRegex);

    if (match) {
        // const kebunId = match[1];
        const deviceId = match[1];

        try {
            // // Parse the JSON message
            // const data = JSON.parse(message.toString());
            // const { flowrate, volume } = data;

            // // Create new FlowtrackData document
            // const flowData = new FlowtrackData({
            //     flowrate,
            //     volume,
            //     device: deviceId, // Link data to the correct device
            // });

            const data = JSON.parse(message.toString());

          // Extract relevant data from the nested objects
            const deviceName = data.info.device_name;
            // const firmVer = data.info.firm_ver; // Likely commented out
            // const kodeKebun = data.info.kode_kebun;
            const wifiName = data.info.wifi_name;
            // const wifiPass = data.info.wifi_pass; // Likely commented out
            const wifiSignal = data.info.wifi_signal;
            // const ip = data.info.ip;
            // const mac = data.info.mac;
            // const gmt = data.info.gmt;
            // const date = data.info.date;
            // const time = data.info.time;
            const volume = data.sensor.volume;
            const flowrate = data.sensor.flowRate;
            const timestamp = data.sensor.timestamp;
        
          // Create a new FlowtrackData document with relevant data
            const flowData = new FlowtrackData({
                deviceName,
                // firmVer, // Likely commented out
                // kodeKebun,
                wifiName,
                // wifiPass, // Likely commented out
                wifiSignal,
                // ip,
                // mac,
                // gmt,
                // date,
                // time,
                volume,
                flowrate,
                timestamp,
                device: deviceId, // Link data to the correct device
              });

            await flowData.save();
            console.log(`Data saved to MongoDB for device ${deviceId}:`, data);
          } catch (err) {
            console.error('Failed to save data to MongoDB:', err);
        }
    } else {
        console.warn('Received message on unhandled topic:', topic);
    }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
