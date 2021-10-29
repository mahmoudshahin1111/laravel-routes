import * as vscode from "vscode";
import { Container } from "./container";
import { FileParser } from "./file-parser";
import { PayloadFilter } from "./payload-filter";
import { RouteParser } from "./route-parser";
import { Storage } from "./storage";
import { Config, RouteGroup } from "./types";
export class LaravelRoutes {
  private static instance: LaravelRoutes | null = null;
  static make(config: Config) {
    if (LaravelRoutes.instance) return LaravelRoutes.instance;
    return (LaravelRoutes.instance = new LaravelRoutes(config));
  }
  private container: Container;
  private routesPath: string;
  private routeParser: RouteParser;
  private storage: Storage;
  private fileParser: FileParser;
  private payloadParser: PayloadFilter;
  constructor(config: Config) {
    this.routesPath = config.routesDirPath;
    this.boot();
  }
  private boot() {
    this.container = new Container();
    this.routeParser = new RouteParser();
    this.storage = new Storage({ routesDirPath: this.routesPath });
    this.payloadParser = new PayloadFilter();
    this.fileParser = new FileParser(this.routeParser, this.payloadParser);
    this.container.register(RouteParser.name, this.routeParser);
    this.container.register(Storage.name, this.storage);
    this.container.register(FileParser.name, this.payloadParser);
    this.container.register(FileParser.name, this.fileParser);
  }
  async start() {
    let routeGroups: RouteGroup[] = [];
    const routesFilesPaths = await vscode.workspace.findFiles(`${this.routesPath}/**/*.php`);
    for (const routeFilePath of routesFilesPaths) {
      const payload = await vscode.workspace.fs.readFile(routeFilePath);
      routeGroups = routeGroups.concat(this.fileParser.parse(payload.toString()));
    }
    this.storage.set<RouteGroup>(routeGroups);
  }

  getRoutes() {
    return;
  }
}
