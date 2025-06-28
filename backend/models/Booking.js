const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
  },
  seats: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
