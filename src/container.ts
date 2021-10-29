import { Exception } from "./exception";

export class Container{
    private container:{[key:string]:any};
    constructor(){
        this.container = {};
    }
    register<T>(key:string,object:T):void{
        this.container[key] = object;  
    }
    get<T>(key:string):T{
        const obj = this.container[key];
        if(!obj) throw new Exception("object isn't registered");
        return obj as T;
    }
}