
import { Exception } from "./exception";
import { LaravelRoutes } from "./laravel-routes";
import * as vscode from "vscode";
import { CONFIG } from "./utils/config";

export function startCommandHandler(context: vscode.ExtensionContext) {
  /* provide dependance */


  /* create the laravel route and start searching about routes and store them */
  const laravelRoutes = new LaravelRoutes(context, "routes");
  laravelRoutes
    .start()
    .then(() => console.log(` ${CONFIG.extensionName} started`))
    .catch((exception: Exception) => {
      console.error(exception.getMessage());
      
      vscode.window.showErrorMessage(`failed to execute ${CONFIG.extensionName} [${exception.getMessage()}]`)
    });
}
