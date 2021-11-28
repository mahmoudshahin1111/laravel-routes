import * as phpParser from "php-parser";
import { Route, RouteGroup } from "../types";
import { Resolver } from "./resolver";
import * as filter from "../filters/string";
export class PhpRouteGroupResolver implements Resolver<RouteGroup<phpParser.Engine>[]> {
  constructor(private engine: phpParser.Engine) {}
  resolve(payload: string): RouteGroup<phpParser.Engine>[] {
    const parsedPayload = this.engine.parseCode(payload, "");
    let routeGroups: RouteGroup<phpParser.Engine>[] = [];
    parsedPayload.children
      .filter((child: any) => child.kind === "expressionstatement" && this.isRouteNode(child.expression))
      .forEach((child: any) => {
        if (this.isSingleRouteNode(child.expression)) {
          routeGroups.push({ routes: [this.resolveRoute(child)], prefix: "", payload: child });
        } else {
          routeGroups = routeGroups.concat(this.resolveRouteGroups(child));
        }
      });
    return routeGroups;
  }
  private isRouteNode(expression: any): boolean {
    if (!expression) return false;
    else if (String(expression.kind).toLowerCase() === "name" && String(expression.name).toLowerCase() === "route") return true;
    else if (expression.what) return this.isRouteNode(expression.what);
    return false;
  }
  private isSingleRouteNode(expression: any): boolean {
    if (
      expression?.what?.offset?.kind === "identifier" &&
      expression.kind === "call" &&
      expression.what.offset.name.match(/(get|post|any|delete|put|patch|options)/gm)
    )
      return true;
    else if(expression?.what) return this.isSingleRouteNode(expression.what);
    return false;
  }
  private resolveRouteGroups(node: any, prevPrefix?: string): RouteGroup<phpParser.Engine>[] {
    let routeGroups: RouteGroup<phpParser.Engine>[] = [];
    const groupPrefix = this.resolveRouteGroupPrefix(node);
    const fullGroupPrefix = groupPrefix ? (prevPrefix ? prevPrefix + "/" + groupPrefix : groupPrefix) : prevPrefix;
    const routeGroup = { prefix: fullGroupPrefix, routes: [], payload: node } as RouteGroup<phpParser.Engine>;
    const closureExpression = this.resolveClosure(node.expression);
    if (closureExpression) {
      const children = this.resolveChildrenOfExpression(closureExpression);
      children.forEach((child) => {
        if (this.isRouteGroupNode(child.expression)) {
          routeGroups = routeGroups.concat(this.resolveRouteGroups(child, routeGroup.prefix));
        } else {
          routeGroup.routes.push(this.resolveRoute(child));
        }
      });
    }
    routeGroups.push(routeGroup);
    return routeGroups;
  }

  private resolveRoute(node: any): Route {
    const route = {} as Route;
    route.prefix = this.resolveRoutePrefix(node.expression) || "";
    route.payload = node;
    return route;
  }
  private resolveRoutePrefix(expression: any): string | null {
    if (!expression) return null;
    else if (expression.what?.offset?.name.match(/(get|post|any|delete|put|patch|'options')/gm)) {
      const prefixArgument: any = expression.arguments.find((argument: any) => argument.kind === "string") as phpParser.String;
      if (prefixArgument) {
        return this.trimSlashes(prefixArgument.value);
      }
    } else if (expression.what) {
      return this.resolveRoutePrefix(expression.what);
    }
    return null;
  }
  private isRouteGroupNode(expression: any): boolean {
    if (this.resolveExpressionByFunctionName("group", expression)) return true;
    else if (expression.what) return this.isRouteGroupNode(expression.what);
    return false;
  }
  private resolveClosure(expression: any): any {
    if (expression.arguments.find((argument: any) => argument.kind === "closure")) {
      return expression.arguments.find((argument: any) => argument.kind === "closure");
    } else if (expression.what) return this.isRouteGroupNode(expression.what);
    return false;
  }
  private resolveChildrenOfExpression(expression: any): any[] {
    if (!expression.body) return [];
    return expression.body.children;
  }

  private resolveRouteGroupPrefix(node: any): string | null {
    let prefix = null;
    if (node.expression.arguments) {
      const arrayArgument = node.expression.arguments.find((argument: any) => argument.kind === "array");
      if (arrayArgument) {
        const arrayPrefixEntry = arrayArgument.items.find((item: any) => item.key.value === "prefix");
        prefix = arrayPrefixEntry ? this.trimSlashes(arrayPrefixEntry.value.value) : "";
      }
    }
    if (prefix) return this.trimSlashes(prefix);
    const expression = this.resolveExpressionByFunctionName("prefix", node.expression);
    if (expression) {
      return this.trimSlashes(expression.arguments[0].value);
    }
    return null;
  }
  private resolveExpressionByFunctionName(functionName: string, expression: any): any | null {
    if (expression.what?.offset?.name === functionName) return expression;
    else if (expression.what) return this.resolveExpressionByFunctionName(functionName, expression.what);
  }
  private trimSlashes(payload: string): string {
    return filter.trimLastSlash(filter.trimStartSlash(payload));
  }
}
