const express = require('express');
const router = express.Router();
const FlowData = require('../models/flowtrackData');

// GET semua data flow
router.get('/', async (req, res) => {
    try {
        const data = await FlowData.find().populate('device'); // Populate device info
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET flowtrack data by ID
router.get('/:id', async (req, res) => {
    try {
        const flowData = await FlowData.findById(req.params.id).populate('device');
        if (!flowData) return res.status(404).json({ message: 'Data flow tidak ditemukan' });
        res.json(flowData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST data flow baru
router.post('/', async (req, res) => {
    const flowData = new FlowData({
        flowrate: req.body.flowrate,
        volume: req.body.volume,
        device: req.body.device // Link to device
    });

    try {
        const newFlowData = await flowData.save();
        res.status(201).json(newFlowData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update flowtrack data
router.put('/:id', async (req, res) => {
    try {
        const flowData = await FlowData.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!flowData) return res.status(404).json({ message: 'Data flow tidak ditemukan' });
        res.json(flowData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE flowtrack data
router.delete('/:id', async (req, res) => {
    try {
        const flowData = await FlowData.findByIdAndDelete(req.params.id);
        if (!flowData) return res.status(404).json({ message: 'Data flow tidak ditemukan' });
        res.json({ message: 'Data flow dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST untuk menambah banyak data flow
router.post('/bulk', async (req, res) => {
    try {
        const flowDataEntries = await FlowData.insertMany(req.body);
        res.status(201).json(flowDataEntries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET flowtrack data by device ID
router.get('/device/:deviceId', async (req, res) => {
    try {
        const flowData = await FlowData.find({ device: req.params.deviceId }).populate('device');
        if (!flowData || flowData.length === 0) return res.status(404).json({ message: 'Data flow tidak ditemukan untuk device ini' });
        res.json(flowData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
