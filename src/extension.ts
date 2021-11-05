// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { startCommandHandler } from "./commands";

import { CONFIG } from "./utils/config";

export function activate(context: vscode.ExtensionContext) {
  console.log(`Congratulations, your extension ${CONFIG.extensionName} is now active!`);
  let startCommand = vscode.commands.registerCommand(`${CONFIG.commandPrefix}.start`, () => startCommandHandler(context));
  context.subscriptions.push(startCommand);
  vscode.commands.executeCommand(`${CONFIG.commandPrefix}.start`);
}
export function deactivate() {}
