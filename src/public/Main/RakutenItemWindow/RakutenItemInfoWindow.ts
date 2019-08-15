import { appManager } from "../../Manager/FrontManager";
import ItemInfo from "./RakutenItemInfo.vue";
import { VueView, VIEW_PARAMS } from "../../VueView";

export class RakutenItemWindow extends VueView{
  constructor(itemCode:string){
    super({vue:new ItemInfo({data:{itemCode}}),frame:true});
    this.setSize(600,500);
    this.setPos();
    this.setTitle("商品情報");

    this.addEventListener("active",(e)=>{
      if(!e.active)
        this.close();
    })
    this.addEventListener("closed",()=>{
      appManager.setLocationParam("item",undefined);
    })
    this.foreground();
  }
}