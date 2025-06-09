const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/categories?type=EXPENSE or INCOME (mandatory)
router.get("/", verifyToken, (req, res) => {
  const { type } = req.query;

  // Validate presence and correctness of type
  if (!type || !["INCOME", "EXPENSE"].includes(type.toUpperCase())) {
    return res.status(400).json({ error: "Query parameter 'type' must be 'INCOME' or 'EXPENSE'" });
  }

  const query = "SELECT * FROM CATEGORY WHERE CATEGORY_TYPE = ?";
  db.query(query, [type.toUpperCase()], (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Failed to load categories" });
    }

    res.json(results);
  });
});

module.exports = router;
