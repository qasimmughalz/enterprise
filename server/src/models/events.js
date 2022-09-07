const mongoose = require('mongoose');

const events = new mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Users' 
    },
    _siteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Users' 
    },
    events: { 
        type: [Object], 
        required: true 
    }
});

module.exports = mongoose.model('Events', events);