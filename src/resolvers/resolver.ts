export interface  Resolver<T>{
    resolve(payload:string,...args:any):T
}