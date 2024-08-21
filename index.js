// Importing necessary modules and packages
const express = require("express");
const app = express();
const userRoutes = require("./routes/user.route.js");
const profileRoutes = require("./routes/profile.route.js");
const courseRoutes = require("./routes/course.route.js");
const paymentRoutes = require("./routes/payment.route.js");
const contactUsRoute = require("./routes/contact.route.js");
const database = require("./config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary.js");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Setting up port number
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file
dotenv.config();

// Connecting to database
database.connect();

// CORS Frontend URL
const FRONTEND_URL = process.env.FRONTEND_BASE_URL;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

// Connecting to cloudinary
cloudinaryConnect();

// Setting up routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

// Testing the server
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running ...",
    });
});

// Listening to the server
app.listen(PORT, () => {
    console.log(`App is listening at ${PORT}`);
});
app.get('/api/whoami', (req, res) => {
    let myIP = req.header("X-Forwarded-For").split(',')[0];

    const clientLang = req.header('Accept-Language');
    const clientSystem = req.header('User-Agent');

    res.json({ ipaddress: myIP, language: clientLang, software: clientSystem });
});
// End of code.