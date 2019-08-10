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
  genreId: string;
  pointRateStartTime: string;
  itemUrl: string;
}

export interface RakutenItemResult {
  data: {
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
  };
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

export class RakutenReader {
  apiKey: string;
  public constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  public async loadItem(genreId: number, page?: number) {
    let URL =
      "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706" +
      `?formatVersion=2&applicationId=${this.apiKey}&genreId=${genreId}`;
    if (page) {
      URL += "&page=" + page;
    }
    const res = <RakutenItemResult | null>await axios.get(URL).catch(() => {
      return null;
    });
    return res.data;
  }
  public async loadGenre(
    onGenre: (genre: RakutenGenreEntity) => Promise<boolean>
  ) {
    const getGenre = async (parent: RakutenGenreEntity, level: number) => {
      let i: number;
      for (i = 0; i < 10; i++) {
        const URL =
          "https://app.rakuten.co.jp/services/api/IchibaGenre/Search/20140222" +
          "?formatVersion=2&genrePath=0&elements=current,children,tagGroups" +
          `&applicationId=${this.apiKey}&genreId=${parent.id}`;
        const res = <GenreSrc | null>await axios.get(URL).catch(() => {
          return null;
        });
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
            if (tags.length) rakutenTagGroup.tags = tags;
          }
          if (groups.length) parent.groups = groups;

          if (!(await onGenre(parent))) return false;

          parent.children = [];
          //子ジャンルの取得
          for (const child of res.data.children) {
            const rakutenGenre = new RakutenGenreEntity(
              child.genreId,
              child.genreName,
              parent,
              level
            );
            parent.children.push(rakutenGenre);
            if (!(await getGenre(rakutenGenre, level + 1))) {
              return false;
            }
          }
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
    await getGenre(rakutenGenre, 1);
    return rakutenGenre;
  }
}
