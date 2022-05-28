const mongoose = require('mongoose');
const DB_URI = process.env.DB_URI;

const dbConnect = function(){
    mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.log('Error connecting to MongoDB: ', err.message);
    });
}


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    }
});

const userModel = mongoose.model('User', userSchema);

const exerciseSchma = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const exerciseModel = mongoose.model('Exercise', exerciseSchma);

module.exports = {
    dbConnect,
    userModel,
    exerciseModel
}