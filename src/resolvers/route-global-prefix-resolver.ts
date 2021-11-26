import { Resolver } from "./resolver";
import * as phpParser from "php-parser";
import * as fs from "fs";
export class RouteGlobalPrefixResolver implements Resolver<string|null> {
  constructor(private phpParserEngine: phpParser.Engine) {}
  resolve(payload: string, routeFilePath: string): string|null {
    let result = null;
    const block: phpParser.Block = this.phpParserEngine.parseCode(payload, "");
    fs.writeFileSync("block.json", JSON.stringify(block));
    for (const namespace of this.resolveNamespaces(block)) {
      this.resolveClasses(namespace).forEach((classDeclaration) => {
        const functionStatements = this.resolveMethods(classDeclaration);
        functionStatements.forEach((functionStatement) => {
          if (!functionStatement.body) return;
          const routesStatements = this.resolveRoutesStatements(routeFilePath, functionStatement.body);
          routesStatements.forEach((routeStatement) => {
            result = this.resolveGlobalRoutePrefixOfStatement(routeStatement);
            return !result; 
          });
        });
      });
    }
    return result;
  }
  private resolveGlobalRoutePrefixOfStatement(statement: phpParser.ExpressionStatement): string | null {
    let currentExpression: any = statement.expression;
    while (currentExpression) {
      if (!currentExpression) return null;
      else if (currentExpression?.what?.offset?.name === "prefix" && currentExpression.arguments[0]) {
        const apiArgument: phpParser.String = currentExpression.arguments[0];
        if (apiArgument) return apiArgument.value as string;
      }
      if (currentExpression?.what) currentExpression = currentExpression.what;
      else currentExpression = null;
    }
    return null;
  }
  private resolveRoutesStatements(routeFilePath: string, block: any): phpParser.ExpressionStatement[] {
    return block.children.filter(
      (child: any) => this.isRouteExpression(child.expression) && this.isRouteFilePathIncluded(routeFilePath, child.expression)
    ) as phpParser.ExpressionStatement[];
  }
  private isRouteFilePathIncluded(routeFilePath: string, expression: phpParser.Call) {
    return !!JSON.stringify(expression).match(routeFilePath);
  }
  private isRouteExpression(expression: phpParser.Call): boolean {
    const offsetName = this.resolveOffsetName(expression);
    if (!offsetName && expression?.what) return this.isRouteExpression(expression.what as any);
    else if (offsetName && offsetName.toLowerCase() === "route") return true;
    return !!offsetName;
  }
  private resolveOffsetName(reference: phpParser.Reference): string | null {
    if (reference?.kind === "staticlookup" && (reference as phpParser.StaticLookup)?.offset) {
      return ((reference as phpParser.StaticLookup)?.offset as phpParser.Identifier)?.name;
    } else if ((reference as phpParser.StaticLookup)?.what) return this.resolveOffsetName((reference as phpParser.StaticLookup)?.what);
    return null;
  }
  private resolveMethods(classDeclaration: phpParser.Declaration): phpParser.Method[] {
    const body: phpParser.Method[] = (classDeclaration as any).body;
    if (!body) return [];
    return body.filter((bodyStatement: phpParser.Method) => bodyStatement.kind === "method");
  }
  private resolveProperties(statement: phpParser.Class): phpParser.PropertyStatement[] {
    return statement.body.filter((child) => child.kind === "propertystatement") as any;
  }
  private resolveClasses(namespace: phpParser.Namespace): phpParser.Class[] {
    return namespace.children.filter((child) => this.isClass(child)) as phpParser.Class[];
  }
  private resolveNamespaces(block: phpParser.Block): phpParser.Namespace[] {
    return block.children.filter((child) => this.isNamespace(child)) as phpParser.Namespace[];
  }

  private isNamespace(node: phpParser.Node): boolean {
    return node.kind === "namespace";
  }
  private isClass(node: phpParser.Node): boolean {
    return node.kind === "class";
  }
}
