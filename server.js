// server.js

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
// Endpoint to handle payment requests from frontend
app.post("/makePayment", async (req, res) => {
  try {
    const requestData = req.body;

    // Make HTTP POST request to third-party API
    const apiResponse = await axios.post(
      "https://app.periodicalservices.com/api/woocommerce/v1.8/process.asp",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Send response back to frontend
    res.json(apiResponse.data);
  } catch (error) {
    console.error("Error making payment:", error.message);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
