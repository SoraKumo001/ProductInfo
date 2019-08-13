import { BaseModule } from "../Manager/BaseModule";

export interface RakutenGenreEntity {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  children: RakutenGenreEntity[];
}

export interface ItemOptions{
  genreId:number,
  page?:number
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

export class RakutenModule extends BaseModule {
  async getGenreTree(id: number, level: number): Promise<RakutenGenreEntity | undefined> {
    return this.getAdapter().exec("RakutenModule.getTree", id, level);
  }
  async getGenreParent(id: number): Promise<RakutenGenreEntity | undefined> {
    return this.getAdapter().exec("RakutenModule.getTreeRoot", id);
  }
  async getGenreItem(options: ItemOptions): Promise<RakutenItemResult | undefined> {
    return this.getAdapter().exec("RakutenModule.getGenreItem",options);
  }
  async getItem(itemCode: string): Promise<RakutenItem | undefined> {
    return this.getAdapter().exec("RakutenModule.getItem",itemCode);
  }
}
