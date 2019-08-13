import { FrameWindow } from "javascript-window-framework";
import { RakutenItem } from "../RakutenModule";
import { appManager } from "../../Manager/FrontManager";
import ItemInfo from "./RakutenItemInfo.vue";

export class RakutenItemWindow extends FrameWindow{
  constructor(itemCode:string){
    super();
    this.setPos();
    this.setTitle("商品情報");
    this.addEventListener("closed",()=>{
      appManager.setLocationParam("item",undefined);
    })
     const vueItem = new ItemInfo({data:{itemCode}});
     vueItem.$mount(this.getClient());
  }
}