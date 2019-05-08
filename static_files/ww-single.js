// Stage
// Note: Yet another way to declare a class, using .prototype.

function Stage(width, height, stageElementID) {
  this.actors = [];
  this.player = null;
  this.playedTime = 0;
  this.pause = false;
  this.status = "";
  this.width = width;
  this.height = height;
  this.stageElementID = stageElementID;
  this.blankImageSrc = document.getElementById("blankImage").src;
  this.monsterImageSrc = document.getElementById("monsterImage").src;
  this.meImageSrc = document.getElementById("Me").src;
  this.boxImageSrc = document.getElementById("boxImage").src;
  this.wallImageSrc = document.getElementById("wallImage").src;
  this.devilImageSrc = document.getElementById("devilImage").src;
}

// initialize an instance of the game
Stage.prototype.initialize = function() {
  // Create a table of blank images, give each image an ID so we can reference it later
  var s = "<table id='stageinit' cellspacing='0'>";
  var cw = Math.round(this.width / 2 - 1);
  var ch = Math.round(this.height / 2 - 1);
  for (var y = 0; y < this.height; y++) {
    s += "<tr>";
    for (var x = 0; x < this.width; x++) {
      if ((x == cw && y == ch) || false) {
        s +=
          "<td><img id=" +
          this.getStageId(x, y) +
          " src=" +
          this.meImageSrc +
          " style='height:25'' width:25'/></td>";
        player = new Player(this, y, x);
        this.addActor(player);
        this.player = player;
      } else {
        var prob = Math.random();
        if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
          s +=
            "<td><img id=" +
            this.getStageId(x, y) +
            " src=" +
            this.wallImageSrc +
            " style='height:25'' width:25'/></td>";
          wall = new Wall(this, x, y);
          this.addActor(wall);
        } else if (prob < 0.07 && prob > 0.02) {
          s +=
            "<td><img id=" +
            this.getStageId(x, y) +
            " src=" +
            this.monsterImageSrc +
            " style='height:25'' width:25'/></td>";
          monster = new Monster(this, x, y);
          this.addActor(monster);
        } else if (prob < 0.4 && prob > 0.07) {
          s +=
            "<td><img id=" +
            this.getStageId(x, y) +
            " src=" +
            this.boxImageSrc +
            " style='height:25'' width:25'/></td>";
          box = new Box(this, x, y);
          this.addActor(box);
        } else {
          s +=
            "<td><img id=" +
            this.getStageId(x, y) +
            " src=" +
            this.blankImageSrc +
            " style='height:25'' width:25'/></td>";
        }
      }
    }
    s += "</tr>";
  }
  s += "</table>";
  document.getElementById("stage").innerHTML = s;
};
// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId = function(x, y) {
  return "(" + x + "," + y + ")";
};

Stage.prototype.addActor = function(actor) {
  this.actors.push(actor);
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

Stage.prototype.removeActor = function(actor) {
  var index = this.actors.indexOf(actor);
  document.getElementById(
    "(" + actor.x + "," + actor.y + ")"
  ).src = this.blankImageSrc;
  this.actors.splice(index, 1);
};

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage = function(x, y, src) {
  document.getElementById(this.getStageId(x, y)).src = src;
};
Stage.prototype.getImageSrc = function(x, y) {
  return document.getElementById("(" + x + "," + y + ")").src;
};

Stage.prototype.getMonsterNumber = function() {
  var total = 0;
  for (var count = 0; count < this.actors.length; count++) {
    if (this.actors[count] instanceof Monster) {
      total += 1;
    }
  }
  return total;
};

// Take one step in the animation of the game.
Stage.prototype.step = function() {
  if (this.getMonsterNumber() == 0) {
    this.status = "win";

    document.getElementById("status").innerHTML = "you win!";
  } else if (this.player == null) {
    this.status = "lose";
    document.getElementById("status").innerHTML = "you lose!";
  } else if (this.pause == false) {
    for (var i = 0; i < this.actors.length; i++) {
      this.actors[i].step();
    }
  }
};

Stage.prototype.pause = function() {
  this.pause = true;
  this.controlUser(false);
};

Stage.prototype.resume = function() {
  this.pause = false;
  this.controlUser(true);
};

Stage.prototype.controlUser = function(pos) {
  player.move(player, pos[0], pos[1]);
};

// End Class Stage

Stage.prototype.getPlayTime = function() {
  return this.playedTime;
};

Stage.prototype.getStatus = function() {
  return this.status;
};

function Player(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Player.prototype.step = function() {
  return;
};

Player.prototype.move = function(asker, x, y) {
  var newx = this.x + x;
  var newy = this.y + y;

  if (asker instanceof Monster) {
    this.stage.removeActor(this.stage.player);
    this.stage.player = null;
    return true;
  } else {
    var dest = this.stage.getActor(newx, newy);
    if (dest instanceof Monster) {
      this.stage.removeActor(this.stage.player);
      this.stage.player = null;
      // player=null;
      return false;
    } else if (dest == null || dest.move(this, x, y)) {
      this.stage.removeActor(this);
      this.x = newx;
      this.y = newy;
      this.stage.addActor(this);
      this.stage.setImage(this.x, this.y, this.stage.meImageSrc);
      return true;
    } else {
      return false;
    }
  }
};

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

Monster.prototype.step = function() {
  if (this.checkDeath() == true) {
    this.stage.removeActor(this);
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
          dest instanceof Monster
        )
      ) {
        this.move(this, this.xSteps[randMove], this.ySteps[randMove]);
        blockElement = true;
      }
    }
  }
};

Monster.prototype.move = function(asker, x, y) {
  if (!(asker === this)) {
    return false;
  }
  var newx = this.x + x;
  var newy = this.y + y;

  dest = this.stage.getActor(newx, newy);

  if (dest == null || dest.move(this, x, y)) {
    this.stage.removeActor(this);
    this.x = newx;
    this.y = newy;
    this.stage.addActor(this);

    this.stage.setImage(this.x, this.y, this.stage.monsterImageSrc);
    //        if(dest instanceof Player){
    //
    //        }
    return true;
  } else {
    return false;
  }
};

function Box(stage, x, y) {
  this.x = x;
  this.y = y;
  this.stage = stage;
}

Box.prototype.step = function() {
  return;
};

Box.prototype.move = function(asker, x, y) {
  var newx = this.x + x;
  var newy = this.y + y;

  dest = this.stage.getActor(newx, newy);

  if (
    (asker instanceof Player || asker instanceof Box) &&
    (dest == null || dest.move(this, x, y))
  ) {
    this.stage.removeActor(this);
    this.x = newx;
    this.y = newy;

    this.stage.addActor(this);
    this.stage.setImage(this.x, this.y, this.stage.boxImageSrc);
    return true;
  } else {
    return false;
  }
};

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
