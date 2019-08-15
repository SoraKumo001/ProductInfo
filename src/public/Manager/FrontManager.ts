import * as JWF from "javascript-window-framework";
import { BaseModule } from "./BaseModule";
import { RouterModule } from "./RouterModule";

export let appManager:AppManager;
/**
 *
 *
 * @export
 * @class AppManager
 */
export class AppManager {
  private modules: [typeof BaseModule, BaseModule][] = [];
  private adapter: JWF.Adapter;
  private router: RouterModule;
  /**
   *Creates an instance of AppManager.
   * @memberof AppManager
   */
  public constructor(name?:string) {
    appManager = this;
    //通信アダプタの作成
    this.adapter = new JWF.Adapter("./",name);

    this.router = this.getModule(RouterModule);
  }
  public getAdapter() {
    return this.adapter;
  }
  public getModule<T extends BaseModule>(moduleType: {
    new (manager: AppManager): T;
  }): T {
    const modules = this.modules;
    const length = modules.length;
    for(let i=0;i<length;i++){
      if(modules[i][0] === moduleType)
        return modules[i][1] as T;
    }
    const module = new moduleType(this);
    this.modules.push([moduleType as typeof BaseModule,module]);
    return module;
  }
  public goLocation(params:{[key:string]:string|number|null}):void
  public goLocation(name:string,param:string|number|null):void
  public goLocation(p1:unknown,p2?:unknown):void{
    if(typeof p1 === 'string')
      this.router.setLocationParam(p1,p2 as string|number);
    else
      this.router.setLocationParams(p1 as {[key:string]:string|number});
    this.router.goLocation();
  }

  public setLocationParam(name:string,param:string|number|undefined){
    this.router.setLocationParam(name,param);
  }
}
