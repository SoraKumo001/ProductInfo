import { ReduxModule } from "@jswf/redux-module";
import { RakutenGenreEntity } from "./RakutenModule";
import { ManagerModule } from "../Manager.tsx/Module";
import { MessageModule } from "../Parts/MessageText";

export interface State {
  apiKey?: string;
  entitys: { [key: number]: RakutenGenreEntity };
}
export class RGenreTreeModule extends ReduxModule<State> {
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
    const entitys = RGenreTreeModule.setEntity({ ...src }, genre);
    if (genre.parentId !== null) {
      const parent = entitys[genre.parentId];
      if (parent) {
        parent.children = parent.children.map(entity =>
          entity.id === id ? genre : entity
        );
      }
    }
    this.setState({ entitys });
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
  getRoot(): RakutenGenreEntity | undefined {
    return this.getState("entitys")![0];
  }
  getEntitys(): { [key: number]: RakutenGenreEntity } {
    return this.getState("entitys")!;
  }

}
