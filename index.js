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
    if (err) return res.status(400).send(err);
    res.send(user);
  });
});


app.get('/api/users', (req, res) => {
  userModel.find({}, (err, users) => {
    if (err) {
      console.log(err.message);
    }
    res.json(users);
  });
});


app.post('/api/users/:_id/exercises', (req, res) => {
  let { description, duration, date } = req.body;
  const { _id } = req.params;
  if(!date){
    date = new Date();
  }
  let newExercise;
  let users;
   
  try {
    newExercise = new exerciseModel({
      user: _id,
      description,
      duration,
      date
    });
    newExercise.save((err, exercise) => {
      if (err) {
        console.log(err.message);
      }
      //console.log(exercise);
      response = exercise;
    });
  } catch (err) {
    console.log(err.message);
  }
  try{
    userModel.where({ _id }).findOne().exec(
      (err, user) => {
        if (err) {
          console.log(err.message);
        }
        users=user;
        //console.log(users);
        res.json({
          username: user.username,
          description: description,
          duration: duration,
          date: date,
          _id: _id
          
        })

      }
    );
  }
  catch(err){
    console.log(err.message);
  }
  
});
  


app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  let logs;
  let user;
  const query = { user: _id };
  if (from) {
    query.date = { $gte: new Date(from) };
  }
  if (to) {
    query.date = { $lte: new Date(to) };
  }
  if (limit) {
    query.limit = limit;
  }
  try {
    exerciseModel.find(query).populate('user').exec(
    (err, exercises) => {
      if (err) {
        console.log(err.message);
      }
      res.json({
        username: exercises[0].user.username,
        count: exercises.length,
        log: exercises.map(exercise => ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString()
        }))
      });
    }
  );
  } catch (err) {
    console.log(err.message);
  }

  
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});