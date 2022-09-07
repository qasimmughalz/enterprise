const mongoose = require('mongoose');


const resetPassword = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Users' 
    },
    resetToken: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now, 
        expires: 43200 
    },
});


module.exports = mongoose.model('Reset-password', resetPassword);