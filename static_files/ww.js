// Stage
// Note: Yet another way to declare a class, using .prototype.
require("./constants.js");
function Stage(width, height) {
  this.actors = [];
  this.width = width;
  this.height = height;
  this.cw = Math.round(this.width / 2 - 1);
  this.ch = Math.round(this.height / 2 - 1);
}
// initialize an instance of the game
Stage.prototype.initialize = function() {
  for (y = 0; y < this.height; y++) {
    for (x = 0; x < this.width; x++) {
      var prob = Math.random();
      if (y == this.ch && x == this.cw) {
        player = new Player(this, y, x);
        this.addActor(player);
      } else {
        if (y == 0 || x == 0 || y == this.height - 1 || x == this.width - 1) {
          wall = new Wall(this, x, y);
          this.addActor(wall);
        } else if (x == 1 && y == 1) {
          devil = new Devil(this, x, y);
          this.addActor(devil);
        } else if (prob < 0.07 && prob > 0.05) {
          monster = new Monster(this, x, y);
          this.addActor(monster);
        } else if (prob < 0.4 && prob > 0.1) {
          box = new Box(this, x, y);
          this.addActor(box);
        } else {
          continue;
        }
      }
    }
  }
};
Stage.prototype.buildSatge = function(ws) {
  for (y = 0; y < this.height; y++) {
    for (x = 0; x < this.width; x++) {
      cell = this.getActor(x, y);
      if (cell instanceof Monster) {
        ws.send(
          JSON.stringify({ type: "build", x: x, y: y, src: "monsterImage" })
        );
      } else if (cell instanceof Box) {
        ws.send(JSON.stringify({ type: "build", x: x, y: y, src: "boxImage" }));
      } else if (cell instanceof Player) {
        ws.send(
          JSON.stringify({ type: "build", x: x, y: y, src: "playerImage" })
        );
      } else if (cell instanceof Wall) {
        ws.send(
          JSON.stringify({ type: "build", x: x, y: y, src: "wallImage" })
        );
      } else if (cell instanceof Devil) {
        ws.send(
          JSON.stringify({ type: "build", x: x, y: y, src: "devilImage" })
        );
      } else {
        ws.send(
          JSON.stringify({ type: "build", x: x, y: y, src: "blankImage" })
        );
      }
    }
  }
};

// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId = function(x, y) {
  return "(" + x + "," + y + ")";
};
// Set the src of the image at stage location (x,y) to src
Stage.setImage = function(x, y, src) {
  wss.broadcast(JSON.stringify({ type: "build", src: src, x: x, y: y }));
};
Stage.prototype.addActor = function(actor) {
  this.actors.push(actor);
};

Stage.prototype.removeActor = function(actor) {
  // Lookup javascript array manipulation (indexOf and splice).
  var index = this.actors.indexOf(actor);
  this.actors.splice(index, 1);
};

Stage.prototype.getPlayer = function(id) {
  for (var i = 0; i < this.actors.length; i++) {
    if (this.actors[i].id == id && this.actors[i] instanceof Player) {
      return this.actors[i];
    }
  }
  return false;
};
Stage.prototype.removePlayer = function(id) {
  for (var i = 0; i < this.actors.length; i++) {
    if (this.actors[i].id == id && this.actors[i] instanceof Player) {
      Stage.setImage(this.actors[i].x, this.actors[i].y, "blankImage");
      this.actors.splice(i, 1);
    }
  }
};
// return the first actor at coordinates (x,y) return null if there is no such actor
// there should be only one actor at (x,y)!
Stage.prototype.getActor = function(x, y) {
  for (var i = 0; i < this.actors.length; i++) {
    if (this.actors[i].x == x && this.actors[i].y == y) {
      return this.actors[i];
    }
  }
  return null;
};

Stage.prototype.getMonsterNumber = function() {
  var total = 0;
  for (var count = 0; count < this.actors.length; count++) {
    if (this.actors[count] instanceof Monster) {
      this.actors[count].move();
      total += 1;
    } else if (this.actors[count] instanceof Devil) {
      this.actors[count].move();
      total += 1;
    }
  }
  return total;
};

