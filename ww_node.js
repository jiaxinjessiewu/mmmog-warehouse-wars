require("./static_files/constants.js");
var express = require("express");
var app = express();
app.use(express.static("static_files"));

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const url = "mongodb://localhost/mmmog";
const dbName = "jessiewu_mmmog";

var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

function connect() {
  MongoClient.connect(url, function(err, client) {
    if (!err) {
      const db = client.db(dbName);
      db.createCollection("appuser", function(err, collection) {});
      db.createCollection("scores", function(err, collection) {});
      appuser = db.collection("appuser");
      scores = db.collection("scores");
      connection = client;
    }
  });
}
connect();

function encryption(code) {
  var length = code.length;
  var token = "";
  for (var i = 0; i < length; i++) {
    var origin = parseInt(code.charCodeAt(i));
    var newKey = origin + 9988;
    token = token + " " + newKey.toString();
  }
  return token;
}

function decode(code) {
  var length = code.length;

  var lis = [];
  var decodeList = [];
  var startIndex = 0;
  for (var i = 0; i < length; i++) {
    if (code[i] == " ") {
      lis.push(code.substring(startIndex, i));
      startIndex = i + 1;
    } else if (i == length - 1) {
      lis.push(code.substring(startIndex, i + 1));
    }
  }

  for (index in lis) {
    var origin = parseInt(lis[index]);
    var newKey = origin - 9988;
    decodeList.push(newKey);
  }
  return String.fromCharCode.apply(null, decodeList);
}

app.get("/ww/api/all", function(req, res) {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection("appuser")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          console.log(err);
          res.send(err);
        } else if (result.length) {
          res.send(result);
        }
      });
    client.close();
  });
});

app.get("/ww/api/allscores", function(req, res) {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    db.collection("scores")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          console.log(err);
          res.send(err);
        } else if (result.length) {
          res.send(result);
        }
      });
    client.close();
  });
});

app.get("/ww/api/user/:username/", function(req, res) {
  connect();
  var user = req.params.username;
  var pw = req.get("authorization");
  var feedback = {};
  if (user == decode(pw)) {
    appuser.find({ _id: user }).toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        feedback["profile"] = result;

        res.json(feedback);
      } else {
        res.json({ error: "no such a user" });
      }
    });
  } else {
    res.json({ error: "identification fail" });
  }
});

function sortNumber(a, b) {
  return a - b;
}

app.get("/ww/api/user/:username/highScores", function(req, res) {
  connect();
  var user = req.params.username;
  var pw = req.get("authorization");
  var feedback = {};
  if (user == decode(pw)) {
    scores.find({ username: user }).toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        feedback["userscore"] = [];
        for (index in result) {
          feedback["userscore"].push(result[index].score);
        }
        feedback["userscore"].sort(sortNumber);
        feedback["userscore"].reverse();
        res.json(feedback);
      } else {
        res.json({ error: "no such a user" });
      }
    });
  } else {
    res.json({ error: "identification fail" });
  }
});

app.get("/ww/api/highscore/", function(req, res) {
  connect();

  var feedback = {};

  scores
    .find({})
    .sort({ score: -1 })
    .limit(10)
    .toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        feedback["highscore"] = [];
        for (index in result) {
          var key = result[index].username;
          var values = result[index].score;
          var record = { username: key, score: values };
          feedback["highscore"].push(record);
        }

        res.json(feedback);
      } else {
        res.json({ error: "no such a user" });
      }
    });
});

app.get("/ww/api/allhighscore/", function(req, res) {
  connect();

  var feedback = {};

  scores
    .find({})
    .sort({ score: -1 })
    .toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        feedback["allhighscore"] = [];
        for (index in result) {
          var key = result[index].username;
          var values = result[index].score;
          var record = { username: key, score: values };
          feedback["allhighscore"].push(record);
        }
        res.json(feedback);
      } else {
        res.json({ error: "no such a user" });
      }
    });
});

app.put("/ww/api/updateuser", function(req, res) {
  connect();
  var user = req.body._id;
  var password = req.body.password;
  var email = req.body.email;
  console.log("PUT:" + user);

  appuser.find({ _id: user }).toArray(function(err, result) {
    if (err) {
      console.log(err.message);
      res.status(422).send({ error: err.message });
    } else if (result.length) {
      appuser.updateOne(
        { _id: user },
        { $set: { password: password, email: email } },
        function(err, result) {
          if (err) {
            console.log(err.message);
            res.status(422).send({ error: err.message });
          } else {
            console.log("successfully update");
            res.json({ status: "successfully update" });
          }
        }
      );
    } else {
      console.log("no such a user");
      res.json({ error: "no such a user" });
    }
  });
});

