const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  artistName: String,
  artistEmail: String,
  showName: String,
  date: String,
  startTime: String,
  endTime: String,
  seatings: Number,
  price: Number,
  venue: String,
  description: String,
  imageUrl: String
});

module.exports = mongoose.models.Show || mongoose.model('Show', showSchema);
