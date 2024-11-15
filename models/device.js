const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    kebun: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kebun',
        required: true
    }
});

module.exports = mongoose.model('Device', deviceSchema);
