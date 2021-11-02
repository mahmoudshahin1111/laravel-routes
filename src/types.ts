import * as vscode from "vscode";
import { Container } from "./container";

export interface Route{
    prefix:string;
    payload:string;
}
export interface RouteGroup{
    prefix?:string;
    routes:Route[];
    payload:string;
}

