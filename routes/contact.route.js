const express = require("express");
const router = express.Router();
const {contactUsController} = require ("../controllers/contactUs.controller.js");

router.post("/contact", contactUsController)

module.exports = router;