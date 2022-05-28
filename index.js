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


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  userModel.find({ username }, (err, data) => {
    if (err) {
      res.json({error: err});
    } else if (data.length > 0) {
      res.json({error:'Username already exists'});
    } else {
      const newUser = new userModel({ username });
      newUser.save((err, data) => {
        if (err) {
          res.json({error: err});
        } else {
          res.json(data);
        }
      });
    }
  });
});


app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id, description, duration, date } = req.body;
  if(!date){date=Date.now()}
  const newExercise = new exerciseModel({ _id, description, duration, date});
  newExercise.save((err, data) => {
    if (err) {
      res.json({error: err});
    } else {
      res.json(data);
    }
  });
});


app.get('/api/users', (req, res) => {
  userModel.find({}, (err, data) => {
    if (err) {
      res.json({error: err});
    } else {
      res.json(data);
    }
  });
});


app.get('/api/users/:id/logs', (req, res) => {
  const { _id, from, to, limit } = req.query;
  const query = {};
  if (_id) {
    query._id = _id;
  }
  if (from) {
    query.date = { $gte: new Date(from) };
  }
  if (to) {
    query.date = { $lte: new Date(to) };
  }
  if (limit) {
    query.limit = limit;
  }
  exerciseModel.find(query, (err, data) => {
    if (err) {
      res.json({error: err});
    } else {
      res.json(data);
    }
  });
});







const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});