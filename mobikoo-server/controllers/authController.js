const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const PhoneChecker = require("../models/phoneChecker");
const ShopOwner = require("../models/shopOwner");
require("dotenv").config();

// User Signup
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash Password

    // Create new user
    user = new User({ firstName, lastName, email, password, role });
    
    if (role === "phone-checker") {
      const pc = new PhoneChecker({ userId: user._id, phoneNumber: "", area: "Your Area" });
      await pc.save();
    } else {
      const so = new ShopOwner({ userId: user._id, phoneNumber: "", shopDetails: {shopName:"Your Shop Name",address:"Your Shop Address"} });
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
