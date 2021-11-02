import { PayloadFilter } from "./payload-filter";
import { RouteParser } from "./route-parser";
import { Route, RouteGroup } from "./types";

export class FileParser {

  constructor(private routeParser: RouteParser, private payloadFilter: PayloadFilter) {

  }
  parse(payload: string): RouteGroup[] {
    /**
     * TODO::
     * 1- search about groups callbacks
     * 2- search into every group about th routes
     * 3- if route has group repeat the cycle with it
     */
    const filteredPayload:string = this.payloadFilter.filter(payload);
    return this.routeParser.parse(filteredPayload);
  }
}
