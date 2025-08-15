const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config(); // <-- ADD THIS AT THE TOP

const app = express();
const PORT = 8000;
const JWT_SECRET = "your-super-secret-key-that-is-long-and-secure";

// --- Middleware ---
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// --- MongoDB Connection ---
mongoose
  .connect(
    "mongodb+srv://aayushpandya334:mcXov4GN3KFmXbRW@cluster0.jlfivmu.mongodb.net/"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// --- Nodemailer Transporter Setup for GMAIL ---
const transporter = nodemailer.createTransport({
  service: "gmail", // Use the built-in Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from .env file
    pass: process.env.EMAIL_PASS, // Your 16-digit App Password from .env file
  },
});

// --- Mongoose Schemas (No Changes) ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model("Admin", adminSchema);
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: false },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
const festSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    gstNumber: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
const Fest = mongoose.model("Fest", festSchema);
const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);
const Review = mongoose.model("Review", reviewSchema);
const complaintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true }
);
const Complaint = mongoose.model("Complaint", complaintSchema);
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});
const Otp = mongoose.model("Otp", otpSchema);
const tempUserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});
const TempUser = mongoose.model("TempUser", tempUserSchema);

// --- All other code (routes, logic, etc.) remains exactly the same ---
// (The full server code from the previous correct step goes here)
// --- Authentication Middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });
    req.user = decoded;
    next();
  });
};