Stage.prototype.movePlayer = function(direction, id) {
  for (var count = 0; count < this.actors.length; count++) {
    if (this.actors[count] instanceof Player && this.actors[count].id == id) {
      this.actors[count].move(direction);
      break;
    }
  }
};
Stage.prototype.moveBoxes = function(x, y, direction) {
  var box = this.getActor(x, y);
  var index = this.actors.indexOf(box);
  if (box == null) {
    return true;
  }
  if (!(box instanceof Box)) {
    return false;
  }
  return this.actors[index].move(direction);
};

//====================================== Player ================================
function Player(stage, x, y, id) {
  this.x = x;
  this.y = y;
  this.stage = stage;
  this.id = id;
}

Player.prototype.move = function(direc) {
  var dirx = direc[0];
  var diry = direc[1];
  var dest = this.stage.getActor(this.x + dirx, this.y + diry);
  if (dest instanceof Monster || dest instanceof Devil) {
    this.stage.removePlayer(this.id);
    wss.broadcast(JSON.stringify({ id: this.id, type: "lose" }));
  } else if (dirx != 0 || diry != 0) {
    if (this.stage.moveBoxes(this.x + dirx, this.y + diry, direc)) {
      Stage.setImage(this.x, this.y, "blankImage");
      this.x = this.x + dirx;
      this.y = this.y + diry;
      Stage.setImage(this.x, this.y, "playerImage");
    }
  }
};

//====================================== Monster ================================
function Monster(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
  this.xSteps = [1, 0, -1, 1, -1, 1, 0, -1];
  this.ySteps = [1, 1, 1, 0, 0, -1, -1, -1];
}

Monster.prototype.checkDeath = function() {
  var surrounding = 0;

  for (var count = 0; count < this.xSteps.length; count++) {
    var dest = this.stage.getActor(
      this.x + this.xSteps[count],
      this.y + this.ySteps[count]
    );
    if (dest != null && !(dest instanceof Player)) {
      surrounding += 1;
    }
  }
  if (surrounding == 8) {
    return true;
  } else {
    return false;
  }
};

Monster.prototype.move = function() {
  if (this.checkDeath() == true) {
    this.stage.removeActor(this);
    Stage.setImage(this.x, this.y, "blankImage");
  } else {
    var blockElement = false;
    while (blockElement == false) {
      var randMove = Math.floor(Math.random() * 8);
      var dest = this.stage.getActor(
        this.x + this.xSteps[randMove],
        this.y + this.ySteps[randMove]
      );
      if (
        !(
          dest instanceof Box ||
          dest instanceof Wall ||
          dest instanceof Monster ||
          dest instanceof Devil
        )
      ) {
        Stage.setImage(this.x, this.y, "blankImage");
        this.x += this.xSteps[randMove];
        this.y += this.ySteps[randMove];
        Stage.setImage(this.x, this.y, "monsterImage");
        if (dest != null && dest instanceof Player) {
          wss.broadcast(JSON.stringify({ id: dest.id, type: "lose" }));
          //                    console.log("222===You lose!");
          this.stage.removeActor(dest);
        }
        blockElement = true;
      }
    }
  }
};
//====================================== Devil ================================

function Devil(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
  this.xSteps = [1, -1, 1, -1];
  this.ySteps = [1, 1, -1, -1];
  //    this.xSteps=[1,0,-1,1,-1,1,0,-1];
  //    this.ySteps=[1,1,1,0,0,-1,-1,-1];
}
Devil.prototype.checkDeath = function() {
  var surrounding = 0;

  for (var count = 0; count < this.xSteps.length; count++) {
    var dest = this.stage.getActor(
      this.x + this.xSteps[count],
      this.y + this.ySteps[count]
    );
    if (dest != null && !(dest instanceof Player)) {
      surrounding += 1;
    }
  }
  if (surrounding == 8) {
    return true;
  } else {
    return false;
  }
};

