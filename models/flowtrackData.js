const mongoose = require('mongoose');

const flowDataSchema = new mongoose.Schema({
    flowrate: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    }
});

module.exports = mongoose.model('FlowtrackData', flowDataSchema);
