import { ReduxModule } from "@jswf/redux-module";
import { ManagerModule } from "../Manager.tsx/Module";

interface State {
  apiKey: string;
}

export class RakutenOptionModule extends ReduxModule<State> {
  static defaultState: State = { apiKey: "" };
  static includes = [ManagerModule];
  setApiKey(apiKey: string) {
    if (this.getState("apiKey") === apiKey) return;
    const managerModule = this.getModule(ManagerModule);
    const rakutenModule = managerModule.getRakutenModule();
    if (!rakutenModule) return;
    rakutenModule
      .setApiKey(apiKey)
      .then(result => result && this.setState(apiKey, "apiKey"));
  }
  getApiKey() {
    return this.getState("apiKey");
  }
  loadApiKey() {
    const managerModule = this.getModule(ManagerModule);
    const rakutenModule = managerModule.getRakutenModule();
    if (!rakutenModule) return;
    rakutenModule.getApiKey().then(apiKey => {
      if (this.getState("apiKey") !== apiKey) this.setState({ apiKey });
    });
  }
}
