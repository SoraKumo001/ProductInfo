import { ReduxModule } from "@jswf/redux-module";
import { ManagerModule } from "../Manager.tsx/Module";

export interface UserState {
  userInfo: UserInfo;
  isLoginWindow: boolean;
  isListWindow: boolean;
  isEditWindow: boolean;
  request: boolean;
  users?: UserInfo[];
  editInfo?: UserInfo;
}
export interface UserInfo {
  no: number;
  pass?:string;
  type: string;
  id: string;
  name: string;
  admin: boolean;
}

/**
 *ユーザデータ管理用モジュール
 *
 * @export
 * @class UserModule
 * @extends {BaseModule<CustomMap>}
 */
export class UserModule extends ReduxModule<UserState> {
  static defaultState: UserState = {
    isLoginWindow: false,
    isListWindow: false,
    isEditWindow: false,
    userInfo: {
      no: 0,
      name: "Guest",
      admin: false,
      id: "Guest",
      type: "local"
    },
    request: false
  };
  public static includes = [ManagerModule];
  getAdapter() {
    return this.getModule(ManagerModule).getAdapter()!;
  }
  private userInfo?: UserInfo;

  public getUserInfo() {
    return this.userInfo;
  }
  public isAdmin() {
    const userInfo = this.userInfo;
    return userInfo && userInfo.admin;
  }
  /**
   *セッションログイン処理
   *
   * @returns
   * @memberof AppManager
   */
  public async request() {
    const adapter = this.getAdapter();
    //ユーザ情報の要求
    const userInfo = (await adapter.exec("Users.request")) as UserInfo;
    if (userInfo) {
      this.userInfo = userInfo;
    }
    this.setState({ userInfo });
    return userInfo;
  }
  public async login(
    userId: string,
    userPass: string,
    local: boolean,
    keep: boolean
  ) {
    const adapter = this.getAdapter();
    const userInfo = (await adapter.exec(
      "Users.login",
      userId,
      userPass,
      local,
      keep
    )) as UserInfo;
    if (userInfo) {
      this.userInfo = userInfo;
      sessionStorage.setItem(
        adapter.getKeyName() + "UserInfo",
        JSON.stringify(userInfo)
      );
    }
    this.setState({
      userInfo
    });
    return userInfo;
  }
  public async logout() {
    const adapter = this.getAdapter();
    const userInfo = (await adapter.exec("Users.logout")) as UserInfo;
    this.setState({
      userInfo
    });
    return userInfo;
  }
  public async setUser(
    no: number,
    userId: string,
    userName: string,
    userPass: string,
    local?: boolean
  ) {
    const adapter = this.getAdapter();
    const info = (await adapter.exec(
      "Users.setUser",
      no,
      userId,
      userName,
      userPass,
      local
    )) as Promise<UserInfo>;
    //    this.callEvent("updateUser", info);

    //暫定管理者なら再ログイン
    if (!this.userInfo || this.userInfo.no === 0) {
      this.request();
    }
    return info;
  }
  public delUser(userNo: number, local: boolean) {
    const adapter = this.getAdapter();
    return (adapter.exec("Users.delUser", userNo, local) as Promise<
      boolean | null
    >).then(result => {
      //   this.callEvent("updateUser", { no: userNo });
      return result;
    });
  }
  public async getUsers(local: boolean) {
    const adapter = this.getAdapter();
    const users = (await adapter.exec("Users.getUsers", local)) as Promise<
      UserInfo[]
    >;
    if (users) {
      this.setState({ users });
    }
  }
}
