stage = null;
interval = null;
score = 0;
socket = null;
checklogin = false;
username = "";
password = "";
status = "";
connect = false;
mode = "";

window.onbeforeunload = function() {
  if (socket != null) {
    socket.send(JSON.stringify({ type: "close", userid: username }));
    socket.close();
  }
};

function encryption(code) {
  var length = code.length;
  var token = "";
  for (var i = 0; i < length; i++) {
    var origin = parseInt(code.charCodeAt(i));
    var newKey = origin + 9988;
    if (token == "") {
      token = token + newKey.toString();
    } else {
      token = token + " " + newKey.toString();
    }
  }
  return token;
}

function checkElement(id) {
  return document.getElementById(id).innerHTML;
}

function clearIntervalForStage() {
  if (interval != null) {
    clearInterval(interval);
  }
}

function startGame() {
  if (mode == "singlePlayer") {
    stage = new Stage(15, 15, "stage");
    stage.initialize();
    if (interval != null) {
      clearInterval(interval);
    }
    interval = setInterval(function() {
      stage.step();
    }, 1000);
  } else if (mode == "multiPlayer") {
    if (interval == null) interval = setInterval(step, 1000);
  }
}
function resetGame() {
  clearInterval(interval);
  interval = null;
  score = 0;
}
function playStatus() {
  $("#status").html(status);
}

function playGame() {
  initStage();
  mode = "multiPlayer";
  connectSocket();
  resetGame();
  startGame();
  $("#login").hide();
  $("#Signup").hide();
  $("#wwgame").show();
  $("#left").show();
  $("#profile").show();
  $("#Worlds").hide();
  $("#greeting").html(username);
  status = "In Game";
  playStatus();
}

function playGameSingle() {
  mode = "singlePlayer";
  resetGame();
  startGame();
  $("#Worlds").hide();
  $("#login").hide();
  $("#Signup").hide();
  $("#wwgame").show();
  $("#left").hide();
  $("#profile").show();
  $("#greeting").html(username);
  status = "In Game";
  playStatus();
}

function login() {
  username = $("#loguser").val();
  password = $("#logpw").val();
  if (!checklogin) {
    $("#Worlds").show();
    $("#login").hide();
    $("#Signup").hide();
  }
  checklogin = true;
  $.ajax({
    method: "GET",
    url: "/ww/api/user/" + $("#loguser").val() + "/",
    headers: { authorization: encryption($("#loguser").val()) }
  }).done(function(data) {
    if ("error" in data) {
      username = "";
      password = "";
      init();
      console.log(data["error"]);
      $("#loginstatus").html(data["error"]);
    } else {
      if ("profile" in data) {
        username = $("#loguser").val();
        password = $("#logpw").val();
        $("#loginstatus").html("OK And Click two more times:)");
        updateLogintime();
        mainPage();
        // return true;
      } else {
        var loginstatus = "Invalid Login.To sign up if you are new player";
        $("#loginstatus").html(loginstatus);
        // return false;
      }
    }
  });
}

