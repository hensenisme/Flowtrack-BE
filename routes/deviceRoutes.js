const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const Kebun = require('../models/kebun');

// GET semua device
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find().populate('kebun'); // Populate kebun info
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET device by ID
router.get('/:id', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id).populate('kebun');
        if (!device) return res.status(404).json({ message: 'Device tidak ditemukan' });
        res.json(device);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST device baru
router.post('/', async (req, res) => {
    const device = new Device({
        name: req.body.name,
        kebun: req.body.kebun // Link to kebun
    });

    try {
        const newDevice = await device.save();
        // Tambahkan device ke kebun yang sesuai
        await Kebun.findByIdAndUpdate(req.body.kebun, { $push: { devices: newDevice._id } });
        res.status(201).json(newDevice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update device
router.put('/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!device) return res.status(404).json({ message: 'Device tidak ditemukan' });
        res.json(device);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE device
router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Device tidak ditemukan' });

        // Remove device reference from the associated kebun
        await Kebun.findByIdAndUpdate(device.kebun, { $pull: { devices: device._id } });

        // Delete the device
        await Device.findByIdAndDelete(req.params.id);
        res.json({ message: 'Device dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST untuk menambah banyak device
router.post('/bulk', async (req, res) => {
    try {
        const devices = await Device.insertMany(req.body);
        // Tambahkan setiap device ke kebun yang sesuai
        await Promise.all(devices.map(device => Kebun.findByIdAndUpdate(device.kebun, { $push: { devices: device._id } })));
        res.status(201).json(devices);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET devices by Kebun ID
router.get('/kebun/:kebunId', async (req, res) => {
    try {
        const devices = await Device.find({ kebun: req.params.kebunId }).populate('kebun');
        if (devices.length === 0) return res.status(404).json({ message: 'Tidak ada device ditemukan untuk kebun ini' });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
