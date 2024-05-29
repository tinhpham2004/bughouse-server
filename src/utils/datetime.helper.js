const ArgumentError = require("../exception/ArgumentError");
const MyError = require("../exception/MyError");

const DAY_MILISECONDS = 86400000;
const HOURSE_MILISECONDS = 3600000;
const MINUTE_MILISECONDS = 60000;

module.exports = {
  // get the real day
  toObject: (date) => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }),

  // convert string to date
  toDate: (dateString) => {
    if (!dateString) return null;
    // var dateString = "23/10/2015"; // Oct 23

    const dateParts = dateString.split("/");
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    if (date.toDateString() === "Invalid Date") return null;
    return date;
  },

  // get date froom object
  toDateFromObject: (dateObj) => {
    const { day, month, year } = dateObj;
    const dateString = `${year}-${month}-${day}`;
    return this.toDate(dateString);
  },

  toTime: (date) => {
    const nowTemp = new Date();

    // get year
    if (nowTemp.getFullYear() - date.getFullYear() > 0) { return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`; }

    const now = new Date();
    const numberMiliseconds = now - date;

    // get day
    const day = Math.floor(numberMiliseconds / DAY_MILISECONDS);
    if (day > 0) return `${day} ngày`;

    // hour
    const hour = Math.floor(numberMiliseconds / HOURSE_MILISECONDS);
    if (hour > 0) return `${hour} giờ`;

    // minute
    const minute = Math.floor(numberMiliseconds / MINUTE_MILISECONDS);
    if (minute > 0) return `${minute} phút`;

    return `${numberMiliseconds} giây`;
  },


  periodDate: (date, period) => {
    if (!date || !period)
      throw new MyError('period date missing parameter');
    const periodDate = new Date(date);
    periodDate.setDate(1); // set the day of the month to 1
    periodDate.setMonth(periodDate.getMonth() + period); // add the specified number of months

    return periodDate;
  }

};
