import * as React from 'react';
import styled from 'styled-components';
import { RakutenItem, RakutenModule } from '../RakutenModule';
import { getManager } from '../..';

const Root = styled.div`
  box-sizing: border-box;
  padding: 0.5em;
  overflow: auto;
  height: 100%;
`;
const Name = styled.div`
      cursor: pointer;
      font-size: 120%;
      font-weight: bold;
      background-color: #5784ff;
      color: white;
      border: solid #c5c5fd 1px;
      border-radius: 1em;
      padding: 0.5em;
`;
const Shop = styled.div`
      cursor: pointer;
      padding: 0.3em;
      margin-right: 1em;
      border-radius: 0.3em;
      background-color: rgb(210, 213, 255);
`;
const Stat = styled.div`
      margin: 0.4em;
      display: flex;
      align-items: center;
`;
const Img = styled.img`
      margin: 1em;
      border: solid rgba(0, 0, 0, 0.3);
`;
const Tags = styled.div`
      cursor: pointer;
      padding: 0.5em;
      margin: 0.5em;
      border: solid rgba(0, 0, 0, 0.1);
`;
const Genre = styled.div`
      cursor: pointer;
      text-align: center;
      border-radius: 0.3em;
      padding: 0.2em;
      background-color: rgb(194, 198, 255);
`;
const Info = styled.div`
      white-space: pre-wrap;
      background-color: #eeeeee;
      padding: 0.5em;
`;
const Price = styled.div`
      flex: 1;
      display: flex;
      > div {
        padding: 0.1em;
        font-size: 120%;
        color: red;
        background-color: #fdebeb;
      }
`;
const Rate = styled.div`
      display: flex;
      white-space:nowap;
`;

export class RakutenItemInfo extends React.Component<{ itemCode: string }, { item?: RakutenItem }> {
  state: { item?: RakutenItem } = {}
  async componentDidMount() {
    const rakutenModule = getManager().getModule(RakutenModule);
    const item = await rakutenModule.getItem(this.props.itemCode);
    if (item) {
      this.setState({ item });
    }
  }
  render() {
    return (
      <Root>
        {this.state.item != null &&
          <div id="items">
            <Name onClick={this.onItem.bind(this)}>{this.state.item.itemName}</Name>
            <Stat>
              <Price>
                <div>{this.state.item.itemPrice.toLocaleString()}円</div>
              </Price>
              <Shop onClick={this.onShop.bind(this)}>{this.state.item.shopName}</Shop>
              <Rate>{this.state.item.reviewCount}
              </Rate>
            </Stat>
            <div>{this.state.item.mediumImageUrls.map((url) => {
              return <Img src={url} />
            })
            }
            </div>
            <Genre onClick={this.onGenre.bind(this)}>{this.state.item.genre.name}</Genre>
            <Tags onClick={this.onTags.bind(this)}>
              {this.state.item.tags.map(tag => <div>{tag.name}</div>)
              }
            </Tags>
            <Info dangerouslySetInnerHTML={{ __html: this.state.item.itemCaption }}></Info>
          </div>
        }
      </Root>)
  }
  onTags() {
    if (this.state.item) {
      getManager().goLocation({
        genre: this.state.item.genre.id,
        keyword: null,
        tags: this.state.item.tags
          .map(tag => tag.id)
          .slice(0, 10)
          .join(",")
      });
    }
  }
  onItem() {
    if (this.state.item) window.open(this.state.item.itemUrl, "_blank");
  }
  onShop() {
    if (this.state.item) window.open(this.state.item.shopUrl, "_blank");
  }
  onGenre() {
    if (this.state.item)
      getManager().goLocation({
        genre: this.state.item.genre.id,
        tags: null,
        keyword: null
      });
  }
}