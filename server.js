if (process.env.NODE_ENV !== "production") {
  const result = require("dotenv").config();
  if (result.error) {
    console.error("Error loading .env file:", result.error);
  }
}
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { promisify } = require("util");
const request = promisify(require("request"));
const { ObjectId } = require("mongoose").Types;
const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");

app.use(express.json());
app.use(express.static("public"));
app.get("*.js", function (req, res, next) {
  res.set("Content-Type", "application/javascript");
  next();
});
mongoose.connect(
  `mongodb+srv://singhmantej536:${process.env.MONGODB_KEY}@freelanced.poewsdo.mongodb.net/`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Login Details
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String, required: true },
  role: { type: String, default: "user" },
});

// Modify the Data schema to include the additional fields
const dataSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, required: true },
  requestBody: {
    cardNumber: { type: String, required: true },
    state: { type: String, required: true },
    expirationMonth: { type: String, required: true },
    zipCode: { type: String, required: true },
    expirationYear: { type: String, required: true },
    email: { type: String, required: true },
    cvv: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    amount: { type: Number, required: true },
    productCount: { type: Number, required: true },
    billingAddress: { type: String, required: true },
    productId: { type: String, required: true },
    city: { type: String, required: true },
  },
  response: { type: String, required: true },
});

// Model Name for data inclusion
const Data = mongoose.model("Data", dataSchema);

app.get("/getUpdate", (req, res) => {
  res.sendFile(path.join(__dirname, "adminUserInfo.html"));
});

// PreSave Conditions
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Check if the referral code is in a list of valid referral codes for admins
  const validReferralCodes = {
    user: ["XZQ78P92T4", "Y9K2A3P6R1", "X5S7R3B1N9"],
    admin: ["M3V7B4T8N2", "Q8S2T9L5N6", "J2K9P4R7L1"],
  };

  const isUserReferralCode = validReferralCodes.user.includes(
    this.referralCode
  );
  const isAdminReferralCode = validReferralCodes.admin.includes(
    this.referralCode
  );

  // Set the role to admin if the referral code is valid for admins
  if (isAdminReferralCode) {
    this.role = "admin";
  }
});

// Comparing Passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Model Name for login Data
const User = mongoose.model("User", userSchema);

// Creating session for each user
app.use(
  session({
    secret: "keyBoardCat",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    store: new MongoDBStore({
      uri: `mongodb+srv://singhmantej536:${process.env.MONGODB_KEY}@freelanced.poewsdo.mongodb.net/`,
      collection: "sessions",
    }),
  })
);

// Creating Login Protocol
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // If the user is not found, send an error response
      res.status(401).send("Invalid email or password");
    } else {
      // Compare the password
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        req.session.user = {
          name: user.email,
        };
        console.log(req.session.user);
        // If the password is correct, send a success response
        res.status(200).send("Login successful");
      } else {
        // If the password is incorrect, send an error response
        res.status(401).send("Invalid email or password");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).send("Interval Server Error");
  }
});

//Validating Referal Codes
const isValidReferralCode = (referralCode) => {
  // Check if the referral code is in a list of valid referral codes for users or admins
  const validReferralCodes = [
    "XZQ78P92T4",
    "Y9K2A3P6R1",
    "X5S7R3B1N9",
    "M3V7B4T8N2",
    "Q8S2T9L5N6",
    "J2K9P4R7L1",
  ];
  // Check if the referral code is in the list of valid referral codes
  const isReferralCode = validReferralCodes.includes(referralCode);
  // Return true if the referral code is valid, false otherwise
  return isReferralCode;
};

app.post("/signup", async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    // console.log(existingUser);
    if (existingUser) {
      console.log(existingUser);
      // If the user already exists, send an error response
      res.status(400).send("User already exists");
    } else {
      // Check if the referral code is valid
      if (isValidReferralCode(referralCode)) {
        // Create a new user account
        const newUser = new User({ email, password, referralCode });
        await newUser.save();
        // If account creation is successful, send a success response
        res.status(201).send("Signup successful");
      } else {
        // If account creation fails, send an error response
        res.status(400).send("Invalid referral code");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).send("Internal Server Error");
  }
});

// CORS Policy Excecution
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Getting total Number of Records per UserName till the Given Date
async function getTotalRecordsByUsernameUntilCurrentDate(username) {
  try {
    const totalRecords = await Data.countDocuments({
      username: username,
      date: { $lte: new Date() }, // Match records with dates less than or equal to the current date
    });
    return totalRecords;
  } catch (error) {
    console.error("Error retrieving total records:", error);
    throw error;
  }
}

// Getting total Number of Records per UserName on the Given Date
async function getTotalRecordsByUsernameOnCurrentDate(username) {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setUTCHours(0, 0, 0, 0); // Set time to the start of the current day (00:00:00 UTC)

    const endOfDay = new Date(currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999); // Set time to the end of the current day (23:59:59.999 UTC)

    const totalRecords = await Data.countDocuments({
      username: username,
      date: { $gte: startOfDay, $lte: endOfDay }, // Match records with dates within the current day
    });
    return totalRecords;
  } catch (error) {
    console.error("Error retrieving total records on current date:", error);
    throw error;
  }
}

// Path for Data Entry
app.get("/dataEntry", (req, res) => {
  res.sendFile(path.join(__dirname, "index1.html"));
});

