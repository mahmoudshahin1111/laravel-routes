import * as vscode from "vscode";
import { Route } from "./types";
import { posix } from "path";
export class Storage {
  private storageRoutesFilePath: vscode.Uri;
  constructor() {
    this.storageRoutesFilePath = this.resolveStoragePath();
  }
  private resolveStoragePath(): vscode.Uri {
    return vscode.Uri.file((vscode.workspace.workspaceFolders?vscode.workspace.workspaceFolders[0].uri.path:'') +  "/laravel-routes.json");
  }
  append(routes: Route[]): Thenable<void> {
    return vscode.workspace.fs.writeFile(this.storageRoutesFilePath, Buffer.from(JSON.stringify(routes)));
  }
  set(routes: Route[]): Thenable<void> {
    return vscode.workspace.fs.writeFile(this.storageRoutesFilePath, Buffer.from(JSON.stringify(routes)));
  }
  get(): Promise<Route[]> {
      return new Promise<Route[]>(resolve=>{
        return vscode.workspace.fs.readFile(this.storageRoutesFilePath).then(e=>{
            resolve( JSON.parse(e.toString()));
        });
      })
 
  }
}
