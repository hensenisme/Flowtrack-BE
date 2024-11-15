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
const brokerUrl = 'mqtt://192.168.1.55'; // IP server MQTT
const client = mqtt.connect(brokerUrl);

// Format topik: kebun/{kebunId}/device/{deviceId}/data
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('kebun/+/device/+/data', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        } else {
            console.log('Subscribed to topic pattern: kebun/+/device/+/data');
        }
    });
});

client.on('message', async (topic, message) => {
    // Extract kebunId and deviceId from the topic using regex
    const topicRegex = /^kebun\/(\w+)\/device\/(\w+)\/data$/;
    const match = topic.match(topicRegex);

    if (match) {
        const kebunId = match[1];
        const deviceId = match[2];

        try {
            // Parse the JSON message
            const data = JSON.parse(message.toString());
            const { flowrate, volume } = data;

            // Create new FlowtrackData document
            const flowData = new FlowtrackData({
                flowrate,
                volume,
                device: deviceId, // Link data to the correct device
            });

            await flowData.save();
            console.log(`Data saved to MongoDB for device ${deviceId} in kebun ${kebunId}:`, data);
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
