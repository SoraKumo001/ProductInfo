import * as React from "react";
import { LocationModule } from "../Router";
import {
  RakutenItem,
  RakutenGenreEntity,
  RakutenItemResult,
  ItemOptions,
  RakutenTagEntity
} from "../Module/RakutenModule";
import { Root } from "./RakutenItemList.style";
import { LoadingImage } from "../Parts/LodingImage";
import { mapConnect, mapModule } from "@jswf/redux-module";
import { RakutenItemView } from "./RakutenItem";
import { ManagerModule } from "../Manager.tsx/Module";

interface State {
  genreId: number;
  keyword: string;
  tags: string;
  items: RakutenItem[];
  genre: RakutenGenreEntity | null;
  tagNames: string[];
  loading: boolean;
}

export class _RakutenItemList extends React.Component<{}, State> {
  allPage: number = -1;
  page: number = 0;
  Root: React.RefObject<HTMLDivElement> = React.createRef();
  state: State = {
    genreId: -1,
    keyword: "",
    tags: "",
    items: [],
    genre: null,
    tagNames: [],
    loading: false
  };

  render() {
    const items = this.state.items || [];
    return (
      <Root ref={this.Root} onScroll={this.next.bind(this)}>
        {this.state.loading && <LoadingImage width={96} height={96} />}
        <div id="items">
          {items.map((item) => <RakutenItemView key={item.itemCode} item={item}/>)}
        </div>
      </Root>
    );
  }

  public componentDidMount() {
    const locationModule = mapModule(this.props, LocationModule);
    const location = locationModule.getLocation()!;
    this.location(location);
  }

  componentDidUpdate() {
    const locationModule = mapModule(this.props, LocationModule);
    const location = locationModule.getLocation()!;
    this.location(location);
  }

  public async next() {
    const managerModule = mapModule(this.props, ManagerModule);
    this.refs[0];
    const itemArea = this.Root.current!;
    const target = itemArea.querySelector("#items") as HTMLDivElement;
    if (this.state.genreId < 0) return false; //ジャンルが設定されていなければ終了
    //スクロール位置のチェック
    if (
      this.allPage === -1 ||
      target.offsetTop +
        target.offsetHeight -
        itemArea.scrollTop -
        itemArea.offsetHeight <
        itemArea.offsetHeight
    ) {
      //ページカウントのチェック
      if (this.allPage !== -1 && this.page >= this.allPage) return false;
      const params = {
        keyword: this.state.keyword ? this.state.keyword : undefined,
        tags: this.state.tags ? this.state.tags : undefined,
        genreId: this.state.genreId,
        page: ++this.page
      };
      //アイテムデータの読み込みとキャッシュ
      const paramIndex = JSON.stringify(params);
      const sessionValue = sessionStorage.getItem(paramIndex);
      let itemResult: RakutenItemResult | undefined;
      if (sessionValue) itemResult = JSON.parse(sessionValue);
      if (!itemResult) {
        itemResult = await managerModule
          .getRakutenModule()!
          .getGenreItem(params as ItemOptions);
        sessionStorage.setItem(paramIndex, JSON.stringify(itemResult));
      }
      if (!itemResult) {
        --this.page;
        return false;
      }

      this.allPage = itemResult.pageCount;
      if (!this.state.items) this.setState({ items: itemResult.Items });
      else {
        this.state.items.push(...itemResult.Items);
        this.forceUpdate(() => {
          this.next();
        });
      }
    }
  }
  public location(p: { [key: string]: string }) {
    const genreId = p.genre != null ? parseInt(p.genre) : 0;
    const keyword = p.keyword || "";
    const tags = p.tags || "";
    if (
      this.state.genreId !== genreId ||
      this.state.keyword !== keyword ||
      this.state.tags !== tags
    ) {
      this.setState({ genreId, keyword, tags }, () => {
        this.loadItems();
      });

      return true;
    }
    return false;
  }
  public async loadItems() {
    const managerModule = mapModule(this.props, ManagerModule);
    this.allPage = -1;
    this.page = 0;
    this.setState({ items: [], genre: null, tagNames: [] });

    this.setState({ loading: true });
    this.next()
      .then(() => {
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });

    const tagNames: string[] = [];
    if (this.state.genreId !== 0) {
      const genre = await managerModule
        .getRakutenModule()!
        .getGenre(this.state.genreId);
      if (genre) {
        this.setState({ genre });
        const tagMap: { [key: number]: RakutenTagEntity } = {};
        if (genre.groups) {
          for (const group of genre.groups) {
            if (group.tags) {
              group.tags.forEach(tag => {
                tagMap[tag.id] = tag;
              });
            }
          }
        }

        if (this.state.tags) {
          const tagIds = this.state.tags.split(",");

          tagIds.forEach(tag => {
            const t = tagMap[parseInt(tag)];
            if (t) tagNames.push(t.name);
          });
          this.setState({ tagNames });
        }
      }
    }
    return true;
  }


}

export const RakutenItemList = mapConnect(_RakutenItemList, [
  ManagerModule,
  LocationModule
]);

//connect(mapStateToProps)(_RakutenItemList);
