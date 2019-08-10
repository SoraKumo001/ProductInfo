import { TreeView, TreeItem } from "javascript-window-framework";
import { AppManager } from "../Manager/FrontManager";
import { BaseModule } from "../Manager/BaseModule";

export interface RakutenGenreEntity {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  children: RakutenGenreEntity[];
}

class RakutenModule extends BaseModule {
  async getGenreTree(
    id: number,
    level: number
  ): Promise<RakutenGenreEntity | undefined> {
    return this.getAdapter().exec("RakutenModule.getTree", id, level);
  }
}

export class RakutenGenreTree extends TreeView {
  rakutenModule: RakutenModule;
  public constructor(manager: AppManager) {
    super();
    this.rakutenModule = manager.getModule(RakutenModule);
    this.addEventListener("itemOpen",(e)=>{
      if(e.opened)
        this.load(e.item.getItemValue() as number);
    })
  }
  public async load(id?:number) {
    let item = id?this.findItemFromValue(id):this.getRootItem();
    if(!item || item.getKey("children"))
      return;
    const genre = await this.rakutenModule.getGenreTree(id||0, 3);
    if (!genre) return;
    item.setKey("children",true);

    const setGenre = (item: TreeItem, genre: RakutenGenreEntity) => {
      item.setItemText(genre.name);
      item.setItemValue(genre.id);
      if (genre.children){
        genre.children.forEach(child => {
          const childItem = item.findItemFromValue(child.id);
          setGenre(childItem || item.addItem(""), child);
        });
      }
    };
    setGenre(item, genre);
  }
}
