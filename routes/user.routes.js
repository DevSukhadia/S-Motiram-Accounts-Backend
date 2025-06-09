const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middleware/auth");

const jwt = require("jsonwebtoken");

// POST /api/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const query = `
    SELECT u.USER_ID, u.USERNAME, u.USER_PASSWORD, ur.USER_ROLE_NAME
    FROM USER u, user_role ur
    WHERE u.USER_ROLE_ID = ur.USER_ROLE_ID
    AND u.USER_IS_ACTIVE = 1
    AND u.USERNAME = ?
  `;

  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid username or password." });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.USER_PASSWORD);
    if (!isMatch) return res.status(401).json({ message: "Invalid username or password." });

    const token = jwt.sign(
      { id: user.USER_ID, username: user.USERNAME, role: user.USER_ROLE_NAME },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      username: user.USERNAME,
      role: user.USER_ROLE_NAME,
    });
  });
});

// POST /api/users - Create a new user
router.post("/", verifyToken, authorizeRole("Admin"), async (req, res) => {
  const { username, password, email, roleId, isActive = 1 } = req.body;

  if (!username || !password || !email || !roleId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 1. Check if username already exists
    const checkQuery = `SELECT * FROM USER WHERE USERNAME = ?`;
    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        console.error("Error checking username:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // 2. Proceed to insert
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = `
        INSERT INTO USER (USERNAME, USER_PASSWORD, USER_EMAIL, USER_ROLE_ID, USER_IS_ACTIVE)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertQuery, [username, hashedPassword, email, roleId, isActive], (insertErr, result) => {
        if (insertErr) {
          console.error("Error inserting user:", insertErr);
          return res.status(500).json({ error: "Error creating user" });
        }

        res.status(201).json({ message: "User created successfully" });
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
