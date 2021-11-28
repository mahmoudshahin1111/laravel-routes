// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Exception } from "./exception";
import { LaravelRoutes } from "./laravel-routes";

import { CONFIG } from "./utils/config";

export function activate(context: vscode.ExtensionContext) {
  const laravelRoutes = new LaravelRoutes(context, "routes");
  let startCommand = vscode.commands.registerCommand(`${CONFIG.extensionPrefix}.start`, () => {
    if (!laravelRoutes.isBooted()) laravelRoutes.boot();
    laravelRoutes
      .start()
      .then(() => console.log(` ${CONFIG.extensionName} started`))
      .catch((exception: Exception) => {
        vscode.window.showErrorMessage(`failed to execute ${CONFIG.extensionName} [${exception.getMessage()}]`);
      });
  });
  context.subscriptions.push(startCommand);
}
export function deactivate() {}
