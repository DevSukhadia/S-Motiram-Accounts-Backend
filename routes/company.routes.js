const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/companies - Get companies for the logged-in user
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT C.COMPANY_ID, C.COMPANY_NAME
    FROM COMPANY C
    JOIN USER_COMPANY UC ON C.COMPANY_ID = UC.COMPANY_ID
    WHERE UC.USER_ID = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching companies:", err);
      return res.status(500).json({ error: "Failed to fetch companies" });
    }

    res.json(results);
  });
});

module.exports = router;
