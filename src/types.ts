
export interface Route{
    prefix:string;
    payload:string;
}
export interface RouteGroup{
    prefix?:string;
    routes:Route[];
    payload:string;
}

