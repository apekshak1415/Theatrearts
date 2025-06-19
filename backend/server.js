const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/ticketing")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===== Admin Schema =====
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const Admin = mongoose.model("Admin", adminSchema);

// ===== Show Schema =====
const showSchema = new mongoose.Schema({
  artistName: String,
  showName: String,
  date: String,
  startTime: String,
  endTime: String,
  seatings: Number,
  price: Number,
  venue: String,
  description: String,
});

const Show = mongoose.model("Show", showSchema);

// ===== ADMIN ROUTES =====

// Signup
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// ===== SHOW ROUTES =====
app.post("/api/shows", async (req, res) => {
  try {
    const newShow = new Show(req.body);
    const savedShow = await newShow.save();
    res.status(201).json(savedShow);
  } catch (err) {
    res.status(500).json({ error: "Failed to create show" });
  }
});

app.get("/api/shows", async (req, res) => {
  try {
    const shows = await Show.find();
    res.status(200).json(shows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shows" });
  }
});

app.put("/api/shows/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedShow = await Show.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedShow);
  } catch (err) {
    res.status(500).json({ error: "Failed to update show" });
  }
});

app.delete("/api/shows/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShow = await Show.findByIdAndDelete(id);
    if (!deletedShow) return res.status(404).json({ error: "Show not found" });
    res.status(200).json({ message: "Show deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete show" });
  }
});

// ===== Admin List Route =====
app.get("/api/admins", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});



// ===== Artist Schema =====
const artistSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const Artist = mongoose.model("Artist", artistSchema);

// ===== Artist Signup =====
app.post("/api/artist/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
     

    const existing = await Artist.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newArtist = new Artist({ name, email, password: hashedPassword });
    await newArtist.save();

    res.status(201).json({ message: "Artist account created successfully!" });
  } catch (err) {
    console.error("Artist signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ===== Artist Login =====
app.post("/api/artist/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const artist = await Artist.findOne({ email });
    if (!artist) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, artist.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error("Artist login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ===== Admin can view all artists =====
app.get("/api/artists", async (req, res) => {
  try {
    const artists = await Artist.find(); 
    res.status(200).json(artists);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});
// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});