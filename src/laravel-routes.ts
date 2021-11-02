import * as vscode from "vscode";
import { Container } from "./container";
import { FileParser } from "./file-parser";
import { Storage } from "./storage";
import { RouteGroup } from "./types";
export class LaravelRoutes {

  constructor(private context: vscode.ExtensionContext, private container: Container, private routesDirPath: string) {
  }

  async start() {
    const fileParser = this.container.get<FileParser>(FileParser.name);
    const storage = this.container.get<Storage>(Storage.name);
    let routeGroups: RouteGroup[] = [];
    const routesFilesPaths = await vscode.workspace.findFiles(`${this.routesDirPath}/**/*.php`);
    for (const routeFilePath of routesFilesPaths) {
      const payload = await vscode.workspace.fs.readFile(routeFilePath);
      routeGroups = routeGroups.concat(fileParser.parse(payload.toString()));
    }
    storage.set<RouteGroup[]>('route_groups', routeGroups);
    storage.get<RouteGroup[]>('route_groups').then(data => {
      console.log(data);
    })

  }
  async buildTheList(){
    
  }
}