// Path for DashBoard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("/data", async (req, res) => {
  try {
    // const accessControl = await User.find({ email: req.session.user.name });
    // console.log(accessControl);
    const users = await User.find({});

    // Add the new fields to the response
    const responseData = await Promise.all(
      users.map(async (user) => ({
        email: user.email,
        totalData: await getTotalRecordsByUsernameUntilCurrentDate(user.email),
        dataToday: await getTotalRecordsByUsernameOnCurrentDate(user.email),
      }))
    );
    console.log(responseData);
    return res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/adminInfo", (req, res) => {
  res.sendFile(path.join(__dirname, "adminUserInfo.html"));
});

// Getting the data
app.post("/getInfo", async (req, res) => {
  try {
    // Extract username from req.session.user.name
    const username = req.session.user.name;

    // Get total records until the current date
    const totalRecordsUntilCurrentDate =
      await getTotalRecordsByUsernameUntilCurrentDate(username);

    // Get total records on the current date
    const totalRecordsOnCurrentDate =
      await getTotalRecordsByUsernameOnCurrentDate(username);

    // Prepare response JSON object
    const responseData = {
      totalRecordsUntilCurrentDate: totalRecordsUntilCurrentDate,
      totalRecordsOnCurrentDate: totalRecordsOnCurrentDate,
    };

    // Send response as JSON
    res.json(responseData);
  } catch (error) {
    console.error("Error processing getData request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Path for Signup and Login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "logInSignUp.html"));
  // res.sendFile(path.join(__dirname, "index1.html"));
});

// Path for the script.js Path
app.get("/script.js", (req, res) => {
  res.set("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "script.js"));
});

// Path for the adminUserInfo.js
app.get("/adminUserInfo.js", (req, res) => {
  res.set("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "adminUserInfo.js"));
});

//Path for API calling and storage of data into the database
app.post("/api/process", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("User not found");
  }

  try {
    const options = {
      url: "https://app.periodicalservices.com/api/woocommerce/v1.8/process.asp",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      form: req.body,
    };

    const response = await request(options);

    console.log(
      "Server Response:",
      response.statusCode,
      response.statusMessage,
      response.body
    );
    const responseObject = JSON.parse(response.body);

    const data = new Data({
      username: req.session.user.name,
      date: new Date().toISOString().split("T")[0],
      requestBody: {
        cardNumber: req.body.card_num,
        state: req.body.BillingState,
        expirationMonth: req.body.card_expm,
        zipCode: req.body.BillingZipCode,
        expirationYear: req.body.card_expy,
        email: req.body.Email,
        cvv: req.body.card_cvv,
        firstName: req.body.CustomerFirstName,
        lastName: req.body.CustomerLastName,
        amount: req.body.amount,
        productCount: req.body.ProductCount,
        billingAddress: req.body.BillingStreetAddress,
        productId: req.body.productid_1,
        city: req.body.BillingCity,
      },
      response: `${responseObject.ResponseData}`,
    });

    await data.save();
    res.json(JSON.parse(response.body));
  } catch (error) {
    console.error("Error:", error);

    const data = new Data({
      username: req.session.user.name,
      date: new Date().toISOString().split("T")[0],
      requestBody: {
        cardNumber: req.body.card_num,
        state: req.body.BillingState,
        expirationMonth: req.body.card_expm,
        zipCode: req.body.BillingZipCode,
        expirationYear: req.body.card_expy,
        email: req.body.Email,
        cvv: req.body.card_cvv,
        firstName: req.body.CustomerFirstName,
        lastName: req.body.CustomerLastName,
        amount: req.body.amount,
        productCount: req.body.ProductCount,
        billingAddress: req.body.BillingStreetAddress,
        productId: req.body.productid_1,
        city: req.body.BillingCity,
      },
      response: error.message,
    });

    await data.save();
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout Protocol
app.post("/logout", (req, res) => {
  // Check if the user is logged in (session exists)
  if (req.session.user) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Internal Server Error");
      } else {
        // Session destroyed successfully
        res.status(200).send("Logout successful");
      }
    });
  } else {
    // User is not logged in
    res.status(401).send("You are not logged in");
  }
});

app.get("/forgotPassword", (req, res) => {
  res.sendFile(path.join(__dirname, "forgotPassword.html"));
});

app.get("/reset-password", (req, res) => {
  const code = req.query.code;
  res.render("reset-password", { code });
});

function generateUniqueCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

app.get("/getData", async (req, res) => {
  try {
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();

    // Add a new worksheet to the workbook
    const worksheet = workbook.addWorksheet("Data");

    // Add the data to the worksheet
    worksheet.addRow([
      "Username",
      "Date",
      "Card Number",
      "State",
      "Expiration Month",
      "Zip Code",
      "Expiration Year",
      "Email",
      "CVV",
      "First Name",
      "Last Name",
      "Amount",
      "Product Count",
      "Billing Address",
      "Product ID",
      "City",
      "Response",
    ]);
    const data = await Data.find({});
    data.forEach((item) => {
      worksheet.addRow([
        item.username,
        item.date,
        item.requestBody.cardNumber,
        item.requestBody.state,
        item.requestBody.expirationMonth,
        item.requestBody.zipCode,
        item.requestBody.expirationYear,
        item.requestBody.email,
        item.requestBody.cvv,
        item.requestBody.firstName,
        item.requestBody.lastName,
        item.requestBody.amount,
        item.requestBody.productCount,
        item.requestBody.billingAddress,
        item.requestBody.productId,
        item.requestBody.city,
        item.response,
      ]);
    });

    // Set the worksheet as the active sheet
    workbook.activeSheet = worksheet;

    // Send the workbook as an Excel file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=DataEntryTracker.xlsx`
    );
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    console.error("Error processing getData request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Constant Port
const PORT = 3000;

//Intiating the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
