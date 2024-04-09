const { prototype } = require("events");
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
app.use(express.json());
const port = 8080;
app.use(
  cors({
    origin: "https://testing-pzaz.onrender.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.listen(port, () => {
  console.log(__dirname);
  console.log(`App is Listening on ${port}`);
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
