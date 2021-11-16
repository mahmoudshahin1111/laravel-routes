import * as vscode from "vscode";
import { CompletionRoutesProvider } from "./completion-routes-provider";
import { Exception } from "./exception";


import {
  PayloadFilter} from "./filters/payload-filter";
import { RouteFile } from "./route-file";
import { Storage } from "./storage";
import { Route, RouteGroup } from "./types";
import * as transformers from "./utils/transformers";
import { GlobalPrefixResolver } from "./resolvers/global-prefix-resolver";
import * as phpParser from 'php-parser';
import { PhpRouteGroupResolver } from "./resolvers/php-route-group-resolver";
export class LaravelRoutes {
  private storage: Storage;
  constructor(private context: vscode.ExtensionContext, private routesDirPath: string) {}

  async start() {
    await this.errorHandler(
      async () => {
        this.storage = new Storage(this.context);
    
       
        const routeFiles: RouteFile[] = [];
        const routesFilesPaths = await vscode.workspace.findFiles(`${this.routesDirPath}/**/*.php`);
        for (const routeFilePath of routesFilesPaths) {
          const payload = await vscode.workspace.fs.readFile(routeFilePath);
          // resolve global prefix of providers

          const fileNameSections:string[] = routeFilePath.path.split('/');
          const globalPrefixResolver = new GlobalPrefixResolver(fileNameSections[fileNameSections.length-1]);
          // resolve the routes of the files 
          const payloadFilter = new PayloadFilter();
          const filteredPayload: string = payloadFilter.filter(payload.toString());
          const engine = new phpParser.Engine({parser:{extractDoc:true,php7:true},ast:{withPositions:true}});
          const phpRouteGroupResolver:PhpRouteGroupResolver = new PhpRouteGroupResolver(engine);
          const routeGroups: RouteGroup<phpParser.Engine>[] = phpRouteGroupResolver.resolve(filteredPayload.toString());
          routeFiles.push(new RouteFile(routeFilePath.path, routeGroups,await globalPrefixResolver.resolve('')));
        }
        await this.storeRouteFiles(routeFiles);
        let routes: Route[] = [];
        routeFiles.forEach((routeFile) => {
          routes = routes.concat(routeFile.resolveRoutes());
        });
    
        
        this.registerCompletionRoutesProvider(routes);
        console.log(routes);
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
  private  storeRouteFiles(routeFiles: RouteFile[]):Thenable<void> {
    return this.storage.set<RouteFile[]>("route_files", routeFiles);
  }
  private registerCompletionRoutesProvider(routes: Route[]) {
    const items: vscode.CompletionItem[] = routes.map((route) => transformers.convertRouteToCompletionItem(route));
    this.context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: "php" }, new CompletionRoutesProvider(items),'l','w'));
  }
}
