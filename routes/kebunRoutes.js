const express = require('express');
const router = express.Router();
const Kebun = require('../models/kebun');
const bcrypt = require('bcrypt');

// GET semua kebun
router.get('/', async (req, res) => {
    try {
        const kebuns = await Kebun.find().populate('devices'); // Populate devices info
        res.json(kebuns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET kebun by ID
router.get('/:id', async (req, res) => {
    try {
        const kebun = await Kebun.findById(req.params.id).populate('devices');
        if (!kebun) return res.status(404).json({ message: 'Kebun tidak ditemukan' });
        res.json(kebun);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST kebun baru
router.post('/', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);  // Hash password

    const kebun = new Kebun({
        name: req.body.name,
        location: req.body.location,
        password: hashedPassword  // Gunakan hashed password
    });

    try {
        const newKebun = await kebun.save();
        res.status(201).json(newKebun);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update kebun
router.put('/:id', async (req, res) => {
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);  // Hash password jika diupdate
    }

    try {
        const kebun = await Kebun.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!kebun) return res.status(404).json({ message: 'Kebun tidak ditemukan' });
        res.json(kebun);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE kebun
router.delete('/:id', async (req, res) => {
    try {
        const kebun = await Kebun.findByIdAndDelete(req.params.id);
        if (!kebun) return res.status(404).json({ message: 'Kebun tidak ditemukan' });
        res.json({ message: 'Kebun dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST untuk menambah banyak kebun
router.post('/bulk', async (req, res) => {
    try {
        const kebuns = await Kebun.insertMany(req.body);
        res.status(201).json(kebuns);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// POST login kebun
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Cari kebun berdasarkan nama
        const kebun = await Kebun.findOne({ name });
        if (!kebun) {
            return res.status(404).json({ message: 'Kebun tidak ditemukan' });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, kebun.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // Jika berhasil login, kirimkan informasi kebun
        res.status(200).json({ 
            message: 'Login berhasil', 
            kebun: {
                id: kebun._id,
                name: kebun.name,
                location: kebun.location
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
