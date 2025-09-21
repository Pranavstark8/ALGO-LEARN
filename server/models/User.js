const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: String
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'retro'],
            default: 'retro'
        },
        animationSpeed: {
            type: Number,
            default: 1000,
            min: 200,
            max: 3000
        },
        defaultView: {
            type: String,
            enum: ['tree', 'linear'],
            default: 'tree'
        }
    },
    statistics: {
        totalVisualizations: {
            type: Number,
            default: 0
        },
        favoriteAlgorithm: String,
        timeSpent: {
            type: Number,
            default: 0 // in minutes
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
