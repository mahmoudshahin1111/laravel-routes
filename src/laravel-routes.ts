import * as vscode from 'vscode';
export class LaravelRoutes {
  public static instance: LaravelRoutes | null = null;
  public static make() {
    if (LaravelRoutes.instance) return LaravelRoutes.instance;
    return (LaravelRoutes.instance = new LaravelRoutes());
  }
  private routesPath: string;
  private routesFilesPaths:string[];
  constructor() {
    this.routesPath = "";
    this.routesFilesPaths = [];
  }
  setRoutesPath(routesPath: string) {
    this.routesPath = routesPath + '';
    return this;
  }

  start() {
    vscode.workspace.findFiles("routes/**/*.php").then(routesFilesPaths=>{

		routesFilesPaths.forEach(routeFilePath=>{
			vscode.workspace.fs.readFile(routeFilePath).then(payload=>{
                const routes = [];
				/**
				 * TODO::
				 * 1- search about groups callbacks 
				 * 2- search into every group about th routes 
				 * 3- if route has group repeat the cycle with it 
				 */
				const routesIterator = payload.toString().matchAll(/Route::(get|post|put|delete|update])\(.+,.+/gm);
				for(const route in routesIterator){
					/** Walking on every line and add processing it to get the route details then save it in a particular format  */
					route.toString();
				}
                const routesNodes = this.resolveRoutes(this.routesPath);
                const transformRoutes = this.transformRoutes(routesNodes);
                const serializedRoutes: string = this.serializeRoutes(transformRoutes);
                this.updateRoutesCacheFile(serializedRoutes);
			});
		})
	})
  
  }
  private resolveRoutes(routesPath: string) {

  }
  private transformRoutes(routes: any) {
    return routes;
  }
  private serializeRoutes(routes: any) {
    return JSON.stringify(routes);
  }

  private updateRoutesCacheFile(serializedRoutes: string) {}
  getRoutes() {}
}
