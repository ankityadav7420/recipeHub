const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config({ path: "config/config.env" });

const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
