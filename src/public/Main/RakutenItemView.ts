import { BaseView } from "javascript-window-framework";
import { RouterModule } from "../Manager/RouterModule";
import { AppManager } from "../Manager/FrontManager";
import { RakutenModule, RakutenItem } from "./RakutenModule";
import Item from "./RakutenItem.vue";
import "./RakutenItemView.scss";

export class RakutenItemView extends BaseView {
  rakutenModule: RakutenModule;
  routerModule: RouterModule;
  nowPage: number = 0;
  itemArea: HTMLDivElement;
  genreId: number = -1;
  public constructor(manager: AppManager) {
    super();
    this.rakutenModule = manager.getModule(RakutenModule);
    this.routerModule = manager.getModule(RouterModule);
    this.routerModule.addEventListener("goLocation", this.location.bind(this));

    const client = this.getClient();
    const itemArea = document.createElement("div");
    itemArea.id = "ItemArea";
    client.appendChild(itemArea);
    this.itemArea = itemArea;

    itemArea.addEventListener("scroll", this.next.bind(this));
  }
  public async next() {
    const itemArea = this.itemArea;
    const count = itemArea.childNodes.length;
    const target = <HTMLDivElement>this.itemArea.childNodes[count - 1];
    if (
      count === 0 ||
      (count === this.nowPage &&
        target.offsetTop - itemArea.scrollTop < itemArea.offsetHeight)
    ) {
      let itemResult = await this.rakutenModule.getGenreItem({
        genreId: this.genreId,
        page: ++this.nowPage
      });
      if (!itemResult) {
        --this.nowPage;
        return false;
      }
      this.createItem(itemResult.Items);
      this.next()
    }
  }
  public location(p: { [key: string]: string }) {
    if (p.genre != null){
      const genreId = parseInt(p.genre);
      if(this.genreId !== genreId)
         this.loadItem(genreId);
    }
  }
  public async loadItem(genreId: number) {
    while (this.itemArea.childNodes.length)
      this.itemArea.removeChild(this.itemArea.childNodes[0]);
    this.genreId = genreId;
    this.nowPage = 0;
    this.next();
    return true;
  }
  public createItem(items: RakutenItem[]) {
    var div = document.createElement("div");
    this.itemArea.appendChild(div);
    const itemNode = new Item({ data: { items } });
    itemNode.$mount(div);
  }
}
