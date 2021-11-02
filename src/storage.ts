import * as vscode from "vscode";
import { Container } from "./container";

export class Storage {
  constructor(private container:Container) {
 
  }
  set<T>(key: string, data: T): Thenable<void> {
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
}
