const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware/auth");

const { DateTime } = require("luxon");
// Get today's date in IST (YYYY-MM-DD)
const istDateTime = DateTime.now().setZone("Asia/Kolkata").toFormat("yyyy-MM-dd HH:mm:ss");


// ✅ POST /api/transactions — Add a new transaction
router.post("/", verifyToken, (req, res) => {
    const {
        companyId,
        transactionType,
        categoryId,
        amount,
        tax = 0,
        description
        } = req.body;

    const userId = req.user.id;

    const insertQuery = `
    INSERT INTO TRANSACTION (
        COMPANY_ID, TRANSACTION_TYPE, CATEGORY_ID, AMOUNT, TAX, DESCRIPTION, TRANSACTION_DATE, USER_ID
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
    insertQuery,
    [companyId, transactionType, categoryId, amount, tax, description, istDateTime, userId],
    (err, result) => {
        if (err) {
        console.error("Error inserting transaction:", err);
        return res.status(500).json({ error: "Database insert failed" });
        }

        res.status(201).json({ message: "Transaction recorded successfully" });
    }
    );
});

// ✅ GET /api/transactions/summary/:companyId — Monthly Summary
router.get("/summary/:companyId", verifyToken, (req, res) => {
  const companyId = req.params.companyId;

  const summaryQuery = `
    SELECT 
      TRANSACTION_TYPE,
      SUM(AMOUNT) AS total_amount,
      SUM(TAX) AS total_tax
    FROM TRANSACTION
    WHERE COMPANY_ID = ?
      AND MONTH(TRANSACTION_DATE) = MONTH(CURRENT_DATE())
      AND YEAR(TRANSACTION_DATE) = YEAR(CURRENT_DATE())
    GROUP BY TRANSACTION_TYPE
  `;

  db.query(summaryQuery, [companyId], (err, results) => {
    if (err) {
      console.error("Error fetching summary:", err);
      return res.status(500).json({ error: "Failed to fetch summary" });
    }

    const summary = {
      income: { total: 0, tax: 0 },
      expense: { total: 0, tax: 0 }
    };

    results.forEach(row => {
      if (row.TRANSACTION_TYPE === "INCOME") {
        summary.income.total = row.total_amount;
        summary.income.tax = row.total_tax;
      } else if (row.TRANSACTION_TYPE === "EXPENSE") {
        summary.expense.total = row.total_amount;
        summary.expense.tax = row.total_tax;
      }
    });

    res.json(summary);
  });
});

router.get("/list/:companyId", verifyToken, (req, res) => {
  const companyId = req.params.companyId;
  const userId = req.user.id;
  const userRole = req.user.role;

//   const baseQuery = `
//     SELECT 
//       T.TRANSACTION_ID,
//       T.TRANSACTION_TYPE,
//       T.AMOUNT,
//       T.TAX,
//       T.DESCRIPTION,
//       T.TRANSACTION_DATE,
//       C.CATEGORY_NAME,
//       U.USERNAME AS ADMINISTERED_BY
//     FROM TRANSACTION T
//     JOIN CATEGORY C ON T.CATEGORY_ID = C.CATEGORY_ID
//     JOIN USER U ON T.USER_ID = U.USER_ID
//     WHERE T.COMPANY_ID = ?
//       AND MONTH(T.TRANSACTION_DATE) = MONTH(CURRENT_DATE())
//       AND YEAR(T.TRANSACTION_DATE) = YEAR(CURRENT_DATE())
//   `;

 const baseQuery = `
    SELECT 
      T.TRANSACTION_ID,
      T.TRANSACTION_TYPE,
      T.AMOUNT,
      T.TAX,
      T.DESCRIPTION,
      T.TRANSACTION_DATE,
      C.CATEGORY_NAME,
      U.USERNAME AS ADMINISTERED_BY
    FROM TRANSACTION T
    JOIN CATEGORY C ON T.CATEGORY_ID = C.CATEGORY_ID
    JOIN USER U ON T.USER_ID = U.USER_ID
    WHERE T.COMPANY_ID = ?
  `;

  const roleCondition = userRole === "Admin"
    ? "" // Admin sees all
    : "AND T.USER_ID = ?"; // Regular user sees only their transactions

  const finalQuery = `${baseQuery} ${roleCondition} ORDER BY T.TRANSACTION_DATE DESC`;

  const queryParams = userRole === "Admin" ? [companyId] : [companyId, userId];

  db.query(finalQuery, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
    res.json(results);
  });
});

module.exports = router;