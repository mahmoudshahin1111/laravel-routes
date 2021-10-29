
export interface Route{
    group:Route;
    prefix:string
}
export interface RouteGroup{
    prefix:string;
    routes:Route[];
}
export interface Config{
    routesDirPath:string
}
export interface StorageConfig{
    routesDirPath?:string
}