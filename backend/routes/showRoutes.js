const express = require('express');
const router = express.Router();
const Show = require('../models/Show');

router.post('/', async (req, res) => {
  try {
    const newShow = new Show(req.body);
    await newShow.save();
    res.status(201).json({ message: 'Show added' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const shows = await Show.find().sort({ date: 1 });
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching shows' });
  }
});

module.exports = router;
