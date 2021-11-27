import * as vscode from "vscode";
export class AutoCompletionProvider implements vscode.CompletionItemProvider {
  private items:vscode.CompletionItem[];
  constructor() {}
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    return this.items ? this.items : [];
  }
  setItems(items:vscode.CompletionItem[]){
    this.items= items;
    return this;
  }
}
