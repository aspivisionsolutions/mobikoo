const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const PhoneChecker = require("../models/phoneChecker");
const ShopOwner = require("../models/shopOwner");
require("dotenv").config();
const nodemailer = require('nodemailer');

const generateShopOwnerId = async () => {
  const lastShopOwner = await ShopOwner.findOne().sort({ shopOwnerId: -1 });

  let newId;
  if (lastShopOwner && lastShopOwner.shopOwnerId) {
    const lastIdNumber = parseInt(lastShopOwner.shopOwnerId.replace('SP', ''), 10);
    newId = `SP${String(lastIdNumber + 1).padStart(3, '0')}`;
  } else {
    newId = 'SP001';
  }

  return newId;
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ firstName, lastName, email, password: hashedPassword, role });

    if (role === "phone-checker") {
      const pc = new PhoneChecker({ userId: user._id, phoneNumber: "", area: "Your Area" });
      await pc.save();
    } else {
      // Generate shopOwnerId before saving
      const shopOwnerId = await generateShopOwnerId();
      const so = new ShopOwner({
        userId: user._id,
        shopOwnerId,  // Assign generated ID here
        phoneNumber: "",
        shopDetails: { shopName: "Your Shop Name", address: "Your Shop Address" }
      });
      await so.save();
    }

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
// User Login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    console.log(password, user.password)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Check if role matches
    if (role && user.role !== role) {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Request OTP for password reset
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email doesn't exist" });
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h1>Password Reset Request</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully", otp: otp, expiresAt: expiresAt });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user and update password
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    console.log(newPassword)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};
