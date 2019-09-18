import { TreeView, TreeItem } from "@jswf/react";
import React, { Component, createRef } from "react";
import { LocationParams } from "../Router";
import { Adapter } from "@jswf/core";
import { RakutenModule, RakutenGenreEntity } from "../Module/RakutenModule";

interface Props {
  location: LocationParams;
  adapter: Adapter;
}

export class GenreTree extends Component<Props> {
  rakutenModule?: RakutenModule;
  treeViewRef = createRef<TreeView>();
  genreId = -1;
  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate() {
    if (!this.rakutenModule && this.props.adapter) {
      this.rakutenModule = new RakutenModule(this.props.adapter);
    }
    if (this.rakutenModule && this.props.location) {
      let genreId = this.props.location["genre"] || 0;
      if (typeof genreId === "string") genreId = parseInt(genreId);
      this.genreId = genreId as number;
      this.location(genreId as number);
    }
  }
  render() {
    return <TreeView ref={this.treeViewRef}></TreeView>;
  }
  public async load(id?: number) {
    const treeItem = this.treeViewRef.current!;
    let item = id ? treeItem.findItem(id) : treeItem.getItem();
    if (!item || item.getKey("children")) return;
    const genre = await this.rakutenModule!.getGenreTree(id || 0, 2);
    if (!genre) return;
    item.setKey("children", true);

    const setGenre = (item: TreeItem, genre: RakutenGenreEntity) => {
      // item.setLabel(genre.name);
      //  item.setValue(genre.id);
      if (genre.children) {
        genre.children.forEach(child => {
          const childItem = item.findItem(child.id);
          setGenre(
            childItem ||
              item.addItem({
                label: child.name,
                value: child.id,
                expand: false
              }),
            child
          );
        });
      }
    };
    setGenre(item, genre);
  }

  async location(genreId: number) {
    const treeView = this.treeViewRef.current!;
    const item = treeView.findItem(genreId);
    if (item) {
      if (item != treeView.getSelectItem()) item.select();
      return;
    }
    const genre = await this.rakutenModule!.getGenreParent(genreId);
    if (genre) {
      const setGenre = (treeItem: TreeItem, genre: RakutenGenreEntity) => {
        treeItem.setLabel(genre.name);
        treeItem.setValue(genre.id);

        if (genre.children) {
          genre.children.forEach(child => {
            const childItem = treeItem.findItem(child.id);
            setGenre(childItem || treeItem.addItem({ expand: true }), child);
          });
        }
      };
      setGenre(treeView.getItem(), genre);
      treeView.selectItem(treeView.findItem(genreId));
      this.load(genreId);
    }
  }
}
