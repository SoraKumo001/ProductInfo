import { TreeView, TreeItem } from "@jswf/react";
import React, { Component, createRef } from "react";
import { LocationParams,Router } from "../Router";
import { RakutenModule, RakutenGenreEntity } from "../Module/RakutenModule";

interface Props {
  location: LocationParams;
  rakutenModule: RakutenModule;
}

export class GenreTree extends Component<Props> {
  treeViewRef = createRef<TreeView>();
  genreId = -1;
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.onLocation();
  }
  componentDidUpdate() {
    this.onLocation();
  }
  render() {
    return (
      <TreeView
        ref={this.treeViewRef}
        onItemClick={this.onItemClick.bind(this)}
        onExpand={this.onExpand.bind(this)}
      ></TreeView>
    );
  }
  onExpand(item: TreeItem, expand: boolean) {
    if (expand) this.load(item.getValue() as number);
  }
  onItemClick(item:TreeItem){
    const value = item.getValue() as number;
    Router.setLocation({genre:value});
  }
  onLocation() {
    let genreId = this.props.location["genre"] || 0;
    if (typeof genreId === "string") genreId = parseInt(genreId);
    this.genreId = genreId as number;
    this.location(genreId as number);
  }

  private setGenre = (item: TreeItem, genre: RakutenGenreEntity) => {
      item.setValue(genre.id);
      item.setLabel(genre.name);

      if (genre.children) {
        genre.children.forEach(child => {
          const childItem = item.findItem(child.id);
          //setTimeout(() => {
            this.setGenre(
              childItem ||
                item.addItem({
                  expand: false
                }),
              child
            );
         // }, 50);
        });
      }
    };
  public async load(id?: number) {
    const treeItem = this.treeViewRef.current!;
    let item = id ? treeItem.findItem(id) : treeItem.getItem();
    if (!item || item.getKey("children")) return;
    const genre = await this.props.rakutenModule!.getGenreTree(id || 0, 2);
    if (!genre) return;
    item.setKey("children", true);
    this.setGenre(item, genre);
  }

  async location(genreId: number) {
    const treeView = this.treeViewRef.current!;
    const item = treeView.findItem(genreId);
    if (item) {
      if (item != treeView.getSelectItem()) item.select();
      return;
    }
    const genre = await this.props.rakutenModule!.getGenreParent(genreId);
    if (genre) {
      this.setGenre(treeView.getItem(), genre);
      treeView.selectItem(treeView.findItem(genreId));
    }
  }
}
