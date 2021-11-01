import { Route, RouteGroup } from "./types";



export class RouteParser {

    constructor() {

    }
    parse(payload: string): RouteGroup[] {
        console.log(payload);

        let routeGroups: RouteGroup[] = [];
        const routeGroupsPayloads: string[] | null = this.getRouteGroupsPayloads(payload);
        if (!routeGroupsPayloads) return routeGroups;
        for (const routeGroupPayload of routeGroupsPayloads) {
            routeGroups = routeGroups.concat(this.parseRouteGroups(routeGroupPayload));
        }
        return routeGroups;
    }
    parseRouteGroups(payload: string): RouteGroup[] {

        let routeGroups: RouteGroup[] = [];
        const routeGroupsPayloads: string[] | null = this.getRouteGroupsPayloads(payload);
        if (!routeGroupsPayloads) return routeGroups;
        for (const routeGroupPayload of routeGroupsPayloads) {
            if (routeGroupPayload !== payload) {
                const nestedRouteGroups = this.parseRouteGroups(routeGroupPayload);
                if (nestedRouteGroups.length) routeGroups = routeGroups.concat(nestedRouteGroups);
            }
            const routeGroup = this.parseRouteGroup(routeGroupPayload);
            console.log(routeGroup);
            
            routeGroups.push(routeGroup);
        }
        return routeGroups;
    }

    private getRouteGroupsPayloads(payload: string): string[] | null {
        return payload.match(/(group(.|\n)*?function\((.|\n)*?\)\{(.|\n)*?}\))|(Route::(middleware|name|prefix|domain|namespace))(.|\n)*?function\((.|\n)*?\)\{(.|\n)*?}\)/gm);
    }
    private parseRouteGroup(payload: string): RouteGroup {
        const routes: Route[] = this.parseRoutes(payload);
        const routeGroup:RouteGroup = {
            payload,
            routes
        }
        const prefix = this.getRouteGroupPrefixOfPayload(payload);
        if(prefix){
            routeGroup.prefix = prefix
        }
        return routeGroup
    }

    private getRouteGroupPrefixOfPayload(payload:string):string|null{
        const matched =  payload.split('\)\{')[0].match(/\'?prefix\'?.*?\'(.*?)\'/);
           if (!matched) return null;
           else if(matched.length > 0) return matched[1];
           return  matched[0];
       }

    parseRoutes(payload: string): Route[] {
        const routes: Route[] = [];
        const matches = payload.match(/Route::(get|post|put|delete|update])(.|\n)*?;/gm);
        if (!matches) return routes;
        for (const matched of matches) {
            const route = this.parseRoute(matched);
            if (!route) continue;
            routes.push(route);
        }
        return routes;
    }
    private parseRoute(payload: string): Route | null {
        const route: Route = {
            payload
        } as Route;
        const prefix = this.getPrefixOfPayload(payload);
        if(prefix){
            route.prefix = prefix
        }
     
        return route;
    }
    private getPrefixOfPayload(payload:string):string|null{
        const matched =  payload.match(/[get|post|update|put|delete]+\(\'(.+)\',/m);
           if (!matched) return null;
           else if(matched.length > 0) return matched[1];
           return  matched[0];
       }
}