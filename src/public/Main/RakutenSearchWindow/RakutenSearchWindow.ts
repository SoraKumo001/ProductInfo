import { VueView } from "../../VueView";
import SearchVue from "./RakutenSearch.vue"

export class RakutenSearchWindow extends VueView{
  constructor(genreId:number){
    super({vue:new SearchVue({data:{genreId}}),frame:true});
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