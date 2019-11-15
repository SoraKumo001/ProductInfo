import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Express } from "express";
import { Module } from "./Module";
import { LocalDB } from "./LocalDB";
import { Session } from "./Session";
import { AdapterResult } from "./Session";
import { ConnectionOptions } from "typeorm";

/**
 *
 *
 * @export
 * @interface ManagerParams
 * @property {string} modulePath	モジュール配置パス
 * @property {boolean} debug		デバッグ用メッセージ出力(0:None 1:Recv 2:Recv/Send)
 */
export interface ManagerParams {
  modulePath: string;
  debug?: number;
  databaseOption?: ConnectionOptions;
}
interface AdapterFormat {
  globalHash: string | null; //ブラウザ共通セッションキー
  sessionHash: string | null; //タブ用セッションキー
  functions: //命令格納用
  {
    function: string; //命令
    params: unknown[]; //パラメータ
  }[];
}

interface ManagerMap {
  message: [unknown];
}

/**
 *フレームワーク総合管理用クラス
 *
 * @export
 * @class Manager
 */
export class Manager {
  private listeners: {
    [key: string]: unknown[];
  } = {};

  private debug?: number | boolean;
  private localDB: LocalDB = new LocalDB();
  private stderr: string = "";
  private modulesList: Module[] = [];
  private modulesInstance: { [key: string]: Module } = {};
  private modulesType: { [key: string]: typeof Module } = {};
  private static initFlag = false;
  private commands: {
    [key: string]: (req: express.Request, res: express.Response) => void;
  } = {};

  /**
   *モジュール対応イベントの追加
   *
   * @template K
   * @param {(K & string)} name
   * @param {(...params: T[K]) => void} proc
   * @returns {void}
   * @memberof Module
   */
  public addEventListener(
    name: keyof ManagerMap,
    proc: (...params: ManagerMap[keyof ManagerMap]) => void
  ): void {
    const listener = this.listeners[name];
    if (!listener) {
      this.listeners[name as string] = [proc];
      return;
    }
    if (listener.indexOf(proc) >= 0) return;
    listener.push(proc);
  }

  /**
   *モジュール対応イベントの削除
   *
   * @template K
   * @param {(K & string)} name
   * @param {(...params: T[K]) => void} proc
   * @returns {void}
   * @memberof Module
   */
  public removeEventListener(
    name: keyof ManagerMap,
    proc: (...params: ManagerMap[keyof ManagerMap]) => void
  ): void {
    const listener = this.listeners[name];
    if (!listener) {
      this.listeners[name as string] = [proc];
      return;
    }
    const index = listener.indexOf(proc);
    if (index < 0) return;
    listener.splice(index, 1);
  }
  /**
   *イベントを呼び出す
   *
   * @template K
   * @param {(K & string)} name
   * @param {...T[K]} params
   * @memberof Module
   */
  public callEvent(
    name: keyof ManagerMap,
    ...params: ManagerMap[keyof ManagerMap]
  ): void {
    const listener = this.listeners[name];
    if (listener) {
      for (const proc of listener) {
        (proc as (...params: ManagerMap[keyof ManagerMap]) => unknown)(
          ...params
        );
      }
    }
  }
  /**
   *モジュールのコンストラクター一覧を返す
   *
   * @returns {{
   *     [key: string]: typeof Module;
   *   }}
   * @memberof Manager
   */
  public getModuleTypes(): {
    [key: string]: typeof Module;
  } {
    return this.modulesType;
  }

  /**
   *デバッグ情報の出力
   *
   * @param {string} msg
   * @param {*} params
   * @memberof Manager
   */
  public async output(msg: string, ...params: unknown[]): Promise<void> {
    if (this.debug) {
      // eslint-disable-next-line no-console
      (process.stdout as any)._handle.setBlocking(false);
      console.log(
        (process.env.NODE_APP_INSTANCE || "0") + ":" + msg,
        ...params
      );
    }
  }

  public sendMessage(value: unknown) {
    return new Promise((resolve, reject) => {
      if (process.send) {
        process.send(
          {
            type: "process:msg",
            data: value
          },
          undefined,
          undefined,
          error => {
            if (error) reject(error);
            else resolve();
          }
        );
      }
    });
  }
  /**
   *ディレクトリからモジュールを読み込む
   *
   * @param {string} modulePath
   * @returns
   * @memberof Manager
   */
  public loadModule(modulePath: string) {
    let modulesType: { [key: string]: typeof Module } = {};
    const files = fs.readdirSync(modulePath);
    for (const file of files) {
      const filePath = path.join(modulePath, file);
      const dir = fs.statSync(filePath).isDirectory();
      if (dir) {
        modulesType = Object.assign(modulesType, this.loadModule(filePath));
      } else {
        if (file.match(`\(?<=\.(ts|js))(?<!d\.ts)$`)) {
          const r = require(filePath) as { [key: string]: typeof Module };
          if (r) {
            for (const name of Object.keys(r)) {
              const module = r[name];
              if (module.prototype instanceof Module) {
                modulesType[name] = module;
              }
            }
          }
        }
      }
    }
    return modulesType;
  }

