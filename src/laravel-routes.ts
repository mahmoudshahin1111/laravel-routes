import * as vscode from "vscode";
import { Container } from "./container";
import { Exception } from "./exception";

import { FileParser } from "./file-parser";
import { Storage } from "./storage";
import { RouteFile, RouteGroup } from "./types";
export class LaravelRoutes {

  constructor(private context: vscode.ExtensionContext, private container: Container, private routesDirPath: string) {
  }

  async start() {
    try {
      const fileParser = this.container.get<FileParser>(FileParser.name);
      const storage = this.container.get<Storage>(Storage.name);
      const routeFiles: RouteFile[] = [];
      const routesFilesPaths = await vscode.workspace.findFiles(`${this.routesDirPath}/**/*.php`);
      for (const routeFilePath of routesFilesPaths) {

        const payload = await vscode.workspace.fs.readFile(routeFilePath);
        const routeGroups: RouteGroup[] = fileParser.parse(payload.toString());
        routeFiles.push({
          path: routeFilePath.path,
          routeGroups
        });
      }
      await storage.set<RouteFile[]>('route_files', routeFiles);
      storage.get<RouteFile[]>('route_files').then(data => {
        console.log(data);
      })

    } catch (e: any) {
      if (e instanceof Exception) {
        throw e;
      } else {
        throw new Exception(e.toString());
      }

    }
  }
}
