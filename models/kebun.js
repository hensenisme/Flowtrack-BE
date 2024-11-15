const mongoose = require('mongoose');

const kebunSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    password: {  // Tambahkan field password
        type: String,
        required: true
    },
    devices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device'
    }]
});

module.exports = mongoose.model('Kebun', kebunSchema);
