const express = require("express");
const app = express();
const path = require("path");
const request = require("request");

app.use(express.json());
app.use(express.static("public"));
app.get("*.js", function (req, res, next) {
  res.set("Content-Type", "application/javascript");
  next();
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.post("/api/process", (req, res) => {
  const options = {
    url: "https://app.periodicalservices.com/api/woocommerce/v1.8/process.asp",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: req.body,
  };

  request(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log(
        "Server Response : ",
        response.statusCode,
        " ",
        response.statusMessage
      );
      res.json(JSON.parse(body));
      return;
    } else {
      console.log(
        "Server Response : ",
        response.statusCode,
        " ",
        response.statusMessage
      );
      res.status(response.statusCode).json({ error: body });
      return;
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
