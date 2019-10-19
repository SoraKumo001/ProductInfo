import * as React from "react";
import styled from "styled-components";

import imgOpen from "./topen.svg";
import imgClose from "./tclose.svg";
import { RakutenTagGroupEntity } from "../Module/RakutenModule";

import { mapModule, mapConnect } from "@jswf/redux-module";
import { LocationModule, Router } from "../Router";
import { JSWindow } from "@jswf/react";
import { SearchModule } from "./SearchModule";
import { ManagerModule } from "../Manager.tsx/Module";

const Root = styled.div`
  box-sizing: border-box;
  padding: 0.2em;
  overflow: auto;
  height: 100%;

  > div {
    background-color: #eeeeee;
    margin: 0.2em;
    padding: 0.3em;
  }
`;
const Button = styled.div`
  display: flex;
  button {
    flex: 1;
  }
`;
const Keyword = styled.div`
  display: flex;
  input {
    margin-left: 0.5em;
    flex: 1;
  }
`;
const Tags = styled.div`
  > :first-child {
    //border-bottom: solid rgba(0, 0, 0, 0.4);
  }
  > :nth-child(n + 2) {
    > div {
      display: flex;
      flex-wrap: wrap;
    }
  }
`;
const Expand = styled.div`
  cursor: pointer;
  display: flex;
  align-content: center;
  margin: 0.3em;
  img {
    margin-right: 1em;
    height: 1.3em;
  }
`;
const Check = styled.div`
  margin-left: 2em;
`;

class _RakutenSearch extends React.Component<{}> {
  locationModule?: LocationModule;
  searchModule: SearchModule;
  visible: boolean = false;
  constructor(props: {}) {
    super(props);
    this.searchModule = mapModule(this.props, SearchModule);
  }
  shouldComponentUpdate(props: unknown) {
    if (props === this.props) return false;
    this.searchModule = mapModule(props, SearchModule);
    const visible = this.searchModule.getState("visible");

    if (!this.visible && visible) {
      this.visible = true;

      const managerModule = mapModule(this.props, ManagerModule);
      const rakutenModule = managerModule.getRakutenModule()!;
      const locationModule = mapModule(this.props, LocationModule);
      this.locationModule = locationModule;
      const params = locationModule.getLocation();
      if (params["keyword"]) {
        this.setState({ keyword: params["keyword"] });
      }
      const genreId = parseInt(params["genre"] || "0");
      const genres = [{ id: 0, name: "無指定" }];
      if (genreId > 0) {
        (async () => {
          const genre = await rakutenModule.getGenre(genreId);
          if (genre) {
            genres.push(genre);
            if (params["tags"]) {
              const tagStrings = params["tags"].split(",");
              const tags = new Set(tagStrings.map(tag => parseInt(tag)));
              this.setState({ tags });
              for (const group of genre.groups) {
                if (group.tags)
                  if (
                    group.tags.findIndex(v => {
                      return tags.has(v.id);
                    }) >= 0
                  ) {
                    (group as RakutenTagGroupEntity & {
                      visible: boolean;
                    }).visible = true;
                  }
              }
            }
            this.setState({
              selectGenreId: genre.id,
              genre
            });
          }
          this.setState({ genres });
        })();
      }
    }
    if (!visible) this.visible = false;
    return true;
  }
  render() {
    if (!this.visible) return <></>;

    const searchModule = this.searchModule;
    const {
      keyword,
      genres,
      selectGenreId,
      genre,
      tags
    } = searchModule.getState()!;
    return (
      <JSWindow title="検索">
        <Root>
          <Button>
            <button onClick={this.onSearch.bind(this)}>検索</button>
          </Button>
          <Keyword>
            キーワード
            <input
              value={keyword}
              onKeyDown={e => {
                e.keyCode === 13 && this.onSearch();
              }}
              onChange={e => this.setState({ keyword: e.target.value })}
            />
          </Keyword>
          <div>
            ジャンル
            {genres &&
              genres.map(genre => (
                <label>
                  <input
                    type="radio"
                    value={genre.id}
                    checked={selectGenreId === genre.id}
                    onChange={() => this.setState({ selectGenreId: genre.id })}
                  />
                  {genre.name}
                </label>
              ))}
          </div>
          {genre && genre.groups && (
            <Tags>
              <div>タグ設定</div>
              {(genre.groups as (RakutenTagGroupEntity & {
                visible: boolean;
              })[]).map(group => (
                <div>
                  <Expand onClick={() => this.onTagGroup(group)}>
                    {group.visible && <img src={imgOpen} />}
                    {!group.visible && <img src={imgClose} />}
                    {group.name}({group.tags && group.tags.length})
                  </Expand>
                  {group.visible && (
                    <Check>
                      {group.tags &&
                        group.tags.map(tag => (
                          <label>
                            <input
                              type="checkbox"
                              value={tag.id}
                              checked={tags.has(tag.id)}
                              onChange={e => {
                                e.target.checked
                                  ? tags.add(tag.id)
                                  : tags.delete(tag.id);
                                this.setState({ tags: tags });
                              }}
                            />
                            {tag.name}
                          </label>
                        ))}
                    </Check>
                  )}
                </div>
              ))}
            </Tags>
          )}
        </Root>
      </JSWindow>
    );
  }

  onTagGroup(group: RakutenTagGroupEntity & { visible: boolean }) {
    const searchModule = this.searchModule;
    const { genre } = searchModule.getState()!;

    group.visible = !group.visible;
    this.setState({ genre });
  }
  onSearch() {
    const searchModule = this.searchModule;
    const { keyword, selectGenreId, tags } = searchModule.getState()!;
    Router.setLocation({
      keyword,
      genre: selectGenreId,
      tags: Array.from(tags)
        .slice(0, 10)
        .join(",")
    });
  }
}
export const RakutenSearch = mapConnect(_RakutenSearch, [
  ManagerModule,
  LocationModule,
  SearchModule
]);
