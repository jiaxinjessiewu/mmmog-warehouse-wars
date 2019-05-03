import React, { Component } from "react";
import ReactDom from "react-dom";

class Single extends Component {
  constructor() {
    super();
    this.state = {
      actors: [],
      player: [],
      playerTime: 0,
      status: "",
      width: 25,
      height: 25,
      stageElementId: "stage",
      blankImage: document.getElementById("blankImage").src,
      monsterImageSrc: document.getElementById("blankImage").src,
      meImageSrc: document.getElementById("Me").src,
      boxImageSrc: document.getElementById("boxImage").src,
      wallImageSrc: document.getElementById("wallImageSrc").src,
      devilImageSrc: document.getElementById("devilImage").src
    };
  }

  componentDidMount() {
    //   like $onInit, every time will be run after refresh
  }

  addActor(actor) {
    // add actor to the this.state.actors
  }

  getStageId(x, y) {
    return "(" + x + "," + y + ")";
  }
  addActor(x, y) {
    this.setState(preState => {
      return {
        actors: preState.actors.push([x, y])
      };
    });
  }

  render() {
    console.log("here single");
    // var swipers;
    // swipers=this.state.images.map((item,index)=>{

    //   return(
    //     <SwiperItem>
    //       <View className='swiper-images'>
    //         <Image src={item}>1</Image>
    //       </View>
    //     </SwiperItem>
    //   )

    // });
    var cw = Math.round(this.state.width / 2 - 1);
    var ch = Math.round(this.state.height / 2 - 1);

    // for (var y = 0; y < this.height; y++) {
    //   s += "<tr>";
    //   for (var x = 0; x < this.width; x++) {
    //     if ((x == cw && y == ch) || false) {
    //       s +=
    //         "<td><img id=" +
    //         this.getStageId(x, y) +
    //         " src=" +
    //         this.meImageSrc +
    //         " style='height:25'' width:25'/></td>";
    //       player = new Player(this, y, x);
    //       this.addActor(player);
    //       this.player = player;
    //     } else {
    //       var prob = Math.random();
    //       if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
    //         s +=
    //           "<td><img id=" +
    //           this.getStageId(x, y) +
    //           " src=" +
    //           this.wallImageSrc +
    //           " style='height:25'' width:25'/></td>";
    //         wall = new Wall(this, x, y);
    //         this.addActor(wall);
    //       } else if (prob < 0.07 && prob > 0.02) {
    //         s +=
    //           "<td><img id=" +
    //           this.getStageId(x, y) +
    //           " src=" +
    //           this.monsterImageSrc +
    //           " style='height:25'' width:25'/></td>";
    //         monster = new Monster(this, x, y);
    //         this.addActor(monster);
    //       } else if (prob < 0.4 && prob > 0.07) {
    //         s +=
    //           "<td><img id=" +
    //           this.getStageId(x, y) +
    //           " src=" +
    //           this.boxImageSrc +
    //           " style='height:25'' width:25'/></td>";
    //         box = new Box(this, x, y);
    //         this.addActor(box);
    //       } else {
    //         s +=
    //           "<td><img id=" +
    //           this.getStageId(x, y) +
    //           " src=" +
    //           this.blankImageSrc +
    //           " style='height:25'' width:25'/></td>";
    //       }
    //     }
    //   }
    //   s += "</tr>";
    // }
    var initTable = [];
    for (var y = 0; y < this.state.height; y++) {
      var row = [];
      row.push(React.createElement("<tr id=" + y + "></tr>"));
      for (var x = 0; x < this.state.width; x++) {
        var item = [];
        if ((x == cw && y == ch) || false) {
          item.push(
            React.createElement(
              "<td><img id=(" +
                x +
                "," +
                y +
                ") src=" +
                this.state.meImageSrc +
                " style='height:25'' width:25'/></td>"
            )
          );
          //   const newState = this.state;
          //   newState.player = [x, y];
          //   this.setState(newState);
        } else {
          var prob = Math.random();
          if (
            x == 0 ||
            y == 0 ||
            x == this.state.width - 1 ||
            y == this.state.height - 1
          ) {
            // wall = new Wall(this, x, y);
            // this.addActor(wall);
            item.push(
              React.createElement(
                "<td><img id=(" +
                  x +
                  "," +
                  y +
                  ") src=" +
                  this.state.wallImageSrc +
                  " style='height:25'' width:25'/></td>"
              )
            );
            // const newState = this.state;
            // newState.player = [x, y];
            // this.setState(newState);
          } else if (prob < 0.07 && prob > 0.02) {
            // monster = new Monster(this, x, y);
            // this.addActor(monster);
            item.push(
              React.createElement(
                "<td><img id=(" +
                  x +
                  "," +
                  y +
                  ") src=" +
                  this.state.monsterImageSrc +
                  " style='height:25'' width:25'/></td>"
              )
            );
          } else if (prob < 0.4 && prob > 0.07) {
            item.push(
              React.createElement(
                "<td><img id=(" +
                  x +
                  "," +
                  y +
                  ") src=" +
                  this.state.boxImageSrc +
                  " style='height:25'' width:25'/></td>"
              )
            );
            // box = new Box(this, x, y);
            // this.addActor(box);
          } else {
            item.push(
              React.createElement(
                "<td><img id=(" +
                  x +
                  "," +
                  y +
                  ") src=" +
                  this.state.blankImage +
                  " style='height:25'' width:25'/></td>"
              )
            );
          }
        }
        row.push(item);
        initTable.push(row);
      }
    }

    return (
      <div>
        <h1>Warehouse Wars Game</h1>
        <table id="stageinit" cellspacing="0">
          <initTable />
        </table>
      </div>
    );
  }
}
export default Single;
