import { Route } from "../types";
import * as vscode from 'vscode';
export function convertRouteToCompletionItem(route:Route):vscode.CompletionItem{
    return {    
        label:route.prefix,
        insertText:route.prefix,
        detail:route.payload
    }
}

