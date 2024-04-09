const { prototype } = require("events");
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
app.use(express.json());
app.use(
  cors({
    origin: "rewardscenter.club",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const port = 8080;
app.listen(port, () => {
  console.log(__dirname);
  console.log(`App is Listening on ${port}`);
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
