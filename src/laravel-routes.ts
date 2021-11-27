import * as vscode from "vscode";
import { AutoCompletionProvider } from "./auto-completion-provider";
import { Exception } from "./exception";
import { Storage } from "./storage";
import { Route, RouteGroup } from "./types";
import * as transformers from "./utils/transformers";
import * as phpParser from "php-parser";
import { PhpRouteGroupResolver } from "./resolvers/php-route-group-resolver";
import { CONFIG } from "./utils/config";
import { RouteGlobalPrefixResolver } from "./resolvers/route-global-prefix-resolver";
import { trimLastSlash } from "./filters/string";

export class LaravelRoutes {
  private storage: Storage;
  private autoCompletionProvider: AutoCompletionProvider;
  private engine: phpParser.Engine;
  private booted: boolean;
  constructor(private context: vscode.ExtensionContext, private routesDirPath: string) {
    this.engine = new phpParser.Engine({ parser: { extractDoc: true, php7: true }, ast: { withPositions: true } });
    this.storage = new Storage(this.context);
    this.autoCompletionProvider = new AutoCompletionProvider();
  }
  isBooted(): boolean {
    return this.booted;
  }
  boot() {
  
    const subscription = vscode.languages.registerCompletionItemProvider({ language: "php" }, this.autoCompletionProvider,'"');
    this.context.subscriptions.push(subscription);
    this.booted = true;
  }
  async start() {
    try {
      let transformedRoutes: Route[] = [];
      const routesFilesPaths = await vscode.workspace.findFiles(`${this.getRoutesFolderPath()}/**/*.php`);
      for (const routeFilePath of routesFilesPaths) {
        const payload = await vscode.workspace.fs.readFile(routeFilePath);
        // resolve global prefix of providers
        const path = this.getProvidersFolderPath();
        const providersFilesPaths: vscode.Uri[] = await vscode.workspace.findFiles(`${path}/*.php`);
        let globalPrefix = null;
        for (const providerFilePath of providersFilesPaths) {
          const routeGlobalPrefixResolver = new RouteGlobalPrefixResolver(this.engine);
          const filePayload = await vscode.workspace.fs.readFile(providerFilePath);
          globalPrefix = routeGlobalPrefixResolver.resolve(filePayload.toString(), this.resolveTheFileRouteFileNameOfThePath(routeFilePath.path));
          if (globalPrefix) break;
        }
        const phpRouteGroupResolver: PhpRouteGroupResolver = new PhpRouteGroupResolver(this.engine);
        const routeGroups: RouteGroup<phpParser.Engine>[] = phpRouteGroupResolver.resolve(payload.toString());
        transformedRoutes = transformedRoutes.concat(this.transformRoutes(globalPrefix, routeGroups));
      }
      await this.storeRouteFiles(transformedRoutes);
      console.log(transformedRoutes);
      this.registerCompletionRoutesProvider(transformedRoutes);
    } catch (e: any) {
      if (e instanceof Exception) {
        throw e;
      } else {
        throw new Exception(e.toString());
      }
    }
  }
  private transformRoutes(globalPrefix: string | null, routeGroups: RouteGroup<phpParser.Engine>[]): Route[] {
    let routes: Route[] = [];
    globalPrefix = globalPrefix ? trimLastSlash(globalPrefix) : null;
    routeGroups.forEach((routeGroup) => {
      routes = routes.concat(
        routeGroup.routes.map((route) => {
          return {
            ...route,
            prefix: (globalPrefix ? globalPrefix + "/" : "") + (routeGroup.prefix ? routeGroup.prefix + "/" : "") + route.prefix
          };
        })
      );
    });
    return routes;
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

  private storeRouteFiles(routeFiles: Route[]): Thenable<void> {
    /* use model for every storage because keys can forget about it */
    return this.storage.set<Route[]>("routes", routeFiles);
  }
  private registerCompletionRoutesProvider(routes: Route[]) {
    const items: vscode.CompletionItem[] = routes.filter((route) => !!route.prefix).map((route) => transformers.convertRouteToCompletionItem(route));
    this.autoCompletionProvider.setItems(items);
  }
}
