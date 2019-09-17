import { FrameWindow } from "@jswf/core";
import React from "react";
import {render} from 'react-dom';
import {RakutenSearch} from "./RakutenSearch";
export class RakutenSearchWindow extends FrameWindow{
  constructor(){
    super();
    render(React.createElement(RakutenSearch,{}),this.getClient());
    this.setSize(600,500);
    this.setPos();
    this.setTitle("検索");

    this.addEventListener("active",(e)=>{
      if(!e.active)
        this.close();
    })
    this.addEventListener("closed",()=>{
      //appManager.setLocationParam("item",undefined);
    })
    this.foreground();
  }
}