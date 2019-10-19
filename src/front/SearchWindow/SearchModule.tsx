import { RakutenGenreEntity } from "../Module/RakutenModule";
import { ReduxModule } from "@jswf/redux-module";
interface State {
  visible: boolean;
  genre?: RakutenGenreEntity;
  genres?: {
    id: number;
    name: string;
  }[];
  selectGenreId: number;
  keyword?: string;
  tags: Set<number>;
}
export class SearchModule extends ReduxModule<State> {
  static defaultState: State = { visible: false, selectGenreId: 0, tags: new Set() };
}
