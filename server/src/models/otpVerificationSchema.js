const mongoose = require("mongoose");

const otpVerficationSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    otp: {
        type: String
    },
    createdAt: {
        type: Date
    },
    expireAt: {
        type: Date
    }
});

module.exports = mongoose.model("userOtpVerfication", otpVerficationSchema);