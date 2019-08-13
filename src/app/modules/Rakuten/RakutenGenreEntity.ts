import * as typeorm from "typeorm";
import { RakutenItem } from "./RakutenReader";

@typeorm.Entity()
export class RakutenTagGroupEntity {
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
  @typeorm.PrimaryColumn()
  id: number;
  @typeorm.Column()
  name: string;
  @typeorm.OneToMany(() => RakutenTagEntity, tag => tag.group)
  tags?: RakutenTagEntity[];
}

@typeorm.Entity()
export class RakutenTagEntity {
  constructor(id: number, name: string, group: number | RakutenTagGroupEntity) {
    this.id = id;
    this.name = name;
    this.group =
      typeof group === "number"
        ? ({ id: group } as RakutenTagGroupEntity)
        : group;
  }
  @typeorm.PrimaryColumn()
  id: number;
  @typeorm.Column()
  name: string;
  @typeorm.ManyToOne(() => RakutenTagGroupEntity, group => group.tags)
  group!: RakutenTagGroupEntity;

}

@typeorm.Entity()
@typeorm.Tree("materialized-path")
export class RakutenGenreEntity {
  constructor(
    id: number,
    name: string,
    parent?: RakutenGenreEntity | number,
    level?: number
  ) {
    this.id = id;
    this.name = name;
    this.parent =
      typeof parent === "number"
        ? ({ id: parent } as RakutenGenreEntity)
        : parent;
    this.level = level;
  }
  @typeorm.PrimaryColumn()
  id: number;
  @typeorm.Column()
  name: string;
  @typeorm.Column({ default: 0 })
  level?: number;
  @typeorm.Column({ nullable: true })
  parentId?: number;
  @typeorm.TreeChildren()
  children!: RakutenGenreEntity[];
  @typeorm.TreeParent()
  parent?: RakutenGenreEntity;
  mpath?:string;

  @typeorm.ManyToMany(() => RakutenTagGroupEntity)
  @typeorm.JoinTable()
  groups: RakutenTagGroupEntity[];
}


@typeorm.Entity()
export class RakutenItemEntity implements RakutenItem {
  @typeorm.PrimaryColumn()
  itemCode: string;

  @typeorm.Column('simple-json')
  tagIds: number[];

  @typeorm.ManyToOne(() => RakutenGenreEntity)
  @typeorm.JoinColumn()
  genre?: RakutenGenreEntity;
  genreId:number;


  @typeorm.Column('simple-json')
  mediumImageUrls: string[];
  @typeorm.Column()
  pointRate: number;
  @typeorm.Column()
  shopOfTheYearFlag: number;
  @typeorm.Column()
  affiliateRate: number;
  @typeorm.Column()
  shipOverseasFlag: number;
  @typeorm.Column()
  asurakuFlag: number;
  @typeorm.Column()
  endTime: string;
  @typeorm.Column()
  taxFlag: number;
  @typeorm.Column()
  startTime: string;
  @typeorm.Column()
  itemCaption: string;
  @typeorm.Column()
  catchcopy: string;
  @typeorm.Column('simple-json')
  smallImageUrls: string[];
  @typeorm.Column()
  asurakuClosingTime: string;
  @typeorm.Column()
  imageFlag: number;
  @typeorm.Column()
  availability: number;
  @typeorm.Column()
  shopAffiliateUrl: string;
  @typeorm.Column()
  postageFlag: number;
  @typeorm.Column()
  itemName: string;
  @typeorm.Column()
  itemPrice: number;
  @typeorm.Column()
  pointRateEndTime: string;
  @typeorm.Column()
  shopCode: string;
  @typeorm.Column()
  affiliateUrl: string;
  @typeorm.Column()
  giftFlag: number;
  @typeorm.Column()
  shopName: string;
  @typeorm.Column()
  reviewCount: number;
  @typeorm.Column()
  asurakuArea: string;
  @typeorm.Column()
  shopUrl: string;
  @typeorm.Column()
  creditCardFlag: number;
  @typeorm.Column('float')
  reviewAverage: number;
  @typeorm.Column()
  shipOverseasArea: string;
  @typeorm.Column()
  pointRateStartTime: string;
  @typeorm.Column()
  itemUrl: string;
}