Devil.prototype.move = function() {
  if (this.checkDeath() == true) {
    this.stage.removeActor(this);
    Stage.setImage(this.x, this.y, "blankImage");
  } else {
    var blockElement = false;
    while (blockElement == false) {
      var randMove = Math.floor(Math.random() * 4);
      var dest = this.stage.getActor(
        this.x + this.xSteps[randMove],
        this.y + this.ySteps[randMove]
      );
      if (
        !(
          dest instanceof Box ||
          dest instanceof Wall ||
          dest instanceof Monster ||
          dest instanceof Devil
        )
      ) {
        Stage.setImage(this.x, this.y, "blankImage");
        this.x += this.xSteps[randMove];
        this.y += this.ySteps[randMove];
        Stage.setImage(this.x, this.y, "devilImage");
        if (dest != null && dest instanceof Player) {
          wss.broadcast(JSON.stringify({ id: dest.id, type: "lose" }));
          this.stage.removeActor(dest);
        }
        blockElement = true;
      }
    }
  }
};

//====================================== Box ================================
function Box(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Box.prototype.move = function(direc) {
  var dirx = direc[0];
  var diry = direc[1];
  if (dirx != 0 || diry != 0) {
    var actor = this.stage.getActor(this.x + dirx, this.y + diry);
    if (actor == null) {
      Stage.setImage(this.x, this.y, "blankImage");
      this.x = this.x + dirx;
      this.y = this.y + diry;
      Stage.setImage(this.x, this.y, "boxImage");
      return true;
    }
    if (!(actor instanceof Box)) {
      return false;
    }
    if (actor.move(direc)) {
      Stage.setImage(this.x, this.y, "blankImage");
      this.x = this.x + dirx;
      this.y = this.y + diry;
      Stage.setImage(this.x, this.y, "boxImage");
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
//====================================== Wall ================================
function Wall(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Wall.prototype.step = function() {
  return;
};

Wall.prototype.move = function(asker, x, y) {
  return false;
};

stage = null;
interval = null;
function setupGame() {
  stage = new Stage(20, 20);
  stage.initialize();
}
function startGame() {
  if (interval == null) {
    interval = setInterval(step, 1000);
  }
}
function pauseGame() {
  clearInterval(interval);
}
function resetGame() {
  stage = null;
  interval = null;
}
function step() {
  var monsters = stage.getMonsterNumber();
  if (monsters == 0) {
    wss.broadcast(JSON.stringify({ type: "win" }));
    resetGame();
    setupGame();
    startGame();
  }
}

setupGame();
startGame();

var worlds = {};
worlds["terrible"] = {};
worlds["challenger"] = {};
worlds["beginner"] = {};
worlds["state"] = "";
worlds["users"] = [];

(WebSocketServer = require("ws").Server),
  (wss = new WebSocketServer({ port: wwWsPort }));

wss.on("close", function() {
  console.log("disconnected");
  worlds["status"] = "offline";
});

wss.broadcast = function(message) {
  for (let ws of this.clients) {
    ws.send(message);
  }
};

wss.on("connection", function(ws) {
  ws.on("message", function(message) {
    var userAction = JSON.parse(message);
    if (userAction.type == "newuser") {
      var userID = userAction.userid;

      worlds["users"].push(userID);
      wss.broadcast(JSON.stringify({ type: "users", users: worlds["users"] }));
      stage.addActor(new Player(stage, stage.cw, stage.ch, userID));
      stage.buildSatge(ws);
    } else if (userAction.type == "replay") {
      var userID = userAction.userid;
      worlds["users"].push(userID);
      wss.broadcast(JSON.stringify({ type: "users", users: worlds["users"] }));
      stage.addActor(new Player(stage, stage.cw, stage.ch, userID));
      stage.buildSatge(ws);
    } else if (userAction.type == "close") {
      var userID = userAction.userid;
      stage.removePlayer(userID);
      worlds["users"].splice(worlds["users"].indexOf(userID), 1);
      wss.broadcast(JSON.stringify({ type: "users", users: worlds["users"] }));
    } else if (userAction.type == "chat") {
      var userID = userAction.userid;
      var msg = userAction.msg;
      var newMsg = userID + ": " + msg;
      wss.broadcast(
        JSON.stringify({ type: "chat", users: worlds["users"], msg: newMsg })
      );
    } else if (userAction.type == "draw") {
      wss.broadcast(message);
    } else {
      var player = stage.getPlayer(userAction.id);
      if (player) {
        stage.movePlayer(userAction.direction, userAction.id);
        wss.broadcast(
          JSON.stringify({
            type: "player",
            id: userAction.id,
            x: player.x,
            y: player.y
          })
        );
      }
    }
  });
});
