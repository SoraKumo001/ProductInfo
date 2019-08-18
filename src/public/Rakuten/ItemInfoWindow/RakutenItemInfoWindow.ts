
import ItemInfo from "./RakutenItemInfo.vue";
import { VueView } from "@jswf/vue";
import { getManager } from "../..";

export class RakutenItemWindow extends VueView{
  constructor(itemCode:string){
    super({vue:new ItemInfo({data:{itemCode}}),frame:true});
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