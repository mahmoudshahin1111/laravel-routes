import * as vscode from 'vscode';
export class CompletionRoutesProvider implements vscode.CompletionItemProvider{
    constructor(private items:vscode.CompletionItem[]){
        
    }
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return this.items;
    }

}