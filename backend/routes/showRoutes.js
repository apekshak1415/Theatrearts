const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Show = require('../models/Show');

// Multer config for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route to handle show upload
router.post('/api/shows', upload.single('image'), async (req, res) => {
  try {
    const {
      artistName,
      artistEmail,
      showName,
      date,
      startTime,
      endTime,
      seatings,
      price,
      venue,
      description,
    } = req.body;

    const newShow = new Show({
      artistName,
      artistEmail,
      showName,
      date,
      startTime,
      endTime,
      seatings,
      price,
      venue,
      description,
      imageUrl: req.file.filename,
    });

    await newShow.save();
    res.status(201).json({ message: 'Show added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all shows
router.get('/api/artist/shows', async (req, res) => {
  try {
    const { email } = req.query;
    const shows = await Show.find({ artistEmail: email }).sort({ date: 1 });
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching shows' });
  }
});

module.exports = router;
