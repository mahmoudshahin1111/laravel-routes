import { Route, RouteGroup } from "./types";

export class RouteFile {
  constructor(private path: string, private routeGroups: RouteGroup[],private prefix:string) {}
  resolveRoutes(): Route[] {
    let routes: Route[] = [];
    const filePrefix:string = this.prefix?this.prefix.replace(/\/$/,''):'';
    this.routeGroups.forEach((routeGroup) => {
        const groupPrefix:string = routeGroup.prefix||'';//?routeGroup.prefix.replace(/\/$/,''):'';
        routes = routes.concat(routeGroup.routes.map(route=>{
            const routePrefix:string = route.prefix?route.prefix.replace(/^\/|\/$/,''):'';
            return {
                ...route,
                prefix: (filePrefix?filePrefix+'/':'')+(groupPrefix?groupPrefix+'/':'')+ routePrefix
            }
        }));
    });
    return routes;
  }
}
