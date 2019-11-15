import axios, { Method } from "axios";

interface FunctionData {
  name: string;
  params: unknown[];
}
interface FunctionSet {
  functions: FunctionData[];
  promise: { [key: string]: Function };
  array: boolean;
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
interface AdapterResultFormat
{
  globalHash: string;
  sessionHash: string;
  results: AdapterResult[];
}

export interface AdapterResult {
  value: { [keys: string]: unknown } | null;
  error: string | null;
}

var localStorage:Storage;
var sessionStorage:Storage;

/**
 *Ajax通信用アダプタ
 *
 * @export
 * @class Adapter
 */
export class Adapter {
  private handle: number | null;
  private scriptUrl: string;
  private keyName: string;
  private functionSet: FunctionSet[] = [];
  private globalHash = localStorage?localStorage.getItem(this.keyName):null;
  private sessionHash = sessionStorage?sessionStorage.getItem(this.keyName):null;
  /**
   *Creates an instance of Adapter.
   * @param {string} [scriptUrl] 通信先アドレス
   * @param {string} [keyName] セッション情報記憶用キー
   * @memberof Adapter
   */
  public constructor(scriptUrl?: string, keyName?: string) {
    this.scriptUrl = scriptUrl || "./";
    this.keyName = (keyName || "") + "Session";
    this.handle = null;
  }
  public getKeyName(): string {
    return this.keyName;
  }
  /**
   *サーバに対して命令を単独実行
   *呼び出し内容をまとめない
   * @param {string} funcName ファンクション名(className.functionName)
   * @param {...unknown[]} params パラメータ
   * @returns {Promise<never>}
   * @memberof Adapter
   */
  public execAlone(funcName: string, ...params: unknown[]): Promise<never> {
    const functionSet: FunctionSet = {
      functions: [
        {
          name: funcName,
          params: params
        }
      ],
      promise: {},
      array: false
    };
    const promise = new Promise((resolve, reject): void => {
      functionSet.promise.resolve = resolve;
      functionSet.promise.reject = reject;
    });
    this.send([functionSet]);
    return promise as Promise<never>;
  }

  /**
   *戻り値をバイナリとして受け取る(ファイルダウンロード用)
   *命令は単独実行される
   * @param {string} funcName
   * @param {...unknown[]} params
   * @returns {Promise<never>}
   * @memberof Adapter
   */
  public execBinary(funcName: string, ...params: unknown[]): Promise<never> {
    const functionSet: FunctionSet = {
      functions: [
        {
          name: funcName,
          params: params
        }
      ],
      promise: {},
      array: false
    };
    const promise = new Promise((resolve, reject): void => {
      functionSet.promise.resolve = resolve;
      functionSet.promise.reject = reject;
    });
    this.send([functionSet], true);
    return promise as Promise<never>;
  }

  /**
   *複数のファンクションの実行
   *
   * @param {FunctionData[][]} functions
   * @returns {Promise<any>}
   * @memberof Adapter
   */
  public exec(functions: FunctionData[][]): Promise<never[]>;
  /**
   *単一ファンクションの実行
   *
   * @param {string} funcName ファンクション名
   * @param {...unknown[]} params パラメータ
   * @returns {Promise<any>}
   * @memberof Adapter
   */
  // eslint-disable-next-line no-dupe-class-members
  public exec(funcName: string, ...params: unknown[]): Promise<never>;
  // eslint-disable-next-line no-dupe-class-members
  public exec(v1: FunctionData[][] | string, ...v2: unknown[]): Promise<never> {
    let functionSet: FunctionSet;
    if (Array.isArray(v1)) {
      const functions: FunctionData[] = [];
      for (let func of v1 as unknown[][]) {
        functions.push({
          name: func[0] as string,
          params: func.slice(1)
        });
      }
      functionSet = {
        functions: functions,
        promise: {},
        array: true
      };
    } else {
      functionSet = {
        functions: [{ name: v1, params: v2 }],
        promise: {},
        array: false
      };
    }

    const promise = new Promise((resolve, reject): void => {
      functionSet.promise.resolve = resolve;
      functionSet.promise.reject = reject;
    });
    this.functionSet.push(functionSet);
    this.callSend();
    return promise as Promise<never>;
  }

  /**
   *同じタイミングで発生した複数命令をプールして同時に実行する
   *
   * @private
   * @memberof Adapter
   */
  private callSend(): void {
    if (!this.handle) {
      this.handle = setTimeout((): void => {
        this.handle = null;
        this.send(this.functionSet);
      }, 0);
    }
  }

  /**
   *命令の実行と受け取り処理
   *
   * @private
   * @param {FunctionSet[]} functionSet
   * @param {boolean} [binary]
   * @returns
   * @memberof Adapter
   */
  private async send(functionSet: FunctionSet[], binary?: boolean) {
    const globalHash = this.globalHash;
    const sessionHash = this.sessionHash;
    const params: AdapterFormat = {
      globalHash: globalHash,
      sessionHash: sessionHash,
      functions: []
    };

    this.functionSet = [];
    for (let funcs of functionSet) {
      for (let func of funcs.functions)
        params.functions.push({
          function: func.name,
          params: func.params
        });
    }

    const res = (await Adapter.sendJsonAsync(
      this.scriptUrl + "?cmd=exec",
      params,
      undefined,
      binary
    )) as AdapterResultFormat | null;

    if (res === null) {
      for (let funcs of functionSet) {
        // eslint-disable-next-line no-console
        console.error("通信エラー");
        funcs.promise.reject("通信エラー");
      }
      return;
    }
    //バイナリデータはそのまま返却
    if (binary) {
      for (let funcs of functionSet) {
        funcs.promise.resolve(res);
      }
      return;
    }
    //セッションキーの更新
    if (res.globalHash && localStorage){
      localStorage.setItem(this.keyName, res.globalHash);
      this.globalHash = res.globalHash
    }
    if (res.sessionHash && sessionStorage){
      sessionStorage.setItem(this.keyName, res.sessionHash);
      this.sessionHash = res.sessionHash
    }

    const results = res.results;
    let index = 0;
    for (let funcs of functionSet) {
      const length = funcs.functions.length;
      if (funcs.array) {
        const values = [];
        for (let i = index; i < length; i++) {
          if (results[i].error) {
            // eslint-disable-next-line no-console
            console.error(results[i].error);
            funcs.promise.reject(results[i].error);
            break;
          }
          values.push(results[i].value);
        }
        funcs.promise.resolve(values);
      } else {
        const result = results[index];
        // eslint-disable-next-line no-console
        if (result.error) console.error(result.error);
        else funcs.promise.resolve(result.value);
      }
      index += length;
    }
  }

