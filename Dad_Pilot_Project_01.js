const { prototype } = require("events");
const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
const port = 8080;
app.listen(port, () => {
  console.log(__dirname);
  console.log(`App is Listening on ${port}`);
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
