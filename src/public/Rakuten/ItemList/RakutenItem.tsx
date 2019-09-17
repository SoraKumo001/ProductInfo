import * as React from "react";
import styled from "styled-components";

import { getManager } from "../..";
import {
  RakutenModule,
  RakutenGenreEntity,
  RakutenItemResult,
  ItemOptions,
  RakutenTagEntity,
  RakutenItem
} from "../RakutenModule";
import { RouterModule } from "@jswf/manager";
import imgLoading from "./loading.gif";

const Root = styled.div`
  overflow: auto;
  height: 100%;

  #items {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    > div {
      animation-name: fadeIn;
      animation-duration: 0.5s;
      transform-origin: 50% 50%;

      border: solid rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      margin: 0.5em;
      padding: 0.5em;
      width: 250px;
      height: 250px;
      div#img {
        display: flex;
        justify-content: center;
        align-content: center;

        img {
          height: 120px;
        }
      }
      #info {
        height: 4.4em;
        overflow: hidden;
      }
      #price {
        flex: 1;
        color: red;
      }
      #rate,
      #data {
        display: flex;
      }
    }
  }
  // アニメーション
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
interface State {
  genreId: number;
  keyword: string;
  tags: string;
  items: RakutenItem[];
  genre: RakutenGenreEntity | null;
  tagNames: string[];
  loading: boolean;
}

export class RakutenItemCom extends React.Component<{}, State> {
  rakutenModule!: RakutenModule;
  routerModule!: RouterModule;
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
            this.state.items.map((item,index) => (
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

                    ({item.reviewCount})
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Root>
    );
  }
  /*
                      <Rating
                      rating={item.reviewAverage}
                      starSpacing="0px"
                      starDimension="20px"
                      starRatedColor="rgb(250,200,10)"
                    />

  */
  public componentDidMount() {
    this.rakutenModule = getManager().getModule(RakutenModule);
    this.routerModule = getManager().getModule(RouterModule);
    this.routerModule.addEventListener("goLocation", this.location.bind(this));

    const params = getManager().getLocationParams();
    this.setState({
      genreId: parseInt(params["genreId"] || "0"),
      keyword: params["keyword"]
    });
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
        itemResult = await this.rakutenModule.getGenreItem(
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
        this.forceUpdate(()=>{
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
      this.setState({ genreId, keyword, tags });
      this.loadItems();
    }
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
      const genre = await this.rakutenModule.getGenre(this.state.genreId);
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
    getManager().goLocation("item", item.itemCode);
  }
}
