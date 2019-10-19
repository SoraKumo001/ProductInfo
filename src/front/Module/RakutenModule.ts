import { Adapter } from "@jswf/adapter";
import { ReduxModule } from "@jswf/redux-module";

export interface RakutenTagEntity {
  id: number;
  name: string;
  group: RakutenTagGroupEntity;
}
export interface RakutenTagGroupEntity {
  id: number;
  name: string;
  tags?: RakutenTagEntity[];
}

export interface RakutenGenreEntity {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  children: RakutenGenreEntity[];
  groups: RakutenTagGroupEntity[];
}

export interface ItemOptions {
  genreId?: number;
  keyword?:string;
  tags?:string
  page?: number;
}

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
  genre: RakutenGenreEntity;
  tags: RakutenTagEntity[];
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

export class RakutenModule  {
  adapter:Adapter;
  constructor(adapter:Adapter){
    this.adapter = adapter;
  }
  async getGenreTree(
    id: number,
    level: number
  ): Promise<RakutenGenreEntity | undefined> {
    return this.adapter.exec("RakutenModule.getTree", id, level);
  }
  async getGenreParent(id: number): Promise<RakutenGenreEntity | undefined> {
    return this.adapter.exec("RakutenModule.getTreeRoot", id);
  }
  async getGenreItem(
    options: ItemOptions
  ): Promise<RakutenItemResult | undefined> {
    return this.adapter.exec("RakutenModule.getGenreItem", options);
  }
  async getGenre(genreId: number): Promise<RakutenGenreEntity | undefined> {
    return this.adapter.exec("RakutenModule.getGenre", genreId);
  }
  async getItem(itemCode: string): Promise<RakutenItem | undefined> {
    return this.adapter.exec("RakutenModule.getItem", itemCode);
  }
}
