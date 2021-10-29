import * as vscode from "vscode";
import { Route, StorageConfig } from "./types";
import { posix } from "path";
export class Storage {
  private storageRoutesFilePath: vscode.Uri;
  constructor(config:StorageConfig) {
    this.storageRoutesFilePath = this.resolveStoragePath();
  }
  private resolveStoragePath(): vscode.Uri {
    return vscode.Uri.file((vscode.workspace.workspaceFolders?vscode.workspace.workspaceFolders[0].uri.path:'') +  "/laravel-routes.json");
  }
  set<T>(routes: T[]): Thenable<void> {
    return vscode.workspace.fs.writeFile(this.storageRoutesFilePath, Buffer.from(JSON.stringify(routes)));
  }
  get<T>(): Promise<T[]> {
      return new Promise<T[]>(resolve=>{
        return vscode.workspace.fs.readFile(this.storageRoutesFilePath).then(e=>{
            resolve( JSON.parse(e.toString()));
        });
      })
 
  }
}
