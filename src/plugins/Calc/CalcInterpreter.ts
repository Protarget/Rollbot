import CalcEnvironment, { CalcFunction, CalcMacroFunction, CalcMacroOperator, CalcMacroUnaryOperator, CalcOperator, CalcUnaryOperator, CalcValue, calcVariableValueToString } from "./CalcEnvironment"
import CalcParser, { AstFunctionCall, AstName, AstNode, AstOperator, AstUnaryOperator, isAstArray, isAstFunctionCall, isAstName, isAstNumber, isAstOperator, isAstString, isAstUnaryOperator } from "./CalcParser"

export default class CalcInterpreter {
    public readonly environment: CalcEnvironment = new CalcEnvironment()
    private helpTable: Map<string, string> = new Map()
    private parser: CalcParser = null

    public constructor() {
        this.environment.onDefinition(() => this.rebuildParser())
    }

    public run(expr: string): any {
        const ast = this.parser.parse(expr)
        return this.interpretAst(ast)
    }

    public evaluateAst(node: AstNode): any {
        return this.interpretAst(node)
    }

    public pretty(expr: string): any {
        const ast = this.parser.parse(expr)
        return this.parser.pretty(ast)
    }

    public defineHelp(value: string, text: string): void {
        this.helpTable.set(value, text)
    }

    public help(value: string): string {
        const help = this.helpTable.get(value)
        if (help) {
            return help
        }
        else {
            return `No help entry for ${value}`
        }
    }

    public get helpEntries(): string[] {
        return Array.from(this.helpTable.keys())
    }

    private rebuildParser(): void {
        const table = new Map<string, [string, number, boolean]>()
        this.environment.operatorsAndMacroOperators.forEach(([k, v]) => table.set(k, [k, v.precedence, v.rightAssociative]))
        this.parser = new CalcParser(table)
    }

    private interpretAst(node: AstNode): any {
        if (isAstNumber(node)) {
            return node.value
        }
        else if (isAstString(node)) {
            return node.value
        }
        else if (isAstArray(node)) {
            return node.values.map(n => this.interpretAst(n))
        }
        else if (isAstName(node)) {
            return this.interpretVariable(node)
        }
        else if (isAstOperator(node)) {
            return this.interpretOperator(node)
        }
        else if (isAstFunctionCall(node)) {
            return this.interpretFunction(node)
        }
        else if (isAstUnaryOperator(node)) {
            return this.interpretUnaryOperator(node)
        }
    }

    private interpretOperator(node: AstOperator): any {
        const operator = this.environment.lookup(node.symbol.value)
        if (!operator) {
            throw new Error("Unknown symbol: " + node.symbol.value)
        }
        else if (operator instanceof CalcOperator) {
            return operator.behaviour(this.interpretAst(node.left), this.interpretAst(node.right))
        }
        else if (operator instanceof CalcMacroOperator) {
            return this.interpretMacroOperator(node, operator)
        }
        else {
            throw new Error("Tried to use " + node.symbol.value + " as operator, but it's " + calcVariableValueToString(operator))
        }
    }

    private interpretFunction(node: AstFunctionCall): any {
        const func = this.environment.lookup(node.name.value)
        if (!func) {
            throw new Error("Unknown symbol: " + node.name.value)
        }
        else if (func instanceof CalcFunction) {
            return func.behaviour(...node.arguments.map(n => this.interpretAst(n)))
        }
        else if (func instanceof CalcMacroFunction) {
            return this.interpretMacroFunction(node, func)
        }
        else {
            throw new Error("Tried to use " + node.name.value + " as function, but it's " + calcVariableValueToString(func))
        }
    }

    private interpretVariable(node: AstName): any {
        const vari = this.environment.lookup(node.value)
        if (!vari) {
            throw new Error("Unknown symbol: " + node.value)
        }
        else if (vari instanceof CalcValue) {
            return vari.value
        }
        else {
            return vari
        }
    }

    private interpretUnaryOperator(node: AstUnaryOperator): any {
        const operator = this.environment.lookup(node.symbol)
        if (!operator) {
            throw new Error("Unknown symbol: " + node.symbol)
        }
        else if (operator instanceof CalcUnaryOperator) {
            return operator.behaviour(this.interpretAst(node.right))
        }
        else if (operator instanceof CalcMacroUnaryOperator) {
            return this.interpretMacroUnaryOperator(node, operator)
        }
        else if (operator instanceof CalcOperator && operator.unaryVersion) {
            return operator.unaryVersion.behaviour(this.interpretAst(node.right))
        }
        else {
            throw new Error("Tried to use " + node.symbol + " as unary operator, but it's " + calcVariableValueToString(operator))
        }
    }

    private interpretMacroFunction(node: AstFunctionCall, func: CalcMacroFunction): any {
        return func.macroBehaviour(...node.arguments)
    }

    private interpretMacroOperator(node: AstOperator, operator: CalcMacroOperator): any {
        return operator.macroBehaviour(node.left, node.right)
    }

    private interpretMacroUnaryOperator(node: AstUnaryOperator, operator: CalcMacroUnaryOperator): any {
        return operator.macroBehaviour(node.right)
    }
}
