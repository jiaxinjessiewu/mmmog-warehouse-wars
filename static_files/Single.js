import React, { Component } from "react";
import ReactDom from "react-dom";

class Single extends Component {
  constructor() {
    super();
    this.state = {
      actors: [],
      player: "",
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

  render() {
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

    return (
      <div>
        <h1>Warehouse Wars Game</h1>
        <table id="stageinit" cellspacing="0">
          <tr />
        </table>
      </div>
    );
  }
}
export default Single;
