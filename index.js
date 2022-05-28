const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
const { dbConnect, User } = require("./db");




dbConnect()


app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});






app.post("/api/users", (req, res) => {
  const username = req.body.username;
  User.findOne({ username: username }, (err, found) => {
    if (err) return;
    if (found) {
      res.send("Username Taken");
    } else {
      const newUser = new User({
        username: username
      });
      newUser.save((err, save) => {
        if (err) return;
        res.json({
          username: username,
          _id: save._id
        });
      });
    }
  });
});



app.get("/api/users", (req, res) => {
  User.find({}, "username _id", (err, users) => {
    let arr = [];
    users.map(user => {
      arr.push(user);
    });
    res.json(arr);
  });
});



app.post("/api/users/:_id/exercises", async (req, res) => {
  let { description, duration, date } = req.body;
  let id = req.params._id;
  if (!date) {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }

  try {
    let findOne = await User.findOne({
      _id: id
    });
    
    if (findOne) {
      console.log("Retrieving Stored User");
      findOne.count++;
      findOne.log.push({
        description: description,
        duration: parseInt(duration),
        date: date
      });
      findOne.save();

      res.json({
        username: findOne.username,
        description: description,
        duration: parseInt(duration),
        _id: id,
        date: date
      });
    }
    
  } catch (err) {
    console.error(err);
  }
});



app.get("/api/users/:_id/logs", (req, res) => {
  User.findById(req.params._id, (error, result) => {
    if (!error) {
      let resObj = result;

      if (req.query.from || req.query.to) {
        let fromDate = new Date(0);
        let toDate = new Date();

        if (req.query.from) {
          fromDate = new Date(req.query.from);
        }

        if (req.query.to) {
          toDate = new Date(req.query.to);
        }

        fromDate = fromDate.getTime();
        toDate = toDate.getTime();

        resObj.log = resObj.log.filter(session => {
          let sessionDate = new Date(session.date).getTime();

          return sessionDate >= fromDate && sessionDate <= toDate;
        });
      }

      if (req.query.limit) {
        resObj.log = resObj.log.slice(0, req.query.limit);
      }

      resObj = resObj.toJSON();
      resObj["count"] = result.log.length;
      res.json({
        count: resObj.count,
        _id: resObj._id,
        username: resObj.username,
        log: resObj.log.map(o => ({
          description: o.description,
          duration: o.duration,
          date: o.date.toDateString()
        }))
      });
    }
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Listening On: " + listener.address().port);
});

