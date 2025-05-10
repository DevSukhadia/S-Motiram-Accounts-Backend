const express = require("express");
const db = require("../db");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middleware/auth");

// GET /api/roles - Fetch all roles
router.get("/", verifyToken, async (req, res) => {
  db.query("SELECT * FROM USER_ROLE", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch roles" });
    res.json(results);
  });
});

module.exports = router;
