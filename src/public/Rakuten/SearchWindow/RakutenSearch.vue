<style scoped lang="scss">
#root {
  box-sizing: border-box;
  padding: 0.2em;
  overflow: auto;
  height: 100%;

  > div {
    background-color: #eeeeee;
    margin: 0.2em;
    padding: 0.3em;
  }
  #button {
    display: flex;
    button {
      flex: 1;
    }
  }

  #keyword {
    display: flex;
    input {
      margin-left: 0.5em;
      flex: 1;
    }
  }
  #tags {
    > :first-child {
      //border-bottom: solid rgba(0, 0, 0, 0.4);
    }
    > :nth-child(n + 2) {
      > div {
        display: flex;
        flex-wrap: wrap;
      }
    }

    #expand {
      cursor: pointer;
      display: flex;
      align-content: center;
      margin: 0.3em;
      img {
        margin-right: 1em;
        height: 1.3em;
      }
    }
    #check {
      margin-left: 2em;
    }
  }
}
/* アニメーション中のスタイル */
.v-leave-active,
.v-enter-active {
  transition: opacity 0.3s;
}

/* 表示アニメーション */
.v-enter {
  opacity: 0;
}
.v-enter-to {
  opacity: 1;
}

/* 非表示アニメーション */
.v-leave {
  opacity: 1;
}
.v-leave-to {
  opacity: 0;
}
</style>
<template>
  <div id="root">
    <div id="button">
      <button v-on:click="onSearch">検索</button>
    </div>
    <div id="keyword">
      キーワード
      <input v-model="keyword" />
    </div>
    <div>
      ジャンル
      <label>
        <input type="radio" value="0" v-model="selectGenreId" />未指定
      </label>
      <label v-if="genre">
        <input type="radio" :value="genre.id" v-model="selectGenreId" />
        {{genre.name}}
      </label>
    </div>
    <div id="tags" v-if="genre && genre.groups">
      <div>タグ設定</div>
      <div v-for="group in genre.groups" :key="group.id">
        <div id="expand" v-on:click="onTagGroup(group)">
          <img v-if="group.visible" :src="imgOpen" />
          <img v-else :src="imgClose" />
          {{group.name}}({{group.tags.length}})
        </div>
        <transition>
          <div id="check" v-show="group.visible">
            <label v-for="tag in group.tags" :key="tag.id">
              <input type="checkbox" :value="tag.id" v-model="tags" />
              {{tag.name}}
            </label>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getManager } from "../..";
import Vue from "vue";
import Component from "vue-class-component";
import {
  RakutenItem,
  RakutenModule,
  RakutenTagGroupEntity,
  RakutenGenreEntity
} from "../RakutenModule";

const _imgOpen = require("./topen.svg");
const _imgClose = require("./tclose.svg");

@Component
export default class Search extends Vue {
  imgOpen: unknown = _imgOpen;
  imgClose: unknown = _imgClose;
  selectGenreId: number = 0;
  genreId: number = -1;
  genre: RakutenGenreEntity | null = null;
  keyword: string = "";
  tags: number[] = [];
  async created() {
    const rakutenModule = getManager().getModule(RakutenModule);
    const params = getManager().getLocationParams();

    if (params["keyword"]) {
      this.keyword = params["keyword"];
    }
    if (this.genreId > 0) {
      const genre = await rakutenModule.getGenre(this.genreId);
      if (genre) {
        this.selectGenreId = genre.id;
        this.genre = genre;

        if (params["tags"]) {
          const tagStrings = params["tags"].split(",");
          const tags = tagStrings.map(tag => parseInt(tag));
          this.tags = tags;
          for (const group of genre.groups) {
            if (group.tags)
              if (
                group.tags.findIndex(v => {
                  return tags.indexOf(v.id) >= 0;
                }) >= 0
              ) {
                (<{ visible?: boolean }>group).visible = true;
              }
          }
        }
      }
    }
  }
  onTagGroup(group: RakutenTagGroupEntity & { visible: boolean }) {
    group.visible = !group.visible;
    const genre = this.genre;
    this.genre = null;
    this.genre = genre;
  }
  onSearch() {
    getManager().goLocation({
      keyword: this.keyword,
      genre: this.selectGenreId,
      tags: this.tags.slice(0, 10).join(",")
    });
  }
}
</script>