app.put("/ww/api/loginuser", function(req, res) {
  connect();
  var user = req.body._id;
  let sql = "UPDATE appuser SET lastLogin=? WHERE username=?;";

  appuser.update({ _id: user }, { $currentDate: { lastLogin: true } }, function(
    err,
    result
  ) {
    if (err) {
      console.log(err.message);
      res.status(422).send({ error: err.message });
    } else if (result.result.n != 0) {
      console.log("successfully update");
      res.json({ status: "successfully update" });
    } else {
      console.log("no such a user");
      res.json({ error: "no such a user" });
    }
  });
});

app.put("/ww/api/playgame", function(req, res) {
  connect();
  var user = req.body._id;
  let sql =
    "UPDATE appuser SET numGamesPlayed=numGamesPlayed+1 WHERE username=?;";

  appuser.update({ _id: user }, { $inc: { numGamesPlayed: 1 } }, function(
    err,
    result
  ) {
    if (err) {
      console.log(err.message);
      res.status(422).send({ error: err.message });
    } else if (result.result.n != 0) {
      console.log("successfully update");
      res.json({ status: "successfully update" });
    } else {
      res.json({ error: "no such a user" });
    }
  });
});

app.post("/ww/api/creatuser", function(req, res) {
  connect();
  var lastLogin = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");
  var item = {
    _id: req.body._id,
    password: req.body.password,
    numGamesPlayed: 0,
    email: req.body.email,
    lastLogin: lastLogin
  };

  appuser.insert(item, function(err, result) {
    if (err) {
      console.log(err);
      res.status(422).send({ error: "user already exist" });
    } else if (result.result.n != 0) {
      res.send({ status: "successfully create" });
      //res.json(result);
    } else {
      res.json({ error: "can not create" });
    }
  });
});

app.post("/ww/api/creatuser", function(req, res) {
  connect();
  var lastLogin = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");
  var item = {
    _id: req.body._id,
    password: req.body.password,
    numGamesPlayed: 0,
    email: req.body.email,
    lastLogin: lastLogin
  };

  appuser.insert(item, function(err, result) {
    if (err) {
      console.log(err);
      res.status(422).send({ error: "user already exist" });
    } else if (result.result.n != 0) {
      res.send({ status: "successfully create" });
      //res.json(result);
    } else {
      res.json({ error: "can not create" });
    }
  });
});

app.post("/ww/api/newscore", function(req, res) {
  connect();
  var user = req.body.username;
  var newscore = req.body.score;
  var authorization = decode(req.body.authorization);

  if (user == authorization) {
    appuser.find({ _id: user }).toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        scores
          .find({ username: user, score: newscore })
          .toArray(function(err, result) {
            if (err) {
              console.log(err.message);
              res.status(422).send({ error: err.message });
            } else {
              scores.insert({ username: user, score: newscore }, function(
                err,
                result
              ) {
                if (err) {
                  console.log(err.message);
                  res.status(422).send({ error: "record already exist" });
                } else {
                  console.log("successfully insert new score");
                  res
                    .status(200)
                    .json({ status: "successfully insert new score" });
                }
              });
            }
          });
      } else {
        console.log("user not exist");
        res.status(422).send({ error: "user not exist" });
      }
    });
  } else {
    res.json({ error: "identification fail" });
  }
});

//done
app.delete("/ww/api/delete", function(req, res) {
  connect();
  var user = req.body._id;
  var feedback = {};
  var authorization = decode(req.body.authorization);
  if (user == authorization) {
    appuser.find({ _id: user }).toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        appuser.remove({ _id: user }, function(err, result) {
          if (err) {
            console.log(err.message);
            res.status(422).send({ error: err.message });
          } else {
            feedback["status"] = {};
            feedback["status"]["message"] = "successfully remove user";
          }
        });
      } else {
        feedback["error"] = {};
        feedback["error"]["message"] = "no such a user record";
      }
    });
    scores.find({ username: user }).toArray(function(err, result) {
      if (err) {
        console.log(err.message);
        res.status(422).send({ error: err.message });
      } else if (result.length) {
        scores.remove({ username: user }, function(err, result) {
          if (err) {
            console.log(err.message);
            res.status(422).send({ error: err.message });
          } else {
            if (feedback["status"] != null) {
              feedback["status"]["message2"] = "successfully remove score";
            } else {
              feedback["status"] = {};
              feedback["status"]["message"] = "successfully remove score";
            }

            res.json(feedback);
          }
        });
      } else {
        if (feedback["error"] != null) {
          feedback["error"]["message2"] = "no such a score record";
        } else {
          feedback["error"] = {};
          feedback["error"]["message"] = "no such a score record";
        }

        res.json(feedback);
      }
    });
  } else {
    res.json({ error: "identification fail" });
  }
});

app.listen(port, function() {
  console.log("Example app listening on port " + port);
  console.log("Connected to Mongodb.");
});
