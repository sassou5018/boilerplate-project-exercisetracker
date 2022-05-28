const mongoose = require('mongoose');
const shortId = require('shortid');
const DB_URI = process.env.DB_URI;

const dbConnect = function(){
    mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) {
            console.log('Error connecting to MongoDB');
            console.log(err);
            } else {
                console.log('Connected to MongoDB');
            }
        });
  }

  const userSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: shortId.generate },
    username: { type: String, required: true },
    count: { type: Number, default: 0 },
    log: [
      {
        description: { type: String },
        duration: { type: Number },
        date: { type: Date }
      }
    ]
  });
  
  const User = mongoose.model("User", userSchema);

  module.exports = { dbConnect, User };