  /**
   *Jsonデータ送受信とPromise化
   *
   * @static
   * @param {string} url
   * @param {unknown} [data]
   * @param {{ [key: string]: string }} [headers]
   * @param {boolean} [binary]
   * @returns {Promise<unknown>}
   * @memberof Adapter
   */
  public static sendJsonAsync(
    url: string,
    data?: object,
    headers?: { [key: string]: string },
    binary?: boolean
  ): Promise<unknown> {
    return new Promise((resolve, reject): void => {
      if (binary) {
        Adapter.sendJsonToBinary(
          url,
          data,
          (value, status): void => {
            if (status === 200) resolve(value);
            else reject({ value, status });
          },
          headers
        );
      } else {
        Adapter.sendJson(
          url,
          data,
          (value, status): void => {
            if (status === 200) resolve(value);
            else reject({ value, status });
          },
          headers
        );
      }
    });
  }

  /**
   *Jsonデータの送受信
   *
   * @private
   * @static
   * @param {string} url
   * @param {unknown} data
   * @param {Function} proc
   * @param {{ [key: string]: string }} [headers]
   * @returns {void}
   * @memberof Adapter
   */
  private static sendJson(
    url: string,
    data: object | undefined,
    proc: (value: unknown, status: number) => void,
    headers?: { [key: string]: string }
  ): void {
    axios({
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      data: JSON.stringify(data),
      url
    }).then(res => proc(res.data, res.status));
  }

  /**
   *Jsonデータの送信とblobの受け取り
   *
   * @private
   * @static
   * @param {string} url
   * @param {unknown} data
   * @param {Function} proc
   * @param {{ [key: string]: string }} [headers]
   * @returns {void}
   * @memberof Adapter
   */
  private static sendJsonToBinary(
    url: string,
    data: object | undefined,
    proc: (value: unknown, status: number) => void,
    headers?: { [key: string]: string }
  ): void {
    axios({
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      data: JSON.stringify(data),
      responseType: "arraybuffer",
      url
    }).then(res => proc(res.data, res.status));
  }

  /**
   *ファイルのアップロード
   *パラメータはURLに設定される
   *
   * @param {Blob} buffer
   * @param {string} funcName
   * @param {...unknown[]} params
   * @returns
   * @memberof Adapter
   */
  public upload(buffer: Blob, funcName: string, ...params: unknown[]) {
    return new Promise((resolve, reject) => {
      //ハッシュデータの読み出し
      const globalHash = this.globalHash;
      const sessionHash = this.sessionHash;
      const adapterFormat: AdapterFormat = {
        globalHash: globalHash,
        sessionHash: sessionHash,
        functions: [
          {
            function: funcName,
            params
          }
        ]
      };
      const proc = (res: AdapterResultFormat) => {
        if (res == null) {
          // eslint-disable-next-line no-console
          console.error("通信エラー");
          reject("通信エラー");
        } else {
          if (res.globalHash && localStorage){
            localStorage.setItem(this.keyName, res.globalHash);
            this.globalHash = res.globalHash
          }
          if (res.sessionHash && sessionStorage){
            sessionStorage.setItem(this.keyName, res.sessionHash);
            this.sessionHash = res.sessionHash
          }
          if (res.results && res.results.length) {
            const result = res.results[0];
            if (result.error) reject(result.error);
            else resolve(result.value);
          } else {
            resolve(null);
          }
        }
      };
      //ファイルデータの送信
      Adapter.sendFile(this.scriptUrl + "?cmd=upload", buffer, proc, {
        params: JSON.stringify(adapterFormat)
      });
    });
  }

  /**
   *ファイル送信
   *
   * @static
   * @param {string} url
   * @param {Blob} buffer
   * @param {(result: never) => void} proc
   * @param {({ [key: string]: string | number })} params
   * @returns
   * @memberof Adapter
   */
  public static sendFile(
    url: string,
    buffer: Blob,
    proc: (
      result: AdapterResultFormat,
      status: number
    ) => void,
    params: { [key: string]: string | number },
    headers?: { [key: string]: string }
  ) {
    //GETパラメータの構築
    let urlParam = "";
    if (params) {
      for (const key of Object.keys(params)) {
        if (urlParam.length) urlParam += "&";
        urlParam +=
          encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }
      url += url.indexOf("?") >= 0 ? "&" : "?";
      url += urlParam;
    }
    axios({
      method: "POST",
      headers: { ...headers, "Content-Type": "application/octet-stream" },
      data: buffer,
      responseType: "arraybuffer",
      url
    }).then(res => proc(res.data, res.status));
  }
}
