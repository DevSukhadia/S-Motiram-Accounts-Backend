const db = require('../config/db'); // adjust to your DB config
const { getIstMonthStarts } = require('../dateTimeUtils');

async function ensureMonthSummaryExists() {
  const { currentMonthStart, previousMonthStart } = getIstMonthStarts();

  // Check if a summary for the current month already exists
  const [existing] = await db.execute(
    'SELECT 1 FROM MONTHSUMMARY WHERE MONTHYEAR = ?',
    [currentMonthStart]
  );

  if (existing.length === 0) {
    // Get previous month's ending amount
    const [prev] = await db.execute(
      'SELECT ENDINGAMOUNT FROM MONTHSUMMARY WHERE MONTHYEAR = ?',
      [previousMonthStart]
    );

    const prevEnding = prev.length > 0 ? prev[0].ENDINGAMOUNT : 0;

    // Insert the new summary for the current month
    await db.execute(
      `INSERT INTO MONTHSUMMARY 
        (MONTHYEAR, STARTINGAMOUNT, ENDINGAMOUNT, TOTALEXPENSES, TOTALINCOME, TOTALTAXPAID, TOTALTAXCOLLECTED)
        VALUES (?, ?, 0, 0, 0, 0, 0)`,
      [currentMonthStart, prevEnding]
    );

    console.log(`Created new MONTHSUMMARY for ${currentMonthStart}`);
  } else {
    console.log(`MONTHSUMMARY already exists for ${currentMonthStart}`);
  }
}

module.exports = ensureMonthSummaryExists;
