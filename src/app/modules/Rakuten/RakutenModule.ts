import * as amf from "@jswf/rfs";
import * as typeorm from "typeorm";
import {
  RakutenGenreEntity,
  RakutenTagEntity,
  RakutenTagGroupEntity,
  RakutenItemEntity,
  RakutenShopEntity
} from "./RakutenEntity";
import { RemoteDB } from "../RemoteDBModule";
import { ExtendRepository } from "../ExtendRepository";
import { RakutenReader, ItemOptions } from "./RakutenReader";

const RAKUTEN_KEY = "1034797542507942346";

export class RakutenModule extends amf.Module {
  private genreRepository?: ExtendRepository<RakutenGenreEntity>;
  private itemRepository?: ExtendRepository<RakutenItemEntity>;
  private tagRepository?: ExtendRepository<RakutenTagEntity>;
  private tagGroupRepository?: ExtendRepository<RakutenTagGroupEntity>;
  private shopRepository?: ExtendRepository<RakutenShopEntity>;
  private reading?: boolean;
  private readCount?: number;
  public async onCreateModule(): Promise<boolean> {
    //データベースの初期化
    const remoteDB = await this.getModule(RemoteDB);
    remoteDB.addEntity(RakutenTagGroupEntity);
    remoteDB.addEntity(RakutenTagEntity);
    remoteDB.addEntity(RakutenGenreEntity);
    remoteDB.addEntity(RakutenItemEntity);
    remoteDB.addEntity(RakutenShopEntity);
    remoteDB.addEventListener("connect", connect => {
      this.genreRepository = new ExtendRepository(connect, RakutenGenreEntity);
      this.itemRepository = new ExtendRepository(connect, RakutenItemEntity);
      this.tagRepository = new ExtendRepository(connect, RakutenTagEntity);
      this.shopRepository = new ExtendRepository(connect, RakutenShopEntity);
      this.tagGroupRepository = new ExtendRepository(
        connect,
        RakutenTagGroupEntity
      );
    });
    return true;
  }
  public async loadGenre() {
    if (this.reading) return false;
    const genreRepository = this.genreRepository;
    const tagRepository = this.tagRepository;
    const tagGroupRepository = this.tagGroupRepository;
    if (!genreRepository) return undefined;

    const loadGenre = async () => {
      const reader = new RakutenReader(RAKUTEN_KEY);
      this.reading = true;
      this.readCount = 0;
      const genre = await reader.loadGenre(async genre => {
        console.log("%d:%d:%s", this.readCount++, genre.level, genre.name);
        return true;
      });
      if (genre) {
        const genre_group: {
          rakutenGenreEntityId: number;
          rakutenTagGroupEntityId: number;
        }[] = [];
        const genres: RakutenGenreEntity[] = [];
        const groupMap: { [key: number]: RakutenTagGroupEntity } = {};
        const tagMap: { [key: number]: RakutenTagEntity } = {};
        const output = (genre: RakutenGenreEntity) => {
          let mpath = genre.id + ".";
          let parent: RakutenGenreEntity | undefined = genre;
          while ((parent = parent.parent)) mpath = parent.id + "." + mpath;
          genre.mpath = mpath;
          genres.push(genre);
          if (genre.groups)
            genre.groups.forEach(group => {
              genre_group.push({
                rakutenGenreEntityId: genre.id,
                rakutenTagGroupEntityId: group.id
              });
              groupMap[group.id] = group;
              group.tags.forEach(tag => {
                tagMap[tag.id] = tag;
              });
            });
          if (genre.children) genre.children.forEach(output);
        };
        output(genre);

        let time;
        time = new Date().getTime();
        console.log("Group:" + Object.values(groupMap).length);
        await tagGroupRepository
          .createQueryBuilder()
          .insert()
          .values(Object.values(groupMap))
          .onConflict(`("id") DO NOTHING`)
          .execute();
        console.log(new Date().getTime() - time);

        time = new Date().getTime();
        const tagValue = Object.values(tagMap);
        console.log("Tag:" + tagValue.length);
        for (let i = 0; i < tagValue.length; i += 1000) {
          const v = tagValue.slice(i, i + 1000);
          await tagRepository
            .createQueryBuilder()
            .insert()
            .values(v)
            .onConflict(`("id") DO NOTHING`)
            .execute();
        }
        console.log(new Date().getTime() - time);

        time = new Date().getTime();
        console.log("Genre:" + genres.length);
        for (let i = 0; i < genres.length; i += 1000) {
          const v = genres.slice(i, i + 1000);
          await genreRepository
            .createQueryBuilder()
            .insert()
            .values(v)
            .onConflict(`("id") DO NOTHING`)
            .execute();
        }

        console.log(new Date().getTime() - time);

        time = new Date().getTime();
        console.log("GenreToGroup:" + genres.length);
        for (let i = 0; i < genre_group.length; i += 1000) {
          const v = genre_group.slice(i, i + 1000);
          await genreRepository
            .createQueryBuilder()
            .insert()
            .into(genreRepository.metadata.manyToManyRelations[0].joinTableName)
            .values(v)
            .onConflict(
              `("rakutenGenreEntityId","rakutenTagGroupEntityId") DO NOTHING`
            )
            .execute();
        }
        console.log(new Date().getTime() - time);
      }
      this.reading = false;
    };
    this.genreRepository.metadata.connection.transaction(async () => {
      await loadGenre();
    });

    return true;
  }
  public async loadItem() {}
  public isLoadGenre() {
    return this.reading;
  }
  public async JS_getTree(parentId: number, level: number) {
    const repository = this.genreRepository;
    if (!repository) return undefined;
    const parent = await repository.findOne(parentId);
    if (!parent) return undefined;
    return this.genreRepository.getChildren(parent, {
      where: new typeorm.Brackets(dq => {
        dq.where("level<=:level", { level: parent.level + level });
      })
    });
  }
  public async JS_getTreeRoot(genreId: number) {
    const repository = this.genreRepository;
    if (!repository) return undefined;
    const tree = await repository.getParent(genreId);
    if (!tree) return undefined;
    let target = tree;
    for (;;) {
      const parent = target.parent;
      if (!parent) return target;

      parent.children = [target];
      target.parent = undefined;
      target = parent;
    }
  }
  public async JS_getGenre(genreId: number) {
    const repository = this.genreRepository;
    if (!repository) return undefined;
    const genre = await repository.findOne(genreId, {
      relations: ["groups", "groups.tags"]
    });
    return genre;
  }
  public async JS_getGenreItem(options: ItemOptions) {
    const reader = new RakutenReader(RAKUTEN_KEY);
    const itemResult = await reader.loadItem(options);
    if (!itemResult) return undefined;
    const shopMap = new Map<string, string>();
    itemResult.Items.forEach(item => {
      const entity: RakutenItemEntity = item;
      //タグの設定
      entity.tags = [];
      entity.tagIds.forEach(id => {
        entity.tags.push({ id } as RakutenTagEntity);
      });
      //ジャンルの設定
      entity.genre = { id: item.genreId } as RakutenGenreEntity;
      //ショップの抽出
      shopMap.set(item.shopCode, item.shopName);
    });
    //アイテム情報の保存
    this.itemRepository.save(itemResult.Items);
    //ショップ情報の保存
    this.saveShop(shopMap);

    return itemResult;
  }
  private async saveShop(shopMap: Map<string, string>) {
    //ショップデータの保存
    //既存ショップデータの照合し除去
    const code = Array.from(shopMap.keys());
    const shops = await this.shopRepository
      .createQueryBuilder()
      .select()
      .where("code in (:...code)", { code })
      .getMany();
    if (shops) {
      shops.forEach(shop => {
        shopMap.delete(shop.code);
      });
    }
    if (shopMap.size) {
      //ショップデータのcodeからIDを抽出
      const shops: RakutenShopEntity[] = [];
      const loadShop = async (code: string, name: string) => {
        const id = await RakutenReader.getShopId(code).catch((): null => {
          return null;
        });
        if (id) {
          const shopEntity: RakutenShopEntity = { id, code, name };
          shops.push(shopEntity);
        }
      };
      const p: Promise<void>[] = [];
      for (const code of shopMap.keys()) {
        p.push(loadShop(code, shopMap.get(code)));
      }
      //データが揃うのを待つ
      await Promise.all(p);
      this.shopRepository.save(shops);
    }
  }
  public async JS_getItem(itemCode: string) {
    const item = await this.itemRepository.findOne(itemCode, {
      relations: ["genre", "tags"]
    });
    return item;
  }
  async onTest() {
    // const remoteDB = await this.getModule(RemoteDB);
    // remoteDB.enter(() => {
    //   this.loadGenre();
    //});
  }
}
