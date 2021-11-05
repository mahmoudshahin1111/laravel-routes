import * as vscode from "vscode";
import { CompletionRoutesProvider } from "./completion-routes-provider";
import { Exception } from "./exception";

import { FileResolver } from "./resolvers/file-resolver";
import {
  InlineCommentsFilter,
  MultiLinesCommentFilter,
  PayloadFilter,
  PhpKeywordsFilter,
  PhpTagsFilter,
  SpacesFilter
} from "./filters/payload-filter";
import { RouteFile } from "./route-file";
import { RouteResolver } from "./resolvers/route-resolver";
import { Storage } from "./storage";
import { Route, RouteGroup } from "./types";
import * as transformers from "./utils/transformers";
export class LaravelRoutes {
  private storage: Storage;
  private fileResolver: FileResolver;
  constructor(private context: vscode.ExtensionContext, private routesDirPath: string) {}

  async start() {
    await this.errorHandler(
      async () => {
        const payloadFilter = new PayloadFilter();
        payloadFilter.add(new InlineCommentsFilter());
        payloadFilter.add(new MultiLinesCommentFilter());
        payloadFilter.add(new PhpKeywordsFilter());
        payloadFilter.add(new PhpTagsFilter());
        payloadFilter.add(new SpacesFilter());
        this.fileResolver = new FileResolver(new RouteResolver(), payloadFilter);
        this.storage = new Storage(this.context);
        const routeFiles: RouteFile[] = [];
        const routesFilesPaths = await vscode.workspace.findFiles(`${this.routesDirPath}/**/*.php`);
        for (const routeFilePath of routesFilesPaths) {
          const payload = await vscode.workspace.fs.readFile(routeFilePath);
          const routeGroups: RouteGroup[] = this.fileResolver.resolve(payload.toString());
          routeFiles.push(new RouteFile(routeFilePath.path, routeGroups));
        }
        await this.storeRouteFiles(routeFiles);
        let routes: Route[] = [];
        routeFiles.forEach((routeFile) => {
          routes = routes.concat(routeFile.resolveRoutes());
        });
        console.log(routes);
        
        this.registerCompletionRoutesProvider(routes);
      },
      () => {}
    );
  }
  private async errorHandler(operation: Function, fails: Function) {
    try {
      await operation.call(this);
    } catch (e: any) {
      await fails.call(this);
      if (e instanceof Exception) {
        throw e;
      } else {
        throw new Exception(e.toString());
      }
    }
  }
  private async storeRouteFiles(routeFiles: RouteFile[]) {
    await this.storage.set<RouteFile[]>("route_files", routeFiles);
    const data = await this.storage.get<RouteFile[]>("route_files");
  }
  private registerCompletionRoutesProvider(routes: Route[]) {
    const items: vscode.CompletionItem[] = routes.map((route) => transformers.convertRouteToCompletionItem(route));
    this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: "php" }, new CompletionRoutesProvider(items), "lr"));
  }
}
