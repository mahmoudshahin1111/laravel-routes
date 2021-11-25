import { Resolver } from "./resolver";
import * as vscode from "vscode";
import { InlineCommentsFilter, MultiLinesCommentFilter, PayloadFilter, PhpKeywordsFilter, PhpTagsFilter, SpacesFilter } from "../filters/payload-filter";
export class GlobalPrefixResolver implements Resolver<Promise<string>> {
  constructor(private providersFolderPath:string,private routeFileName: string) {}
  async resolve(payload: string): Promise<string> {
    const providersPayloads: string[] = await this.resolveProvidersPayloads();
    const filteredPayloads: string[] = [];
    providersPayloads.forEach((payload) => {
      filteredPayloads.push(this.filterPayload(payload));
    });

    for (const filteredPayload of filteredPayloads) {
      const globalPrefix = this.resolveGlobalPrefix(filteredPayload);
      if (globalPrefix) return globalPrefix;
    }
    return "";
  }
  private resolveGlobalPrefix(payload: string): string | null {
    const matchedSections: string[] | null = payload.match(/Route::(.|\n)*?;/gm);
    if(!matchedSections) return null;
    
    for (const matchedSection of matchedSections) {
      if (matchedSection.indexOf(this.routeFileName)<0) continue;
      const matches = matchedSection.match(/prefix\(\'(.+?)\'\)/m);
      return matches ? matches[1] : null;
    }
    return null;
  }

  private filterPayload(payload: string): string {
    const payloadFilter = new PayloadFilter();
    payloadFilter.add(new InlineCommentsFilter());
    payloadFilter.add(new MultiLinesCommentFilter());
    payloadFilter.add(new PhpKeywordsFilter());
    payloadFilter.add(new PhpTagsFilter());
    payloadFilter.add(new SpacesFilter());
    return payloadFilter.filter(payload);
  }
  private async resolveProvidersPayloads() {
    const payloads: string[] = [];
    const paths = await this.getProviderFiles();
    for (const path of paths) {
      payloads.push((await this.getProviderPayload(path)).toString());
    }
    return payloads;
  }
  private getProviderPayload(path: vscode.Uri) {
    return vscode.workspace.fs.readFile(path);
  }
  private getProviderFiles(): Thenable<vscode.Uri[]> {
    return vscode.workspace.findFiles(`${this.providersFolderPath}/*.php`);
  }
}
