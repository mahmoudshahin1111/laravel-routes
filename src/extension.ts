// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Container } from "./container";
import { Exception } from "./exception";
import { FileParser } from "./file-parser";
import { LaravelRoutes } from "./laravel-routes";
import { PayloadFilter } from "./payload-filter";
import { RouteParser } from "./route-parser";
import { Storage } from "./storage";
import { CONFIG } from "./utils/config";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(`Congratulations, your extension ${CONFIG.extensionName} is now active!`);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let start = vscode.commands.registerCommand(`${CONFIG.commandPrefix}.start`, (routesFolder: string) => {
    // provide all the dependance
    const container = new Container();
    const routeParser = new RouteParser();
    const payloadFilter = new PayloadFilter();
    const storage = new Storage(container);
    const fileParser = new FileParser(routeParser, payloadFilter);
    container.register('context',context);
    container.register(RouteParser.name,routeParser);
    container.register(Storage.name, storage);
    container.register(PayloadFilter.name, payloadFilter);
    container.register(FileParser.name, fileParser);
    const laravelRoutes = new LaravelRoutes(context,container,"routes");
    // run 
    laravelRoutes.start()
      .then(() => {
        console.log(` ${CONFIG.extensionName} started`);
      }, (exception: Exception) => {
        console.log(exception);
        
        // vscode.window.showErrorMessage(`failed to execute ${CONFIG.extensionName} [${exception.getMessage()}]`);
      });
  });
  context.subscriptions.push(start);
  vscode.commands.executeCommand(`${CONFIG.commandPrefix}.start`);
}

// this method is called when your extension is deactivated
export function deactivate() { }