// --- Helper Function to Send OTP ---
const sendOtpEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"TrendyWare Support" <${process.env.EMAIL_USER}>`, // Use your email from .env
      to: email,
      subject: "Your TrendyWare Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #111;">Verify Your Email Address</h2>
          <p>Thank you for registering with TrendyWare. Please use the following One-Time Password (OTP) to complete your registration:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #C19A6B; background-color: #f8f8f8; padding: 10px 15px; border-radius: 4px; display: inline-block;">${otp}</p>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log("Message sent to your real email: %s", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Could not send OTP email.");
  }
};

// --- Signup Routes ---
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    await TempUser.deleteOne({ email });
    await Otp.deleteOne({ email });

    const tempUser = new TempUser({ name, email, password, role: "user" });
    await tempUser.save();

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const newOtp = new Otp({ email, otp });
    await newOtp.save();
    await sendOtpEmail(email, otp);

    res
      .status(200)
      .json({
        message:
          "OTP sent to your email. Please verify to complete registration.",
      });
  } catch (err) {
    res.status(500).json({ message: "Server error during signup." });
  }
});

app.post("/admin/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists." });
    }

    await TempUser.deleteOne({ email });
    await Otp.deleteOne({ email });

    const tempUser = new TempUser({ email, password, role: "admin" });
    await tempUser.save();

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const newOtp = new Otp({ email, otp });
    await newOtp.save();
    await sendOtpEmail(email, otp);

    res
      .status(200)
      .json({ message: "OTP sent to admin email. Please verify." });
  } catch (err) {
    res.status(500).json({ message: "Server error during admin signup." });
  }
});

// --- OTP Verification Routes ---
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const tempUser = await TempUser.findOne({ email, role: "user" });
    if (!tempUser) {
      return res
        .status(400)
        .json({
          message: "Registration session expired. Please sign up again.",
        });
    }

    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
    });
    await newUser.save();

    await TempUser.deleteOne({ email });
    await Otp.deleteOne({ email });

    res
      .status(201)
      .json({ message: "User created successfully! Please log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error during OTP verification." });
  }
});

app.post("/admin/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const tempUser = await TempUser.findOne({ email, role: "admin" });
    if (!tempUser) {
      return res
        .status(400)
        .json({
          message: "Registration session expired. Please sign up again.",
        });
    }

    const newAdmin = new Admin({
      email: tempUser.email,
      password: tempUser.password,
    });
    await newAdmin.save();

    await TempUser.deleteOne({ email });
    await Otp.deleteOne({ email });

    res
      .status(201)
      .json({ message: "Admin created successfully! Please log in." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error during admin OTP verification." });
  }
});

// --- Login Routes ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = password === user.password;
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token, role: "user" });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = password === admin.password;
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin login successful", token, role: "admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error during admin login" });
  }
});

// --- All other routes (Products, Fests, Complaints, etc.) remain unchanged ---
app.get("/api/admin-products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching admin products" });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching products" });
  }
});
app.post("/api/products", authMiddleware, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.put("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting product" });
  }
});
app.get("/api/fests", async (req, res) => {
  try {
    const fests = await Fest.find()
      .populate("createdBy", "name")
      .sort({ startDate: 1 });
    res.json(fests);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching fests" });
  }
});
app.post("/api/fests", authMiddleware, async (req, res) => {
  const { startDate, endDate } = req.body;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (new Date(startDate) < today) {
    return res
      .status(400)
      .json({ message: "Start date cannot be in the past." });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res
      .status(400)
      .json({ message: "Start date cannot be after the end date." });
  }
  try {
    const newFest = new Fest({ ...req.body, createdBy: req.user.id });
    await newFest.save();
    res.status(201).json(newFest);
  } catch (err) {
    res.status(400).json({ message: "Failed to create fest: " + err.message });
  }
});
app.put("/api/fests/:id", authMiddleware, async (req, res) => {
  try {
    const fest = await Fest.findById(req.params.id);
    if (!fest) return res.status(404).json({ message: "Fest not found" });
    if (fest.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this fest." });
    }
    const updatedFest = await Fest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedFest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.delete("/api/fests/:id", authMiddleware, async (req, res) => {
  try {
    const fest = await Fest.findById(req.params.id);
    if (!fest) return res.status(404).json({ message: "Fest not found" });
    if (fest.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this fest." });
    }
    await Fest.findByIdAndDelete(req.params.id);
    res.json({ message: "Fest deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting fest" });
  }
});
app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});
app.post("/api/admin/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});
app.get("/api/admin/fests", async (req, res) => {
  try {
    const fests = await Fest.find().sort({ startDate: 1 });
    res.json(fests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching fests" });
  }
});
app.post("/api/admin/fests", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date" });
    }
    const newFest = new Fest(req.body);
    const saved = await newFest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.put("/api/admin/fests/:id", async (req, res) => {
  try {
    const updated = await Fest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Fest not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.delete("/api/admin/fests/:id", async (req, res) => {
  try {
    const deleted = await Fest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Fest not found" });
    res.json({ message: "Fest deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting fest" });
  }
});
app.post("/api/fests/:id/upvote", authMiddleware, async (req, res) => {
  try {
    const fest = await Fest.findById(req.params.id);
    if (!fest) return res.status(404).json({ message: "Fest not found" });
    const userId = req.user.id;
    const upvoteIndex = fest.upvotes.findIndex(
      (id) => id.toString() === userId
    );
    if (upvoteIndex > -1) {
      fest.upvotes.splice(upvoteIndex, 1);
    } else {
      fest.upvotes.push(userId);
    }
    await fest.save();
    const populatedFest = await Fest.findById(fest._id).populate(
      "createdBy",
      "name"
    );
    res.json(populatedFest);
  } catch (err) {
    res.status(500).json({ message: "Server error while upvoting" });
  }
});
app.post("/api/orders/create", authMiddleware, async (req, res) => {
  const { products, totalAmount } = req.body;
  const userId = req.user.id;
  if (!products || products.length === 0 || !totalAmount) {
    return res.status(400).json({ message: "Missing order data." });
  }
  try {
    const newOrder = new Order({ userId, products, totalAmount });
    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully!", orderId: newOrder._id });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error while placing order." });
  }
});
app.get("/api/products/:productId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort(
      { createdAt: -1 }
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching reviews" });
  }
});
app.post(
  "/api/products/:productId/reviews",
  authMiddleware,
  async (req, res) => {
    const { rating, comment } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const newReview = new Review({
        productId: req.params.productId,
        userId: req.user.id,
        username: user.name,
        rating,
        comment,
      });
      const savedReview = await newReview.save();
      res.status(201).json(savedReview);
    } catch (err) {
      res
        .status(400)
        .json({ message: "Failed to post review: " + err.message });
    }
  }
);
app.post("/api/complaints", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newComplaint = new Complaint({ name, email, subject, message });
    await newComplaint.save();
    res.status(201).json({ message: "Complaint submitted successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Submission failed: " + err.message });
  }
});
app.get("/api/admin/complaints", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});
app.put("/api/admin/complaints/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Complaint not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
