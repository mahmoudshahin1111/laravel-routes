import { Route, RouteGroup } from "./types";

export class RouteFile {
  constructor(private path: string, private routeGroups: RouteGroup[]) {}
  resolveRoutes(): Route[] {
    let routes: Route[] = [];
    
    this.routeGroups.forEach((routeGroup) => {
        const groupPrefix:string = routeGroup.prefix?routeGroup.prefix.replace(/\/$/,''):'';
        routes = routes.concat(routeGroup.routes.map(route=>{
            const routePrefix:string = route.prefix?route.prefix.replace(/^\/|\/$/,''):'';
            return {
                ...route,
                prefix: (groupPrefix?groupPrefix+'/':'')+ routePrefix
            }
        }));
    });
    return routes;
  }
}
