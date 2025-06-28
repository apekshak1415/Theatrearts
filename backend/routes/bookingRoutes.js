const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Show = require("../models/Show");

// Dummy payment simulation function
function processPayment(email, amount) {
  console.log(`Processing payment of ₹${amount} for ${email}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("✅ Payment processed");
      resolve(true); // Always success in this dummy
    }, 1000);
  });
}

// Book a show (with dummy payment)
router.post("/", async (req, res) => {
  try {
    console.log("📥 Booking request body:", req.body);

    const { name, email, showId, seats } = req.body;

    if (!name || !email || !showId || !seats) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    if (seats > show.seatings) {
      return res.status(400).json({ error: "Not enough seats available" });
    }

    // Simulate payment (dummy)
    const paymentSuccess = await processPayment(email, show.price * seats);
    if (!paymentSuccess) {
      return res.status(500).json({ error: "Payment failed" });
    }

    // Reduce available seats
    show.seatings -= seats;
    await show.save();

    // Save booking
    const booking = new Booking({ name, email, showId, seats });
    await booking.save();

    res.status(201).json({ message: "Booking successful!" });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({ error: "Booking failed due to server error" });
  }
});

// Get all bookings of a user
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const bookings = await Booking.find({ email }).populate("showId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Fetch bookings error:", err);
    res.status(500).json({ error: "Error fetching bookings" });
  }
});


// Get all bookings (admin)
router.get("/all", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("showId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Error fetching all bookings:", err);
    res.status(500).json({ error: "Server error while fetching all bookings" });
  }
});
// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting booking" });
  }
});

// PUT (Edit) booking
router.put("/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating booking" });
  }
});



router.get("/artist-bookings", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Artist email is required" });

    const shows = await Show.find({ artistEmail: email });

    const showIds = shows.map(show => show._id);
    const bookings = await Booking.find({ showId: { $in: showIds } }).populate("showId");

    res.json(bookings);
  } catch (err) {
    console.error("❌ Artist bookings fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
