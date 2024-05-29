require("dotenv").config();
const db = require("../../config/database");
db.connect(process.env.DATABASE_CONNECTION);
require("../../config/cron");
