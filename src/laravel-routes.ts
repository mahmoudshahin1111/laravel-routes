import * as vscode from "vscode";
import { RouteParser } from "./route-parser";
import { Storage } from "./storage";
import { Config, Route } from "./types";
export class LaravelRoutes {
  private static instance: LaravelRoutes | null = null;
  static make(config: Config) {
    if (LaravelRoutes.instance) return LaravelRoutes.instance;
    return (LaravelRoutes.instance = new LaravelRoutes(config));
  }
  private routesPath: string;
  private routeParser: RouteParser;
  private storage: Storage;
  constructor(config: Config) {
    this.routesPath = config.routesFolderPath;
    this.routeParser = new RouteParser();
    this.storage = new Storage();
  }
  async start() {
    let transformedRoutes:Route[] = [];
     const routesFilesPaths = await vscode.workspace.findFiles(`${this.routesPath}/**/*.php`);
     for(const routeFilePath of routesFilesPaths){
      const payload = await vscode.workspace.fs.readFile(routeFilePath);
     transformedRoutes =   transformedRoutes.concat(this.transformRoutes(this.resolveRoutesOfFile(payload)));
     }
    return this.storeRoutes(transformedRoutes);
  }

  private resolveRoutesOfFile(filePayload: Uint8Array): string[] {
    const routes: string[] = [];
    /**
     * TODO::
     * 1- search about groups callbacks
     * 2- search into every group about th routes
     * 3- if route has group repeat the cycle with it
     */
    const routesIterator = filePayload.toString().matchAll(/Route::(get|post|put|delete|update])\(.+,.+/gm);
    for (const route of routesIterator) {
      /** Walking on every line and add processing it to get the route details then save it in a particular format  */
      routes.push(route.length > 0?route[0].toString():route.toString());
    }
    return routes;
  }
  private transformRoutes(routes: string[]): Route[] {
    const transformedRoutes: Route[] = [];
    routes.forEach((route) => transformedRoutes.push(this.routeParser.parse(route)));
    return transformedRoutes;
  }
  private storeRoutes(routes: Route[]) {
    return this.storage.set(routes);
  }


  getRoutes() {
    return;
  }
}
