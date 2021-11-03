import * as vscode from "vscode";
import { Container } from "./container";

export class Storage {
  private storageKeys:string[];
  constructor(private container:Container) {
    this.storageKeys =  [];
  }
  set<T>(key: string, data: T): Thenable<void> {
    this.setToStorageKeys(key);
    const context = this.container.get<vscode.ExtensionContext>('context');
    return context.workspaceState.update(key, Buffer.from(JSON.stringify(data)))
  }
  get<T>(key: string): Promise<T> {
    const context = this.container.get<vscode.ExtensionContext>('context');
    return new Promise<T>(resolve => {
      const payload = context.workspaceState.get(key) as Int8Array[];
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
