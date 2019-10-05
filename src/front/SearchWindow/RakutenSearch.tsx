import * as React from 'react';
import styled from 'styled-components';

import imgOpen from "./topen.svg";
import imgClose from "./tclose.svg";
import { RakutenGenreEntity, RakutenTagGroupEntity } from '../Module/RakutenModule';
import { ManagerModule } from '../Manager.tsx';
import { mapModule, mapConnect } from '@jswf/redux-module';
import { LocationModule, Router } from '../Router';
import { JSWindow } from '@jswf/react';

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
`
const Button = styled.div`
    display: flex;
    button {
      flex: 1;
    }
`
const Keyword = styled.div`
    display: flex;
    input {
      margin-left: 0.5em;
      flex: 1;
    }
`
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
`
const Expand = styled.div`
      cursor: pointer;
      display: flex;
      align-content: center;
      margin: 0.3em;
      img {
        margin-right: 1em;
        height: 1.3em;
      }
`
const Check = styled.div`
      margin-left: 2em;
`


interface State {
  genre?: RakutenGenreEntity;
  genres?: { id: number, name: string }[];
  selectGenreId: number;
  keyword?: string;
  tags: Set<number>;
}

class _RakutenSearch extends React.Component<{}, State> {
  state: State = { selectGenreId: 0, tags: new Set() }
  locationModule?:LocationModule;
  componentDidMount() {
    const managerModule = mapModule(this.props,ManagerModule);
    const rakutenModule = managerModule.getRakutenModule()!;
    const locationModule = mapModule(this.props,LocationModule);
    this.locationModule = locationModule;
    const params = locationModule.getLocation();
    if (params["keyword"]) {
      this.setState({ keyword: params["keyword"] });
    }
    const genreId = parseInt(params["genre"] || '0');
    console.log(genreId);
    const genres = [{ id: 0, name: '無指定' }];
    if (genreId > 0) {
      (async()=>{
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
                  (group as RakutenTagGroupEntity & { visible: boolean }).visible = true;
                }
            }
          }
          this.setState({
            selectGenreId: genre.id,
            genre,

          });
        }
        this.setState({ genres });
      })();

    }
  }
  render() {
    return (
      <JSWindow>
      <Root>
        <Button>
          <button onClick={this.onSearch.bind(this)}>検索</button>
        </Button>
        <Keyword>
          キーワード
          <input value={this.state.keyword}
            onKeyDown={(e) => { e.keyCode === 13 && this.onSearch() }}
            onChange={(e) => this.setState({ keyword: e.target.value })} />
        </Keyword>
        <div>
          ジャンル
          {this.state.genres && this.state.genres.map(genre => (
            <label>
              <input
                type="radio" value={genre.id}
                checked={this.state.selectGenreId === genre.id}
                onChange={() => this.setState({ selectGenreId: genre.id })} />
              {genre.name}
            </label>
          ))}
        </div>{this.state.genre && this.state.genre.groups &&
          <Tags>
            <div>タグ設定</div>
            {(this.state.genre.groups as (RakutenTagGroupEntity & { visible: boolean })[]).map(group => (
              <div>
                <Expand onClick={() => this.onTagGroup(group)}>
                  {group.visible && <img src={imgOpen} />}
                  {!group.visible && <img src={imgClose} />}
                  {group.name}({group.tags && group.tags.length})
                </Expand>
                {group.visible &&
                  <Check>
                    {group.tags && group.tags.map(tag => (
                      <label>
                        <input type="checkbox"
                          value={tag.id} checked={this.state.tags.has(tag.id)}
                          onChange={(e) => {
                            e.target.checked ?
                              this.state.tags.add(tag.id) :
                              this.state.tags.delete(tag.id);
                            this.setState({ tags: this.state.tags })
                          }} />
                        {tag.name}
                      </label>
                    ))}
                  </Check>
                }
              </div>
            ))}
          </Tags>
        }
      </Root>
      </JSWindow>)
  }

  onTagGroup(group: RakutenTagGroupEntity & { visible: boolean }) {
    group.visible = !group.visible;
    this.setState({ genre: this.state.genre });
  }
  onSearch() {
    Router.setLocation({
      keyword: this.state.keyword,
      genre: this.state.selectGenreId,
      tags: Array.from(this.state.tags).slice(0, 10).join(",")
    });
  }
}
export const RakutenSearch = mapConnect(_RakutenSearch,[ManagerModule,LocationModule]);