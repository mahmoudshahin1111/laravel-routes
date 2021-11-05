import * as vscode from "vscode";


export class Storage {
  private storageKeys:string[];
  constructor(private context:vscode.ExtensionContext) {
    this.storageKeys =  [];
  }
  set<T>(key: string, data: T): Thenable<void> {
    this.setToStorageKeys(key);
    return this.context.workspaceState.update(key, Buffer.from(JSON.stringify(data)))
  }
  get<T>(key: string): Promise<T> {
    return new Promise<T>(resolve => {
      const payload = this.context.workspaceState.get(key) as Int8Array[];
      resolve(JSON.parse(payload.toString()) as T);
    })

  }
  setToStorageKeys(key:string):void{
    const isExists =  this.storageKeys.includes(key);
    !isExists?this.storageKeys.push(key):'';
  }
  getStorageKeys():string[]{
    return this.storageKeys;
  }
}
