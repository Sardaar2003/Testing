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
const run = async () => {
  const MONG_URL = `mongodb+srv://singhmantej536:ROhp7kxeirslZw1L@freelanced.poewsdo.mongodb.net/`;
  await mongoose.connect(MONG_URL);
};
run()
  .then(() => {
    console.log(`Connected to DB`);
  })
  .catch((err) => {
    console.log(`Failed to Connect ${err}`);
  });

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

const binListReject = [
  400022, 400167, 400231, 400344, 401532, 401543, 401840, 402087, 402464, 402944,
  403163, 403216, 403619, 403690, 403766, 403784, 403833, 403905, 405037, 405960,
  406032, 406042, 406049, 406095, 407166, 407221, 409758, 409970, 410039, 410040,
  410836, 410846, 410881, 410894, 411079, 411501, 411568, 411573, 411600, 411770,
  411771, 411810, 412055, 412185, 412421, 412451, 413040, 414398, 414709, 414718,
  414720, 414724, 415158, 415975, 415976, 415977, 415978, 416994, 416995, 418312,
  418940, 418953, 419002, 419032, 420767, 421156, 421783, 422957, 422968, 423223,
  424030, 424067, 424631, 424840, 425300, 425307, 425628, 425808, 425828, 425836,
  425838, 426428, 426684, 426690, 426938, 427178, 429413, 430070, 430572, 431307,
  432630, 433747, 434256, 434257, 434258, 434340, 435142, 435541, 435544, 435545,
  435546, 435547, 435880, 436127, 436618, 438854, 438857, 439707, 440066, 440229,
  440393, 441103, 441840, 442644, 442657, 442755, 442756, 442790, 443044, 443046,
  443047, 443051, 443113, 443512, 443589, 444796, 445100, 445102, 446019, 446539,
  446542, 447581, 447914, 447954, 447972, 447993, 447994, 447995, 448223, 448261,
  448825, 449163, 449209, 454507, 455552, 459954, 461100, 461608, 462192, 463405,
  464018, 466188, 466189, 467010, 470132, 470134, 470793, 472728, 473310, 473702,
  473703, 473931, 474165, 474166, 474472, 474473, 474476, 474478, 474480, 474481,
  474485, 474487, 474488, 474665, 478200, 478433, 479851, 480213, 481582, 481583,
  483312, 483314, 483316, 483492, 483950, 484718, 485340, 487900, 487917, 491288,
  493452, 498503, 510277, 510404, 510774, 510805, 511317, 511332, 511361, 511413,
  511534, 511563, 511786, 512106, 512107, 514021, 514104, 514228, 514230, 514377,
  514616, 514759, 515307, 515676, 516121, 516648, 517279, 517431, 517479, 517545,
  517546, 517572, 517805, 518155, 518752, 518941, 519100, 519452, 520266, 520602,
  520711, 521105, 521333, 521853, 521870, 521991, 523081, 523652, 523680, 524038,
  524300, 524306, 524364, 524366, 525362, 526218, 526219, 526226, 526227, 526929,
  527505, 527515, 527519, 527520, 527521, 527523, 527854, 528072, 528217, 528847,
  529263, 529580, 530964, 531106, 531257, 531258, 531259, 531260, 531445, 532211,
  533051, 534774, 537993, 538976, 539634, 540789, 541071, 541111, 541413, 542179,
  542217, 542418, 542442, 542539, 542543, 543360, 543701, 544543, 544544, 544579,
  544602, 544768, 544927, 544928, 545313, 545510, 545563, 545660, 545669, 546316,
  546325, 546356, 546533, 546540, 546616, 546617, 546626, 546630, 546632, 546633,
  546638, 546641, 546680, 546700, 546993, 547415, 547519, 548030, 548042, 549113,
  549170, 549460, 549944, 551292, 551336, 551338, 551791, 551814, 552030, 552276,
  552318, 552319, 552322, 552330, 552379, 552393, 552433, 552465, 553732, 555426,
  555440, 555753, 557729, 558158, 559551, 559591, 559758
];


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
      uri: "mongodb+srv://singhmantej536:ROhp7kxeirslZw1L@freelanced.poewsdo.mongodb.net/",
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
    res.redirect("/");
    return;
  }
  console.log(req.body);
  const bin = req.body.card_num.substring(0, 6);
  const stringNumbersArray = binListReject.map(num => num.toString());
  if (stringNumbersArray.includes(bin)) {
    console.log("BIN Rejected");
    return res.status(400).json({ error: "BIN rejected" });
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
