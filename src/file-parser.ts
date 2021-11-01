import { PayloadFilter } from "./payload-filter";
import { RouteParser } from "./route-parser";
import { Route, RouteGroup } from "./types";

export class FileParser {
  private routeGroups: RouteGroup[];
  constructor(private routeParser: RouteParser, private payloadFilter: PayloadFilter) {
    this.routeGroups = [];
  }
  parse(payload: string): RouteGroup[] {
    /**
     * TODO::
     * 1- search about groups callbacks
     * 2- search into every group about th routes
     * 3- if route has group repeat the cycle with it
     */
    
    const filteredPayload:string = this.payloadFilter.filter(payload);
    return this.routeParser.parse(filteredPayload);
    // const transformedRoutes: Route[] = [];
    // routes.forEach((route) => transformedRoutes.push(this.routeParser.parse(route)));
    // return transformedRoutes;
  }


  // private parseRouteGroups(payload: string): RouteGroup[] {
  //   const routeGroupPayloads = this.resolveRouteGroups(payload);

  //   if (routeGroupPayloads.length) {
  //     routeGroupPayloads.forEach((routeGroupPayload) => {
  //       this.routeGroups = this.routeGroups.concat(this.parseRouteGroups(routeGroupPayload));
  //     });
  //     return this.routeGroups;
  //   }
  //   const routeGroup: RouteGroup = this.routeParser.parseRouteGroup(payload);
  //   routeGroup.routes = this.parseRoutes(payload);
  //   return this.routeGroups;
  // }
  // private parseRoutes(payload: string): Route[] {
  //   const routes: Route[] = [];
  //   const routesPayloads: string[] = this.resolveRoutes(payload);
  //   routesPayloads.forEach((routePayload) => {
  //     routes.push(this.routeParser.parse(routePayload));
  //   });

  //   return routes;
  // }
  // resolveRoutes(payload: string): string[] {
  //   const routes: string[] = [];
  //   const routesIterator = payload.toString().matchAll(/Route::(get|post|put|delete|update])\(.+,.+/gm);
  //   for (const route of routesIterator) {
  //     routes.push(route.length > 0 ? route[0].toString() : route.toString());
  //   }
  //   return routes;
  // }
  // resolveRouteGroups(payload: string): string[] {
  //   const routeGroupsPayloads: string[] = [];
  //   const routesIterator = payload
  //     .toString()
  //     .matchAll(/(Route::.*?\(.*?\)->group\(function(.*)?\(\)(.*)?\{(.|\n)*?\}\)\;)|(Route::group\((.*?)function(.*)?\(\)(.*)?\{(.|\n)*?\}\)\;)/gm);
  //   for (const route of routesIterator) {
  //     routeGroupsPayloads.push(route.length > 0 ? route[0].toString() : route.toString());
  //   }
  //   return routeGroupsPayloads;
  // }
}
