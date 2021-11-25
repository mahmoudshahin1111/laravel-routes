import * as vscode from "vscode";
import { CompletionRoutesProvider } from "./completion-routes-provider";
import { Exception } from "./exception";

import { PayloadFilter } from "./filters/payload-filter";
import { RouteFile } from "./route-file";
import { Storage } from "./storage";
import { Route, RouteGroup } from "./types";
import * as transformers from "./utils/transformers";
import * as phpParser from "php-parser";
import { PhpRouteGroupResolver } from "./resolvers/php-route-group-resolver";
import { CONFIG } from "./utils/config";
import { RouteGlobalPrefixResolver } from "./resolvers/route-global-prefix-resolver";

export class LaravelRoutes {
  private storage: Storage;
  constructor(private context: vscode.ExtensionContext, private routesDirPath: string) {}

  async start() {
    try {
      const engine = new phpParser.Engine({ parser: { extractDoc: true, php7: true }, ast: { withPositions: true } });
      this.storage = new Storage(this.context);
      const routeFiles: RouteFile[] = [];
      const routesFilesPaths = await vscode.workspace.findFiles(`${this.getRoutesFolderPath()}/**/*.php`);
      for (const routeFilePath of routesFilesPaths) {
        const payload = await vscode.workspace.fs.readFile(routeFilePath);
        // resolve global prefix of providers
        const path = this.getProvidersFolderPath();
        const providersFilesPaths: vscode.Uri[] = await vscode.workspace.findFiles(`${path}/*.php`);
        let globalPrefix = "";
        for (const providerFilePath of providersFilesPaths) {
          const routeGlobalPrefixResolver = new RouteGlobalPrefixResolver(engine);
          const filePayload = await vscode.workspace.fs.readFile(providerFilePath);
          globalPrefix = routeGlobalPrefixResolver.resolve(filePayload.toString(),this.resolveTheFileRouteFileNameOfThePath(routeFilePath.path));
        }
        const payloadFilter = new PayloadFilter();
        const filteredPayload: string = payloadFilter.filter(payload.toString());

        const phpRouteGroupResolver: PhpRouteGroupResolver = new PhpRouteGroupResolver(engine);
        const routeGroups: RouteGroup<phpParser.Engine>[] = phpRouteGroupResolver.resolve(filteredPayload.toString());
        routeFiles.push(new RouteFile(routeFilePath.path, routeGroups, globalPrefix));
      }
      await this.storeRouteFiles(routeFiles);
      let routes: Route[] = [];
      routeFiles.forEach((routeFile) => {
        routes = routes.concat(routeFile.resolveRoutes());
      });

      this.registerCompletionRoutesProvider(routes);
      console.log(routes);
    } catch (e: any) {
      if (e instanceof Exception) {
        throw e;
      } else {
        throw new Exception(e.toString());
      }
    }
  }
  private resolveTheFileRouteFileNameOfThePath(routeFilePath: string): string {
    const pathSections = routeFilePath.split("/");
    const fileNameWithExtension: string = pathSections[pathSections.length - 1];
    const fileNameWithoutExtensionSections = fileNameWithExtension.split(".");
    return fileNameWithoutExtensionSections[0];
  }
  private getRoutesFolderPath(): string {
    return vscode.workspace.getConfiguration(CONFIG.extensionName).get("routes.RoutesFolderPath", CONFIG.routesFolderPath);
  }
  private getProvidersFolderPath(): string {
    return vscode.workspace.getConfiguration(CONFIG.extensionName).get("routes.ProvidersFolderPath", CONFIG.providerFolderPath);
  }

  private storeRouteFiles(routeFiles: RouteFile[]): Thenable<void> {
    return this.storage.set<RouteFile[]>("route_files", routeFiles);
  }
  private registerCompletionRoutesProvider(routes: Route[]) {
    const items: vscode.CompletionItem[] = routes.map((route) => transformers.convertRouteToCompletionItem(route));
    this.context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider({ language: "php" }, new CompletionRoutesProvider(items), "l", "w")
    );
  }
}
