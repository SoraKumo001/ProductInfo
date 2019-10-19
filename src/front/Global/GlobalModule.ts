import { ReduxModule } from "@jswf/redux-module";

interface State{
  GenreName:string;
}

export class GlobalModule extends ReduxModule<State> {
  static defaultState: State = { GenreName:"" };
}