import { Adapter } from "@jswf/adapter";
import { RakutenModule } from "../Module/RakutenModule";
import { ReduxModule } from "@jswf/redux-module";
export interface ManagerState {
  adapter: Adapter;
  rakutenModule: RakutenModule;
}
export class ManagerModule extends ReduxModule<ManagerState> {
  public getAdapter() {
    return this.getState("adapter");
  }
  public getRakutenModule() {
    return this.getState("rakutenModule");
  }
}
