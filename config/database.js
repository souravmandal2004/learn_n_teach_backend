const mongoose = require ("mongoose");
require ("dotenv").config ();

exports.connect = () => {
    mongoose.connct (process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }) 
    .then ( () => console.log ("DB connected successfully"))
    .catch ( (error) => {
        console.log ("Error while connecting to DB: " + error)
        process.exit (1);
    });
};