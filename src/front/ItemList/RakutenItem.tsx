import * as React from "react";
import imgLoading from "./loading.gif";
import { LocationParams, Router } from "../Router";
import {
  RakutenModule,
  RakutenItem,
  RakutenGenreEntity,
  RakutenItemResult,
  ItemOptions,
  RakutenTagEntity
} from "../Module/RakutenModule";
import { StarRating } from "@jswf/react-star-rating";
import { Root } from "./style";

interface Props {
  location: LocationParams;
  rakutenModule: RakutenModule;
}
interface State {
  genreId: number;
  keyword: string;
  tags: string;
  items: RakutenItem[];
  genre: RakutenGenreEntity | null;
  tagNames: string[];
  loading: boolean;
}

export class RakutenItemList extends React.Component<Props, State> {
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
    return (
      <Root ref={this.Root} onScroll={this.next.bind(this)}>
        <div id="items">
          {this.state.loading && <img src={imgLoading} />}
          {this.state.items &&
            this.state.items.map((item, index) => (
              <div key={index} onClick={() => this.click(item)}>
                <div id="img">
                  <img src={item.mediumImageUrls[0]} />
                </div>
                <div id="info" title={item.itemName}>
                  {item.itemName}
                </div>
                <div id="data">
                  <div id="price">{item.itemPrice.toLocaleString()}円</div>
                  <div id="rate">
                    {item.reviewAverage}
                    <StarRating
                      max={5}
                      value={item.reviewAverage}
                      backStyle={{ color: "black" }}
                    />
                    ({item.reviewCount})
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Root>
    );
  }

  public componentDidMount() {
    // const params = this.props.location;
    // this.setState({
    //   genreId: parseInt(params["genreId"] || "0"),
    //   keyword: params["keyword"]
    // });
    console.log(this.props.location);
    this.location(this.props.location);
  }

  componentDidUpdate() {
    this.location(this.props.location);
  }

  public async next() {
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
        itemResult = await this.props.rakutenModule.getGenreItem(
          params as ItemOptions
        );
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
      const genre = await this.props.rakutenModule.getGenre(this.state.genreId);
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

  click(item: RakutenItem) {
    Router.setLocation({ item: item.itemCode });
  }
}
