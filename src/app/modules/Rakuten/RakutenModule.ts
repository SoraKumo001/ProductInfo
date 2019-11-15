import * as amf from "@jswf/rfs";
import * as typeorm from "typeorm";
import {
  RakutenGenreEntity,
  RakutenTagEntity,
  RakutenTagGroupEntity,
  RakutenItemEntity,
  RakutenShopEntity,
  RakutenOptionEntity
} from "./RakutenEntity";
import { RemoteDB } from "../RemoteDBModule";
import { ExtendRepository } from "../ExtendRepository";
import { RakutenReader, ItemOptions } from "./RakutenReader";
import { Users } from "../User/UsersModule";

export class RakutenModule extends amf.Module {
  private optionRepository!: ExtendRepository<RakutenOptionEntity>;
  private genreRepository!: ExtendRepository<RakutenGenreEntity>;
  private itemRepository!: ExtendRepository<RakutenItemEntity>;
  private tagRepository!: ExtendRepository<RakutenTagEntity>;
  private tagGroupRepository!: ExtendRepository<RakutenTagGroupEntity>;
  private shopRepository!: ExtendRepository<RakutenShopEntity>;
  private reading?: boolean;
  private apiKey?: string;
  readCount: number = 0;
  public async onCreateModule(): Promise<boolean> {
    //データベースの初期化
    const remoteDB = await this.getModule(RemoteDB);
    remoteDB.addEntity(RakutenOptionEntity);
    remoteDB.addEntity(RakutenTagGroupEntity);
    remoteDB.addEntity(RakutenTagEntity);
    remoteDB.addEntity(RakutenGenreEntity);
    remoteDB.addEntity(RakutenItemEntity);
    remoteDB.addEntity(RakutenShopEntity);
    remoteDB.addEventListener("connect", connect => {
      this.optionRepository = new ExtendRepository(
        connect,
        RakutenOptionEntity
      );
      this.genreRepository = new ExtendRepository(connect, RakutenGenreEntity);
      this.itemRepository = new ExtendRepository(connect, RakutenItemEntity);
      this.tagRepository = new ExtendRepository(connect, RakutenTagEntity);
      this.shopRepository = new ExtendRepository(connect, RakutenShopEntity);
      this.tagGroupRepository = new ExtendRepository(
        connect,
        RakutenTagGroupEntity
      );
      this.getApiKey().then(apiKey => (this.apiKey = apiKey));
    });
    return true;
  }
  public async loadGenre() {
    if (this.reading) return false;
    const genreRepository = this.genreRepository!;
    const tagRepository = this.tagRepository!;
    const tagGroupRepository = this.tagGroupRepository!;
    if (!genreRepository) return undefined;

    const loadGenre = async () => {
      if(!this.apiKey)
        return false;
      const reader = new RakutenReader(this.apiKey);
      this.reading = true;
      this.readCount = 0;
      const genre = await reader.loadGenre();
      if (genre) {
        const genre_group: {
          rakutenGenreEntityId: number;
          rakutenTagGroupEntityId: number;
        }[] = [];
        const genres: RakutenGenreEntity[] = [];
        const groupMap: { [key: number]: RakutenTagGroupEntity } = {};
        const tagMap: { [key: number]: RakutenTagEntity } = {};
        const output = (genre: NonNullable<RakutenGenreEntity>) => {
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
              group.tags && group.tags.forEach(tag => {
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

        time = new Date().getTime();
        const tagValue = Object.values(tagMap);
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
    this.genreRepository && this.genreRepository.metadata.connection.transaction(async () => {
      await loadGenre();
    });

    return true;
  }
  public async loadItem() {}
  public isLoadGenre() {
    return this.reading;
  }
  private async saveShop(shopMap: Map<string, string>) {
    //ショップデータの保存
    //既存ショップデータの照合し除去
    const code = Array.from(shopMap.keys());
    const shops = await this.shopRepository!
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
        p.push(loadShop(code, shopMap.get(code)!));
      }
      //データが揃うのを待つ
      await Promise.all(p);
      this.shopRepository!.save(shops);
    }
  }
  public isAdmin() {
    const users = this.getSessionModule(Users);
    return users.isAdmin();
  }
  public async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    return await this.optionRepository!.save({ name: "API_KEY", value: apiKey });
  }
  public async getApiKey() {
    return (await this.optionRepository!.findOne({ name: "API_KEY" }))?.value;
  }
  public async JS_setApiKey(apiKey: string) {
    return !this.isAdmin() ? false : await this.setApiKey(apiKey);
  }
  public async JS_getApiKey() {
    return !this.isAdmin() ? false : await this.getApiKey();
  }

  public async JS_getItem(itemCode: string) {
    const item = await this.itemRepository!.findOne(itemCode, {
      relations: ["genre", "tags"]
    });
    return item;
  }
  public async JS_getTree(parentId: number, level: number) {
    const repository = this.genreRepository;
    if (!repository) return undefined;
    const parent = await repository.findOne(parentId);
    if (!parent) return undefined;
    return this.genreRepository!.getChildren(parent, {
      where: new typeorm.Brackets(dq => {
        dq.where("level<=:level", { level: parent.level! + level });
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
    if(!this.apiKey)
      return false;
    const reader = new RakutenReader(this.apiKey);
    const itemResult = await reader.loadItem(options);
    if (!itemResult) return undefined;
    const shopMap = new Map<string, string>();
    itemResult.Items.forEach(item => {
      const entity: RakutenItemEntity = item as RakutenItemEntity;
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
  async onTest() {
    // const remoteDB = await this.getModule(RemoteDB);
    // remoteDB.enter(() => {
    //   this.loadGenre();
    //});
  }
}
