import axios from "axios";
import {
  RakutenGenreEntity,
  RakutenTagGroupEntity,
  RakutenTagEntity
} from "./RakutenGenreEntity";

export interface RakutenItem {
  mediumImageUrls: string[];
  pointRate: number;
  shopOfTheYearFlag: number;
  affiliateRate: number;
  shipOverseasFlag: number;
  asurakuFlag: number;
  endTime: string;
  taxFlag: number;
  startTime: string;
  itemCaption: string;
  catchcopy: string;
  tagIds: number[];
  smallImageUrls: string[];
  asurakuClosingTime: string;
  imageFlag: number;
  availability: number;
  shopAffiliateUrl: string;
  itemCode: string;
  postageFlag: number;
  itemName: string;
  itemPrice: number;
  pointRateEndTime: string;
  shopCode: string;
  affiliateUrl: string;
  giftFlag: number;
  shopName: string;
  reviewCount: number;
  asurakuArea: string;
  shopUrl: string;
  creditCardFlag: number;
  reviewAverage: number;
  shipOverseasArea: string;
  genreId: number;
  pointRateStartTime: string;
  itemUrl: string;
}

export interface RakutenItemResult {
  Items: RakutenItem[];
  pageCount: number;
  TagInformation: unknown[];
  hits: number;
  last: number;
  count: number;
  page: number;
  carrier: number;
  GenreInformation: unknown[];
  first: number;
}
interface Tag {
  parentTagId: number;
  tagName: string;
  tagId: number;
}
interface TagGroup {
  tags: Tag[];
  tagGroupId: number;
  tagGroupName: string;
}

interface GenreItem {
  genreName: string;
  genreId: number;
}
export interface GenreSrc {
  data: {
    current: GenreItem;
    children: GenreItem[];
    tagGroups: TagGroup[];
  };
}

export function Sleep(timeout: number): Promise<void> {
  return new Promise(
    (resolv): void => {
      setTimeout((): void => {
        resolv();
      }, timeout);
    }
  );
}

export interface ItemOptions {
  genreId?: number;
  page?: number;
}

function convertParam(params: { [key: string]: unknown }): string {
  let text = "";
  for (const index of Object.keys(params)) {
    if (text.length) text += "&";
    text += encodeURI(index) + "=" + encodeURI(params[index].toString());
  }
  return text;
}

export class RakutenReader {
  apiKey: string;
  public constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  public async loadItem(options: ItemOptions) {
    if (isNaN(options.genreId)) return null;
    let URL =
      "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706" + `?`;

    const params: { [key: string]: string | number } = {
      formatVersion: 2,
      applicationId: this.apiKey,
      genreId: options.genreId
    };
    if (options.page && !isNaN(options.page)) {
      params.page = options.page;
    }
    params.sort = "-updateTimestamp";

    const res = <{ data: RakutenItemResult } | null>(
      await axios.get(URL + convertParam(params)).catch(() => {
        return null;
      })
    );
    return res.data;
  }
  public async loadGenre(
    onGenre: (genre: RakutenGenreEntity) => Promise<boolean>
  ): Promise<RakutenGenreEntity | undefined> {
    let parallelCount = 0;
    const getGenre = async (
      parent: RakutenGenreEntity,
      level: number
    ): Promise<boolean> => {
      let i: number;
      // //テスト用件数制限
      // if(recvCount++ > 100)
      //   return true;
      for (i = 0; i < 20; i++) {
        const URL =
          "https://app.rakuten.co.jp/services/api/IchibaGenre/Search/20140222" +
          "?formatVersion=2&genrePath=0&elements=current,children,tagGroups" +
          `&applicationId=${this.apiKey}&genreId=${parent.id}`;

        //並列実行対策のウエイト
        while (parallelCount > 10) await Sleep(500);

        parallelCount++;
        const res = <GenreSrc | null>await axios.get(URL).catch(() => {
          return null;
        });
        parallelCount--;

        if (res) {
          //タググループの取得
          const groups = [];
          for (const tagGroup of res.data.tagGroups) {
            const rakutenTagGroup = new RakutenTagGroupEntity(
              tagGroup.tagGroupId,
              tagGroup.tagGroupName
            );
            groups.push(rakutenTagGroup);
            //タグの取得
            const tags = [];
            if (tagGroup.tags) {
              for (const tag of tagGroup.tags) {
                const rakutenTag = new RakutenTagEntity(
                  tag.tagId,
                  tag.tagName,
                  rakutenTagGroup
                );
                tags.push(rakutenTag);
              }
            }
            rakutenTagGroup.tags = tags;
          }
          parent.groups = groups;

          if (!(await onGenre(parent))) return false;

          parent.children = [];
          //子ジャンルの取得
          const p: Promise<boolean>[] = [];
          for (const child of res.data.children) {
            const rakutenGenre = new RakutenGenreEntity(
              child.genreId,
              child.genreName,
              parent,
              level
            );
            parent.children.push(rakutenGenre);
            p.push(getGenre(rakutenGenre, level + 1));
          }
          const result = await Promise.all(p);
          if (result.indexOf(false) >= 0) return false;
          break;
        } else {
          console.log("Genre read error to retry");
          Sleep(5000);
        }
      }
      if (i === 10) {
        console.error("Genre read error");
        return false;
      }
      return true;
    };
    const rakutenGenre = new RakutenGenreEntity(0, "root", undefined, 1);
    if (!(await getGenre(rakutenGenre, 2))) return undefined;
    return rakutenGenre;
  }
}
