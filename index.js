const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { dbConnect, userModel, exerciseModel } = require('./db.js');


dbConnect();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const user = new userModel({ username });
  user.save((err, user) => {
    if (err) {
      res.status(400).json({error: err.message});
    } else {
      res.status(201).json(user);
    }
  });
});

app.get('/api/users', (req, res) => {
  userModel.find({}, (err, users) => {
    if (err) {
      res.status(400).json({error: err.message});
    } else {
      res.status(200).json(users);
    }
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let { description, duration, date } = req.body;
  if(!date){
    date= Date.now();
  }
  const { _id } = req.params;
  const exercise = new exerciseModel({ description, duration, date, userId: _id });
  let userName; 
  userModel.findOne({_id}, (err, user) => {
    if (err) {
      res.status(400).json({error: err.message});
    } else {
      userName=user.username;
    }
    });
  exercise.save((err, exercise) => {
    if (err) {
      res.status(400).json({error: err.message});
    } else {
      res.status(201).json({
        username: userName,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
        _id: exercise._id

      });
    }
  });
});


app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  const { _id } = req.params;
  const count = exerciseModel.countDocuments({userId: _id}, (err, count) => {
    if (err) {
      res.status(400).json({error: err.message});
    }
  });
  const logs = exerciseModel.find({userId: _id}, (err, logs) => {
    if (err) {
      res.status(400).json({error: err.message});
    }
  });

  const usrName = userModel.findOne({_id}, (err, user) => {
    if (err) {
      res.status(400).json({error: err.message});
    }
  });

  res.status(200).json({
    username: usrName,
    count: count,
    _id: _id,
    log: logs,
  });


});









const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});