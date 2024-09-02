const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const redis = require("redis");
const routes = require("./routes/recipeRoutes");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(
  fileUpload({
    useTempFiles: true,
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  })
);

dotenv.config({ path: "config/config.env" });

// Connect to the database
connectDB();

// Set up Redis client
const redisClient = redis.createClient();
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});
redisClient.connect();

// Make Redis client available in controllers via middleware
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});

// Apply rate limiting middleware to API routes
app.use("/api/", limiter);
app.use("/api", routes); // API Routes

app.use(errorHandler); // Error handling

// setting up cloduinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

module.exports = app;
