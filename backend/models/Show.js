const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  artistName: String,
  showName: String,
  date: String,
  startTime: String,
  endTime: String,
  seatings: Number,
  price: Number,
  venue: String,
  description: String
});

module.exports = mongoose.model('Show', showSchema);
