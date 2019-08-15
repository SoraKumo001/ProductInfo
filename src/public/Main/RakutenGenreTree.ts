import { TreeView, TreeItem } from "javascript-window-framework";
import { AppManager, appManager } from "../Manager/FrontManager";
import { RouterModule } from "../Manager/RouterModule";
import { RakutenModule, RakutenGenreEntity } from "./RakutenModule";

export class RakutenGenreTree extends TreeView {
  rakutenModule: RakutenModule;
  routerModule: RouterModule;
  public constructor(manager: AppManager) {
    super();
    this.rakutenModule = manager.getModule(RakutenModule);
    this.routerModule = manager.getModule(RouterModule);
    this.routerModule.addEventListener("goLocation", this.location.bind(this));

    this.addEventListener("itemOpen", e => {
      if (e.opened) this.load(e.item.getItemValue() as number);
    });
    this.addEventListener("itemSelect", e => {
      if (e.item && e.user)
        appManager.goLocation({ genre: <number>e.item.getItemValue() ,tags:null,keyword:null});
      //this.load(e.item.getItemValue() as number);
    });
  }
  public async load(id?: number) {
    let item = id ? this.findItemFromValue(id) : this.getRootItem();
    if (!item || item.getKey("children")) return;
    const genre = await this.rakutenModule.getGenreTree(id || 0, 2);
    if (!genre) return;
    item.setKey("children", true);

    const setGenre = (item: TreeItem, genre: RakutenGenreEntity) => {
      item.setItemText(genre.name);
      item.setItemValue(genre.id);
      if (genre.children) {
        genre.children.forEach(child => {
          const childItem = item.findItemFromValue(child.id);
          setGenre(childItem || item.addItem(""), child);
        });
      }
    };
    setGenre(item, genre);
  }
  async location(p: { [key: string]: string }) {
    let genreId = 0;
    if (p.genre != null) genreId = parseInt(p.genre);
    const item = this.findItemFromValue(genreId);
    if (item) {
      if (item != this.getSelectItem()) item.selectItem(true);
      return;
    }
    const genre = await this.rakutenModule.getGenreParent(genreId);
    if (genre) {
      const setGenre = (treeItem: TreeItem, genre: RakutenGenreEntity) => {
        treeItem.setItemText(genre.name);
        treeItem.setItemValue(genre.id);

        if (genre.children) {
          genre.children.forEach(child => {
            const childItem = treeItem.findItemFromValue(child.id);
            setGenre(childItem || treeItem.addItem("", true), child);
          });
        }
      };
      setGenre(this.getRootItem(), genre);
      this.selectItemFromValue(genreId, true);
    }
    // if (p.genre != null) this.loadItem(parseInt(p.genre));
  }
}
