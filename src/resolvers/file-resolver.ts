import { PayloadFilter } from "../filters/payload-filter";
import { RouteResolver } from "./route-resolver";
import { Route, RouteGroup } from "../types";

export class FileResolver {

  constructor(private routeResolver: RouteResolver, private payloadFilter: PayloadFilter) {

  }
  resolve(payload: string): RouteGroup[] {
    /**
     * TODO::
     * 1- search about groups callbacks
     * 2- search into every group about th routes
     * 3- if route has group repeat the cycle with it
     */
    const filteredPayload:string = this.payloadFilter.filter(payload);
    return this.routeResolver.resolve(filteredPayload);
  }
}
