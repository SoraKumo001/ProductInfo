import { ReduxModule } from "@jswf/redux-module";
import { RakutenGenreEntity, RakutenModule } from "./RakutenModule";
import { ManagerModule } from "../Manager.tsx/Module";
import { MessageModule } from "../Parts/MessageText";

interface State {
  entitys: { [key: number]: RakutenGenreEntity };
}

export class RGenreTree extends ReduxModule<State> {
  static includes = [ManagerModule, MessageModule];
  static defaultState: State = { entitys: {} };

  public async load(id?: number) {
    const messageModule = this.getModule(MessageModule);
    const managerModule = this.getModule(ManagerModule);
    const rakutenModule = managerModule.getRakutenModule();
    if (!rakutenModule) return;

    messageModule.setMessage("ジャンルの読み込み中");

    const genre = await rakutenModule.getGenreTree(id || 0, 2);
    if (!genre) {
      messageModule.setMessage("ジャンル読み込みエラー");
      return;
    }
    const src = this.getState("entitys")!;
    const entitys = RGenreTree.setEntity({ ...src }, genre);
    this.setState(entitys);
  }
  private static setEntity(
    target: { [key: number]: RakutenGenreEntity },
    entity: RakutenGenreEntity
  ) {
    target[entity.id] = entity;
    entity.children &&
      entity.children.forEach(entity => this.setEntity(target, entity));
    return target;
  }
  getRoot():RakutenGenreEntity|undefined{
    return this.getState("entitys")![0];
  }
}
