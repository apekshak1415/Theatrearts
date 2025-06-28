const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const User = require("./models/User"); // 👈 Import User model

const app = express();
const PORT = 3000;
const Booking = require("./models/Booking");

const bookingRoutes = require("./routes/bookingRoutes");


// Middleware
app.use(cors({
  origin: "*",  // Allow all origins — for development only
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.use("/api/bookings", bookingRoutes);

// Serve uploaded images from "uploads/" directory
app.use("/uploads", express.static("uploads"));  // ← Important!


// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/ticketing")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  // ===== Multer Config =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ===== Admin Schema =====
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const Admin = mongoose.model("Admin", adminSchema);

// ===== Show Schema =====
const Show = require("./models/Show");


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
app.post("/api/shows", upload.single("image"), async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);    // 👈 Add this
    console.log("REQ FILE:", req.file);    // 👈 And this

    const showData = req.body;
    showData.imageUrl = req.file ? req.file.filename : "";

    // Cast numeric fields
    showData.seatings = Number(showData.seatings);
    showData.price = Number(showData.price);

    const newShow = new Show(showData);
    const savedShow = await newShow.save();
    res.status(201).json(savedShow);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);   // 👈 This too, for debugging
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

// Fetch shows by artist email
app.get("/api/artist/shows", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const shows = await Show.find({ artistEmail: email });

    res.status(200).json(shows);
  } catch (err) {
    console.error("Error fetching artist shows:", err);
    res.status(500).json({ error: "Server error fetching shows" });
  }
});

// Change password for artist
app.post("/api/artist/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const artist = await Artist.findOne({ email });
    if (!artist) return res.status(404).json({ error: "Artist not found" });

    const isMatch = await bcrypt.compare(currentPassword, artist.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    artist.password = hashedNewPassword;
    await artist.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Server error changing password" });
  }
});
// ===== USER SIGNUP =====
app.post("/api/user/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User account created successfully!" });
  } catch (err) {
    console.error("User signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ===== USER LOGIN =====
app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error("User login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});
// ===== Get User Profile =====
app.get("/api/user/profile", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Change Password =====
app.post("/api/user/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Server error changing password" });
  }
});

app.get("/api/users", async (req, res) => {
  const users = await User.find(); // assuming Mongoose
  res.json(users);
});




// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});