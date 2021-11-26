
export interface Route{
    prefix:string;
    payload:string;
}
export interface RouteGroup<TPayload>{
    prefix:string|undefined;
    routes:Route[];
    payload:TPayload;
}

