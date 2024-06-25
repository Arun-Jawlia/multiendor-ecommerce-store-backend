const app = require("./app");
const port = process.env.PORT;
const connectDatabse = require("./db/Database");
const cloudinary = require("cloudinary");

//  Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log("Error", err.message);
  console.log("Shutting Down the server for the handling uncaught exception");
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})




// Connect database
connectDatabse()


//   Create Server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//Unhandle promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`Shutting down the server for unhandled Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