function signup() {
  var valid = true;
  var registerMsn = "";

  if (
    $("#registerpasswd").val().length > 8 ||
    $("#registerpasswd").val().length == 0
  ) {
    registerMsn = "Invalid password: maximum 8 characters";
    valid = false;
  }
  if ($("#registeruser").val() == "") {
    registerMsn = "User name can not be empty";
    valid = false;
  } else if (
    $("#registeruser")
      .val()
      .match(/[\!\@@\#\$\%\^\&\*\(\)\+\.\,\;\:]/)
  ) {
    registerMsn = "Invalid user: only letters,numbers and underscore allowed";
    valid = false;
  }
  $("#registerMsn").html(registerMsn);
  if (valid) {
    $.ajax({
      method: "POST",
      url: "/ww/api/creatuser",
      data: {
        _id: $("#registeruser").val(),
        password: $("#registerpasswd").val(),
        email: $("#registeremail").val()
      }
    })
      .done(function(data) {
        if (data["error"]) {
          console("signupError", data["error"]);
          $("#registerMsn").html(data["error"]);
          // return false;
        } else {
          username = $("#registeruser").val();
          password = $("#registerpasswd").val();
          mainPage();
          // return true;
          $("#registerMsn").html("OK And Click two more times:)");
        }
      })
      .fail(function(data) {
        $("#registerMsn").html("user already exists");
      });
  }
}

function logout() {
  if (confirm("Are you sure you want to logout ?")) {
    if (socket != null) {
      socket.send(JSON.stringify({ type: "close", userid: username }));
      closeSocket();
    }
    username = "";
    password = "";
    checklogin = false;
    status = "";
    window.location.reload();
  }
}

function insertNewScore() {
  $.ajax({
    method: "POST",
    url: "/ww/api/newscore",
    data: {
      username: username,
      score: score,
      authorization: encryption(username)
    }
  }).done(function(data) {
    if (data["error"]) {
      console.log(data["error"]);
    } else {
      score = 0;
    }
  });
}

function UserProfile() {
  insertNewScore();

  if (socket != null) {
    socket.send(JSON.stringify({ type: "close", userid: username }));
    closeSocket();
  }
  resetGame();

  $("#Allscores").hide();
  $("#UserProfile").show();
  $("#wwgame").hide();
  $("#Worlds").hide();
  $.ajax({
    method: "GET",
    url: "/ww/api/user/" + username + "/",
    headers: { authorization: encryption(username) }
  }).done(function(data) {
    var profile = "";
    profile += "<tr><td>Username: " + data["profile"][0]._id + "</td></tr>";
    profile += "<tr><td>E-mail: " + data["profile"][0].email + "</td></tr>";
    profile +=
      "<tr><td>numGamesPlayed: " +
      data["profile"][0].numGamesPlayed +
      "</td></tr>";
    profile +=
      "<tr><td>lastLogin time: " + data["profile"][0].lastLogin + "</td></tr>";
    $("#showprof").html(profile);
  });

  $.ajax({
    method: "GET",
    url: "/ww/api/user/" + username + "/highScores" + "/",
    headers: { authorization: encryption(username) }
  }).done(function(data) {
    var userscore = "";

    for (i = 0; i < data["userscore"].length; i++) {
      userscore += "<tr><td>" + data["userscore"][i] + "</td></tr>"; // check after;
    }
    if (userscore == "") {
      userscore = "No score available. play and get score!";
    }
    $("#userscore").html(userscore);
  });
}
function updateProfile() {
  var valid = true;
  var updateMsn = "";
  if (
    $("#updatepasswd").val().length > 8 ||
    $("#updatepasswd").val().length == 0
  ) {
    updateMsn = "Invalid password: maximum 8 characters";
    valid = false;
  }
  if ($("#updateemail").val() == "") {
    updateMsn = "Email can not be empty";
    valid = false;
  }
  $("#updateMsn").html(updateMsn);
  if (valid) {
    $.ajax({
      method: "PUT",
      url: "/ww/api/updateuser",
      data: {
        _id: username,
        password: $("#updatepasswd").val(),
        email: $("#updateemail").val()
      }
    }).done(function(data, text_status, jqXHR) {
      if ("error" in data) {
        // console.log(data)
      } else {
        UserProfile();
      }
    });
  }
}
function updateLogintime() {
  $.ajax({
    method: "PUT",
    url: "/ww/api/loginuser",
    data: { _id: username }
  }).done(function(data, text_status, jqXHR) {});
}

function highScore() {
  $.ajax({
    method: "GET",
    url: "/ww/api/highscore/"
  }).done(function(data) {
    var scores = "";
    for (i = 0; i < data["highscore"].length; i++) {
      scores +=
        "<tr><td>" +
        data["highscore"][i].username +
        ": </td><td> " +
        data["highscore"][i].score +
        "</td></tr>";
    }
    $("#scores").html(scores);
  });
}

function increNumberofplay() {
  $.ajax({
    method: "PUT",
    url: "/ww/api/playgame",
    data: { _id: username }
  }).done(function(data, text_status, jqXHR) {});
}

function allhighScore() {
  insertNewScore();
  if (socket != null) {
    socket.send(JSON.stringify({ type: "close", userid: username }));
    closeSocket();
  }
  resetGame();
  $("#wwgame").hide();
  $("#UserProfile").hide();
  $("#Allscores").show();
  $("#Worlds").hide();
  $.ajax({
    method: "GET",
    url: "/ww/api/allhighscore/"
  }).done(function(data) {
    var scores = "";
    for (i = 0; i < data["allhighscore"].length; i++) {
      scores +=
        "<tr><td>" +
        data["allhighscore"][i].username +
        ": </td><td> " +
        data["allhighscore"][i].score +
        "</td></tr>";
    }
    $("#showScores").html(scores);
  });
}

function mainPage() {
  insertNewScore();
  if (socket != null) {
    socket.send(JSON.stringify({ type: "close", userid: username }));
    closeSocket();
  }
  resetGame();
  $("#Allscores").hide();
  $("#UserProfile").hide();
  $("#wwgame").hide();
  $("#Worlds").show();
  $("#Signup").hide();
  $("#login").hide();
}

function rePlayGame() {
  if (mode == "singlePlayer") {
    playGameSingle();
  } else if (mode == "multiPlayer") {
    if (connect) {
      socket.send(JSON.stringify({ type: "close", userid: username }));
      socket.send(JSON.stringify({ type: "replay", userid: username }));
      resetGame();
      startGame();
    } else {
      playGame();
    }
  }
}
function deleteAccount() {
  //
  $.ajax({
    method: "DELETE",
    url: "/ww/api/delete",
    data: { _id: username, authorization: encryption(username) }
  }).done(function(data) {
    if ("error" in data) {
      console.log(data["error"]);
    }
  });
}

function controlUser(pos) {
  if (interval != null) {
    if (mode == "singlePlayer") {
      stage.controlUser(pos);
    } else if (mode == "multiPlayer") {
      socket.send(JSON.stringify({ direction: pos, id: username }));
    }
  }
}
function readKeyboard(keypress) {
  if (interval != null) {
    var x = 0;
    var y = 0;
    var code = keypress.which || keypress.keycode;
    if (code == 90) {
      x = -1;
      y = 1;
    } else if (code == 88) {
      y = 1;
    } else if (code == 67) {
      x = 1;
      y = 1;
    } else if (code == 65) {
      x = -1;
    } else if (code == 68) {
      x = 1;
    } else if (code == 81) {
      x = -1;
      y = -1;
    } else if (code == 87) {
      y = -1;
    } else if (code == 69) {
      x = 1;
      y = -1;
    }
    var pos = [x, y];
    if (mode == "singlePlayer") {
      stage.controlUser(pos);
    } else if (mode == "multiPlayer") {
      return pos;
    }
  }
}
function step() {
  score++;
  $("#score").html(score);
}

function send() {
  socket.send(
    JSON.stringify({ type: "chat", userid: username, msg: $("#message").val() })
  );
  $("#message").val("");
}

function init() {
  $("#login").show();
  $("#Signup").hide();
  $("#wwgame").hide();
  $("#UserProfile").hide();
  $("#Allscores").hide();
  $("#profile").hide();
  $("#Worlds").hide();
  highScore();
}

$(function() {
  init();
  //  playStatus();
  $("#loginSubmit").on("click", function() {
    login();
  });
  $("#newuser").on("click", function() {
    $("#login").hide();
    $("#Signup").show();
  });
  $("#sublogin").on("click", function() {
    $("#login").show();
    $("#Signup").hide();
  });
  $("#signup").click(function() {
    signup();
  });

  $("#userProf").on("click", function() {
    UserProfile();
  });
  $("#scoreinfo").on("click", function() {
    clearInterval(interval);
    interval = null;
    score = 0;
    allhighScore();
  });
  $("#main").on("click", function() {
    mainPage();
  });
  $("#updatebtn").on("click", function() {
    updateProfile();
  });
  $("#sendMsg").on("click", function() {
    send();
  });
  $("#btndelete").on("click", function() {
    deleteAccount();
    if (socket != null) {
      socket.send(JSON.stringify({ type: "close", userid: username }));
      closeSocket();
    }

    username = "";
    password = "";
    checklogin = false;

    window.location.reload();
  });
});

function keyBoardControl() {
  document.addEventListener("keydown", function(keypress) {
    if (socket != null) {
      socket.send(
        JSON.stringify({ direction: readKeyboard(keypress), id: username })
      );
    } else {
      readKeyboard(keypress);
    }
  });
}
var blankImageSrc = document.getElementById("blankImage").src;
var me = document.getElementById("Me").src;
function initStage() {
  var gameStage = document.getElementById("stage");
  var s = "<table id='stageinit' cellspacing='0'>";

  for (y = 0; y < 20; y++) {
    s += "<tr>";
    for (x = 0; x < 20; x++) {
      var pos = "(" + x + "," + y + ")";
      s +=
        "<td><img id= " +
        pos +
        " src=" +
        blankImageSrc +
        " style='height:20'' width:20'/></td>";
    }
    s += "</tr>";
  }
  s += "</table>";
  gameStage.innerHTML = s;
}

keyBoardControl();

function connectSocket() {
  socket = new WebSocket(global.wwWsURL);
  socket.onopen = function(event) {
    connect = true;
    console.log("connected");
    socket.send(JSON.stringify({ type: "newuser", userid: username }));
  };
  socket.onclose = function(event) {
    console.log("disconnected");
    socket.send(JSON.stringify({ type: "close", userid: username }));
    insertNewScore();
    resetGame();
  };
  socket.onmessage = function(event) {
    var res = JSON.parse(event.data);
    if (res.type == "build") {
      document.getElementById(
        "(" + res.x + "," + res.y + ")"
      ).src = document.getElementById(res.src).src;
    } else if (res.type == "lose") {
      if (res.id == username) {
        socket.send(JSON.stringify({ type: "close", userid: username }));
        connect = false;
        status = "Lost Game";
        insertNewScore();
        playStatus();
        socket.close();
      }
    } else if (res.type == "win") {
      status = "YOU WIN!!YEA~";
      playStatus();
      connect = false;
      socket.close();
    } else if (res.type == "users") {
      users = "";
      for (var i = 0; i < res.users.length; i++) {
        users += "<tr><td>" + res.users[i] + "</td></tr>";
      }
      $("#AllUsers").html(users);
    } else if (res.type == "chat") {
      var msg = "<tr><td>" + res.msg + "</td></tr>";
      $("#messages").append(msg);
    } else if (res.type == "draw") {
      var context = document.getElementById("theCanvas").getContext("2d");
      context.fillStyle = "rgba(255,0,0,1)";
      context.fillRect(res.x, res.y, 2, 2);
    } else if (res.type == "player" && res.id == username) {
      document.getElementById("(" + res.x + "," + res.y + ")").src = me;
    }
  };
  $("#theCanvas").mousemove(function(event) {
    var x = event.pageX - this.offsetLeft;
    var y = event.pageY - this.offsetTop;
    socket.send(JSON.stringify({ type: "draw", x: x, y: y }));
  });
}
function closeSocket() {
  socket.close();
}