  /**
   *モジュールの取得と新規インスタンスの作成
   *
   * @template T
   * @param {(string | { new (manager: Manager): T })} type
   * @returns {(Promise<T | null>)}
   * @memberof Manager
   */
  public async getModule<T extends Module>(
    type: string | { new (manager: Manager): T }
  ): Promise<T> {
    const modules = this.modulesInstance;
    let name;
    let module;
    if (typeof type === "string") name = type;
    else name = type.name;
    module = modules[name];
    if (module) return module as T;
    let constructor = this.modulesType[name];
    if (constructor == null || !("Module" in constructor))
      throw "getModule error";
    module = new constructor(this);
    modules[name] = module;

    const info = constructor.getModuleInfo();
    this.output("init: %s", JSON.stringify(info));
    //初期化に失敗したらnullを返す
    if (!(await module.onCreateModule())) throw "Module Create Error";
    this.modulesList.push(module);
    return module as T;
  }

  /**
   *非同期を使わずモジュールの取得(未初期化は例外発生)
   *
   * @template T
   * @param {(string | { new (manager: Manager): T })} type
   * @returns {(T | null)}
   * @memberof Manager
   */
  public getModuleSync<T extends Module>(
    type: string | { new (manager: Manager): T }
  ): T | null {
    let name;
    let module;
    if (typeof type === "string") name = type;
    else name = type.name;
    module = this.modulesInstance[name];
    if (module) return module as T;
    throw "Module Load Error";
  }

  /**
   *コマンドの追加
   * /?cmd=コマンド
   * に対応したルーティングを行う
   *
   * @param {string} name
   * @param {(req: express.Request, res: express.Response) => void} proc
   * @memberof Manager
   */
  public addCommand(
    name: string,
    proc: (req: express.Request, res: express.Response) => void
  ): void {
    this.commands[name] = proc;
  }

