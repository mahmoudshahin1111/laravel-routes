export interface  Resolver<T>{
    resolve(payload:string):T
}