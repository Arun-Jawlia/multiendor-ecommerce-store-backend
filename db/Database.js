const mongoose = require("mongoose");
// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}

const connectDatabse = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then((res) => {
      console.log(`Connected to database successfully:${res.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDatabse;
