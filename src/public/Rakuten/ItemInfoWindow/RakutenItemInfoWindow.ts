
//import ItemInfo from "./RakutenItemInfo.vue";
//import { VueView } from "@jswf/vue";
import { getManager } from "../..";
import { FrameWindow } from "@jswf/core";
import React from "react";
import {render} from 'react-dom';
import {RakutenItemInfo} from "./RakutenItemInfo";

export class RakutenItemWindow extends FrameWindow{
  constructor(itemCode:string){
    super();
    //super({vue:new ItemInfo({data:{itemCode}}),frame:true});
    render(React.createElement(RakutenItemInfo,{itemCode}),this.getClient());
    this.setSize(600,700);
    this.setPos();
    this.setTitle("商品情報");

    this.addEventListener("active",(e)=>{
      if(!e.active)
        this.close();
    })
    this.addEventListener("closed",()=>{
      getManager().setLocationParam("item",undefined);
    })
    this.foreground();
  }
}