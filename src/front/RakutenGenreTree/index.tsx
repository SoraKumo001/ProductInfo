import { TreeView, TreeItem } from "@jswf/react";
import React, { Component, createRef } from "react";
import { Router, LocationModule } from "../Router";
import { RakutenModule, RakutenGenreEntity } from "../Module/RakutenModule";
import { mapModule, mapConnect } from "@jswf/redux-module";
import { MessageModule } from "../Parts/MessageText";
import { GlobalModule } from "../Global/GlobalModule";
import { ManagerModule } from "../Manager.tsx/Module";

class _GenreTree extends Component {
  treeViewRef = createRef<TreeView>();
  genreId = -1;
  rakutenModule: RakutenModule;
  messageModule: MessageModule;
  globalModule: GlobalModule;
  constructor(props: {}) {
    super(props);
    this.rakutenModule = mapModule(
      this.props,
      ManagerModule
    ).getRakutenModule()!;
    this.messageModule = mapModule(this.props, MessageModule);
    this.globalModule = mapModule(this.props, GlobalModule);
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
  componentDidUpdate() {
    this.onLocation();
  }
  onExpand(item: TreeItem, expand: boolean) {
    if (expand) this.load(item.getValue() as number);
  }
  onItemClick(item: TreeItem) {
    const value = item.getValue() as number;
    Router.setLocation({ genre: value });
  }
  onLocation() {
    const locationModule = mapModule(this.props, LocationModule);
    let genreId = locationModule.getState("genre") || 0;
    if (typeof genreId === "string") genreId = parseInt(genreId);
    this.genreId = genreId as number;
    this.location(genreId as number);

    if (this.treeViewRef.current!.getSelectItem()) {
      const name = this.treeViewRef
        .current!.getSelectItem()!
        .getLabel() as string;
      this.globalModule.setState(genreId===0?"":name, "GenreName");
    }
  }

  private setGenre = (item: TreeItem, genre: RakutenGenreEntity) => {
    item.setValue(genre.id);
    item.setLabel(genre.id ? genre.name : "ジャンル一覧");

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
    this.messageModule.setMessage("ジャンルの読み込み中");
    //setTimeout(async()=>{
    const treeItem = this.treeViewRef.current!;
    let item = id ? treeItem.findItem(id) : treeItem.getItem();
    if (!item || item.getKey("children")) return;
    const genre = await this.rakutenModule!.getGenreTree(id || 0, 2);
    if (!genre) return;
    item.setKey("children", true);
    this.setGenre(item, genre);
    //},50);
  }

  async location(genreId: number) {
    const treeView = this.treeViewRef.current!;
    let item = treeView.findItem(genreId);
    if (item) {
      if (item === treeView.getSelectItem()) return;
    } else {
      const genre = await this.rakutenModule!.getGenreParent(genreId);
      if (genre) {
        this.setGenre(treeView.getItem(), genre);
        item = treeView.findItem(genreId);
      }
    }
    if (item) {
      item.select();
      const name = item.getLabel() as string;
      this.globalModule.setState(genreId===0?"":name, "GenreName");
    }
  }
}
export const GenreTree = mapConnect(_GenreTree, [
  MessageModule,
  ManagerModule,
  LocationModule,
  { module: GlobalModule, writeOnly: true }
]);
