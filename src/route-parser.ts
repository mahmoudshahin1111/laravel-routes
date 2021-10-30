import { Route, RouteGroup } from "./types";



export class RouteParser{
    parse(route:string):Route{
        const transformedRoutes: Route[] = [];
     
        let parsedRoute:Route = {} as Route;
        const matches = route.matchAll(/Route::.+\((\'.+\'),.+\);/gm);
        for(const matched of  matches){
            parsedRoute.prefix = matched.length > 0 ? matched[1].toString():matched.toString();
        }
        return parsedRoute;
    }
    parseRouteGroup(payload:string):RouteGroup{
        //(function\((.|\n)*?\)\{(.|\n)*?}\));
        return {} as RouteGroup;
    }
    parseRoute(payload:string):Route{
        return {} as Route;
    }
}