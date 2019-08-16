<style scoped lang="scss">
#root {
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
}
</style>
<template>
  <div id="root" v-on:scroll="next()">
    <div id="search" v-on:click="onSearch">
      <button v-on:click.stop="onClear">検索条件解除</button>
      検索
      <div id="keyword">{{keyword}}</div>
      <div v-if="genre">ジャンル:{{genre.name}}</div>
    </div>
    <div id="tags">
      指定タグ:
      <div v-for="name in tagNames" :key="name">{{name}}</div>
    </div>
    <RakutenItemVue></RakutenItemVue>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getManager } from "..";
import { RakutenGenreEntity } from "../Rakuten/RakutenModule";
import { RakutenSearchWindow } from "../Rakuten/SearchWindow/RakutenSearchWindow";
import RakutenItemVue from "../Rakuten/ItemList/RakutenItem.vue";
@Component({
  components: { RakutenItemVue }
})
export default class MainViewVue extends Vue {
  keyword: string = "";
  tags: string = "";
  genre: RakutenGenreEntity | null = null;
  tagNames: string[] = [];
  genreId: number = -1;

  public location(p: { [key: string]: string }) {
    const genreId = p.genre != null ? parseInt(p.genre) : 0;
    const keyword = p.keyword || "";
    const tags = p.tags || "";
    if (
      this.genreId !== genreId ||
      this.keyword !== keyword ||
      this.tags !== tags
    ) {
      this.genreId = genreId;
      this.keyword = keyword;
      this.tags = tags;
    }
  }

  onSearch() {
    new RakutenSearchWindow(this.genreId);
  }
  onClear() {
    getManager().goLocation({ tags: null, keyword: null });
  }
}
</script>