
export interface Route{
    prefix:string;
    payload:string;
}
export interface RouteGroup<TPayload>{
    prefix:string;
    routes:Route[];
    payload:TPayload;
}

