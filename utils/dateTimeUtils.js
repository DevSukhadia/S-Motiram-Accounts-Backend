const { DateTime } = require('luxon');

const IST_ZONE = 'Asia/Kolkata';

function getIstMonthStarts() {
    const nowIST = DateTime.now().setZone(IST_ZONE);
  const currentMonthStart = nowIST.startOf('month').set({ hour: 0, minute: 0, second: 0 });
  const previousMonthStart = currentMonthStart.minus({ months: 1 });

  return {
    currentMonthStart: currentMonthStart.toSQL({ includeOffset: false }),
    previousMonthStart: previousMonthStart.toSQL({ includeOffset: false })
  };
}

function toIstMySqlDatetime(inputDate = new Date()) {
  return DateTime.fromJSDate(inputDate)
    .setZone(IST_ZONE)
    .toSQL({ includeOffset: false });
}

module.exports = {
  getIstMonthStarts,
  toIstMySqlDatetime,
  IST_ZONE
};