  /**
   *Expressの設定を行う
   *
   * @param {string} path				ドキュメントのパス
   * @memberof Manager
   */
  public init(
    params: ManagerParams,
    exp: Express,
    path: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.debug = params.debug || 0;
      //モジュールを読み出す
      const modulesType = this.loadModule(params.modulePath);
      this.modulesType = modulesType;

      //モジュールの初期化
      for (const name of Object.keys(modulesType)) {
        if (!(await this.getModule(name))) process.exit(-10);
      }

      //DB設定が無ければメモリ上に作成
      const databaseOption: ConnectionOptions = params.databaseOption || {
        type: "sqlite",
        database: ":memory:"
      };

      if (!(await this.localDB.open(databaseOption))) {
        // eslint-disable-next-line no-console
        console.error(
          "ローカルDBオープンエラー:%s(%s)",
          databaseOption.type,
          databaseOption.database
        );
        reject(
          `ローカルDBオープンエラー:${databaseOption.type}${databaseOption.database}`
        );
      }

      //モジュールの初期化2
      for (const m of this.modulesList) {
        if (m.onCreatedModule) await m.onCreatedModule();
      }

      Manager.initFlag = true;

      const commands = this.commands;
      commands.exec = (req: express.Request, res: express.Response): void => {
        this.exec(req, res);
      };
      commands.upload = (req: express.Request, res: express.Response): void => {
        this.upload(req, res);
      };

      exp.options("*", function(req, res) {
        res.header("Access-Control-Allow-Headers", "content-type");
        res.sendStatus(200);
        res.end();
      });
      //バイナリファイルの扱い設定
      exp.use(
        bodyParser.raw({ type: "application/octet-stream", limit: "300mb" })
      );
      exp.use(bodyParser.json({ type: "application/json", limit: "3mb" }));
      //クライアント接続時の処理
      exp.all(
        path,
        async (
          req: express.Request,
          res: express.Response,
          next
        ): Promise<void> => {
          //初期化が完了しているかどうか
          if (!Manager.initFlag) {
            res.header("Content-Type", "text/plain; charset=utf-8");
            res.end(this.stderr);
            return;
          }
          //コマンドパラメータの解析
          const cmd = req.query.cmd as string;
          if (cmd != null) {
            const command = commands[cmd];
            if (command != null) {
              command(req, res);
            } else {
              res.json({ error: "リクエストエラー" });
              res.end();
            }
          } else {
            next();
          }
        }
      );
      resolve();
    });
  }

  /**
   * 終了処理
   *
   * @memberof Manager
   */
  public async destory(): Promise<void> {
    const promise: Promise<boolean>[] = [];
    const modules = this.modulesInstance;
    for (const name of Object.keys(modules)) {
      const module = modules[name];
      this.output("モジュール解放化:%s", name);
      promise.push(module.onDestroyModule());
    }
    await Promise.all(promise);

    this.output("--- Stop Manager");
  }
  /**
   *ローカルDBを返す
   *
   * @returns {LocalDB} ローカルDB
   * @memberof Manager
   */
  public getLocalDB(): LocalDB {
    return this.localDB;
  }

  /**
   *ファイルのアップロード対処用
   *
   * @private
   * @param {express.Request} req
   * @param {express.Response} res
   * @memberof Manager
   */
  private upload(req: express.Request, res: express.Response): void {
    if (req.body instanceof Buffer) {
      const params = req.query.params;
      try {
        const values = JSON.parse(params);
        if (params) this.execute(res, values, req.body);
      } catch (e) {
        res.status(500);
        res.end("500 error");
      }
    }
  }

  /**
   *モジュール処理の区分け実行
   *
   * @private
   * @param {express.Request} req  リクエスト
   * @param {express.Response} res レスポンス
   * @memberof Manager
   */
  private exec(req: express.Request, res: express.Response): void {
    if (req.header("content-type") === "application/json") {
      this.execute(res, req.body);
    } else {
      let postData = "";
      req
        .on("data", function(v: string): void {
          postData += v;
        })
        .on("end", (): void => {
          try {
            const values = JSON.parse(postData);
            this.execute(res, values);
          } catch (e) {
            res.status(500);
            res.end("500 error");
          }
        });
    }
  }

  /**
   *クライアントからの処理要求を実行
   *
   * @public
   * @param {express.Response} res
   * @param {AdapterFormat} params
   * @param {Buffer} [buffer]
   * @returns {Promise<void>}
   * @memberof Manager
   */
  public async execute(
    res: express.Response,
    params: AdapterFormat,
    buffer?: Buffer
  ): Promise<void> {
    //マネージャ機能をセッション用にコピー
    const session = new Session(this);
    await session.init(
      this.localDB,
      params.globalHash,
      params.sessionHash,
      res,
      buffer
    );
    session.result = {
      globalHash: session.getGlobalHash(),
      sessionHash: session.getSessionHash(),
      results: []
    };

    const modulesType = this.modulesType;

    //セッション初期化処理のあるモジュールを呼び出す
    for (const name of Object.keys(modulesType)) {
      if (modulesType[name].prototype.onStartSession)
        await session.initModule(name);
    }

    if (params.functions) {
      const results = session.result.results;
      //要求された命令の解析と実行
      for (const func of params.functions) {
        const result: AdapterResult = { value: null, error: null };
        results.push(result);

        if (!func.function) {
          result.error = util.format("命令が指定されていない", func.function);
          continue;
        }
        const name = func.function.split(".");
        if (name.length != 2) {
          result.error = util.format(
            "クラス名が指定されていない: %s",
            func.function
          );
          continue;
        }
        const className = name[0];
        //クラスインスタンスを取得
        let classPt = null;
        try {
          classPt = await session.getModule(className);
        } catch {
          result.error = util.format("クラスが存在しない: %s", func.function);
          continue;
        }
        //ファンクション名にプレフィックスを付ける
        const funcName = "JS_" + name[1];
        //ファンクションを取得
        const funcPt = classPt[funcName as keyof Module] as Function | null;
        if (!funcPt) {
          result.error = util.format("命令が存在しない: %s", func.function);
          continue;
        }
        if (!func.params) {
          result.error = util.format("パラメータ書式エラー: %s", func.function);
          continue;
        }
        if (funcPt.length !== func.params.length) {
          result.error = util.format(
            "パラメータの数が一致しない: %s",
            func.function
          );
          continue;
        }
        //命令の実行
        try {
          if (this.debug)
            this.output(
              "命令実行: %s %s",
              funcName,
              JSON.stringify(func.params)
            );
          //戻り値の受け取り
          const funcResult = funcPt.call(classPt, ...func.params);
          result.value = await funcResult;
          if (this.debug && this.debug !== 2)
            this.output("実行結果: %s", JSON.stringify(result.value));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          result.error = util.format("モジュール実行エラー: %s", func.function);
          continue;
        }
      }
      //セッション終了
      session.final();
    }
    //クライアントに返すデータを設定
    if (session.isReturn()) {
      res.json(session.result).on("error", () => {});
      res.end();
    }
  }

  /**
   *前回のソケットファイルの削除
   *
   * @memberof Main
   */
  private removeSock(path: string): void {
    try {
      fs.unlinkSync(path);
    } catch (e) {
      //
    }
  }
}
