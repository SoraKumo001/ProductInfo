
import * as React from 'react';
import styled from 'styled-components';
import { getManager } from "..";
import { RakutenGenreEntity, RakutenModule, RakutenTagEntity } from "../Rakuten/RakutenModule";
import { RakutenSearchWindow } from "../Rakuten/SearchWindow/RakutenSearchWindow";
import { RakutenItemCom } from '../Rakuten/ItemList/RakutenItem';
import { RouterModule } from '@jswf/manager';

const Root = styled.div`
  height: 100%;

  #search {
    display: flex;
    flex-wrap: wrap;
    #keyword {
      min-height: 1.5em;
      min-width: 20em;
      border: solid rgba(0, 0, 0, 0.4);
    }
  }
  #tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    div {
      border: solid rgba(0, 0, 0, 0.2);
      border-radius: 0.3em;
      padding: 0.2em;
      margin: 0.1em;
    }
  }
`
interface State {
  keyword: string;
  genreId: number;
  tags: string;
  tagNames?: string[];
  genre?: RakutenGenreEntity;
}

export class MainViewCom extends React.Component<{}, State> {
  state:State = {
    keyword:"",
    genreId:0,
    tags:""
  }
  render() {
    return (
      <Root>
        <div id="search" onClick={() => this.onSearch()}>
          <button onClick={() => this.onClear()}>検索条件解除</button>
          検索
          <div id="keyword" > {this.state.keyword}
          </div>
          <div>ジャンル:{this.state.genre && this.state.genre.name}</div>
        </div >
        <div id="tags">
          指定タグ:
          {this.state.tagNames && this.state.tagNames.map(name => (
            <div>{name}</div>
          ))}

        </div >
        <RakutenItemCom></RakutenItemCom>
      </Root >)
  }

  async componentWillMount() {
    const routerModule = getManager().getModule(RouterModule);
    routerModule.addEventListener("goLocation", this.location.bind(this));
    const params = routerModule.getLocationParams();
    this.setState({ keyword: params["keyword"] as string,
      genreId: params["genreId"]?parseInt(params["genreId"]):0,
      tags: params["tags"] as string })
    this.loadItems();
  }
  public async loadItems() {
    const tagNames: string[] = [];
    if (this.state.genreId !== 0) {
      const rakutenModule = getManager().getModule(RakutenModule);
      const genre = await rakutenModule.getGenre(this.state.genreId);
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
  private onSearch() {
    new RakutenSearchWindow();
  }
  private onClear() {
    getManager().goLocation({ tags: null, keyword: null });
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

}
