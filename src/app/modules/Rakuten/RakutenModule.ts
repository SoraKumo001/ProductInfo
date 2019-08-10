import * as amf from "active-module-framework";
import * as typeorm from "typeorm";
import {
  RakutenGenreEntity,
  RakutenTagEntity,
  RakutenTagGroupEntity
} from "./RakutenGenreEntity";
import { RemoteDB } from "../RemoteDBModule";
import { ExtendRepository } from "../ExtendRepository";
import { RakutenReader } from "./RakutenReader";

export class RakutenModule extends amf.Module {
  private genreRepository?: ExtendRepository<RakutenGenreEntity>;
  private tagRepository?: ExtendRepository<RakutenTagEntity>;
  private tagGroupRepository?: ExtendRepository<RakutenTagGroupEntity>;
  private reading?: boolean;
  private readCount?: number;
  public async onCreateModule(): Promise<boolean> {
    //データベースの初期化
    const remoteDB = await this.getModule(RemoteDB);
    remoteDB.addEntity(RakutenTagGroupEntity);
    remoteDB.addEntity(RakutenTagEntity);
    remoteDB.addEntity(RakutenGenreEntity);
    remoteDB.addEventListener("connect", connect => {
      this.genreRepository = new ExtendRepository(connect, RakutenGenreEntity);
      this.tagRepository = new ExtendRepository(connect, RakutenTagEntity);
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
      const reader = new RakutenReader("1034797542507942346");
      this.reading = true;
      this.readCount = 0;
      const tagSet = new Set<number>();
      const groupSet = new Set<number>();
      await reader.loadGenre(async genre => {
        if (genre.groups) {
          const p = [];
          for (const tagGroup of genre.groups) {
            const saveGroup = async()=>{
              if(!groupSet.has(tagGroup.id)){
                await tagGroupRepository.save(tagGroup);
                tagSet.add(tagGroup.id);
              }
              if (tagGroup.tags) {
                const p = [];
                for (const tag of tagGroup.tags) {
                  if (!tagSet.has(tag.id)) {
                    p.push(tagRepository.save(tag));
                    tagSet.add(tag.id);
                  }
                }
                await Promise.all(p);
              }
            }
            p.push(saveGroup());
          }
          await Promise.all(p);
        }

        await genreRepository.save(genre);
        ++this.readCount;
        console.log(this.readCount);
        return true;
      });
      this.reading = false;
    };
    this.genreRepository.metadata.connection.transaction(async ()=>{
      await loadGenre();
    })

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
  async onTest() {
    const remoteDB = await this.getModule(RemoteDB);
    remoteDB.enter(() => {
      this.loadGenre();
    });
  }
}
