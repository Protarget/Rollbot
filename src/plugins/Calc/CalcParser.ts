import { concatenate, digit, fail, flatten, integer, isFailure, isSuccess, lateBinding, letter, num, oneOf, oneOrMore, Parser, ParserState, sequence, spaces, stringifyFailure, succeed, tokens, transform, word, zeroOrMore, zeroOrOne } from "../../utils/parsing"

function wrapFailure<I, O>(reason: string, parser: Parser<I, O>): (state: ParserState<I>) => any {
    return (state: ParserState<I>) => {
        const result = parser(state)
        if (isFailure(result)) {
            return {...result, reason}
        } else {
            return result
        }
    }
}

export interface Token {
    type: string
}

interface LParenToken extends Token {
    type: "lparen"
}

interface RParenToken extends Token {
    type: "rparen"
}

interface LBracketToken extends Token {
    type: "lbracket"
}

interface RBracketToken extends Token {
    type: "rbracket"
}

interface NumberToken extends Token {
    type: "number"
    value: number
}

interface NameToken extends Token {
    type: "name"
    value: string
}

interface OperatorToken extends Token {
    type: "operator"
    value: string
}

interface CommaToken extends Token {
    type: "comma"
}

export interface AstNode {
    type: string
}

export function isAstName(node: AstNode): node is AstName { return node.type === "name"}
export interface AstName extends AstNode {
    type: "name"
    value: string
}

export function isAstNumber(node: AstNode): node is AstNumber { return node.type === "number"}
export interface AstNumber extends AstNode {
    type: "number"
    value: number
}

export function isAstOperatorSymbol(node: AstNode): node is AstOperatorSymbol { return node.type === "operatorSymbol" }
export interface AstOperatorSymbol extends AstNode {
    type: "operatorSymbol"
    value: string
}

export function isAstOperator(node: AstNode): node is AstOperator { return node.type === "operator" }
export interface AstOperator extends AstNode {
    type: "operator"
    symbol: AstOperatorSymbol
    left: AstNode
    right: AstNode
}

export function isAstFunctionCall(node: AstNode): node is AstFunctionCall { return node.type === "functionCall" }
export interface AstFunctionCall extends AstNode {
    type: "functionCall"
    name: AstName
    arguments: AstNode[]
}

export function isAstArray(node: AstNode): node is AstArray { return node.type === "array" }
export interface AstArray extends AstNode {
    type: "array"
    values: AstNode[]
}

export function isAstUnaryOperator(node: AstNode): node is AstUnaryOperator { return node.type === "unaryOperator" }
export interface AstUnaryOperator extends AstNode {
    type: "unaryOperator"
    symbol: string
    right: AstNode
}

export function isAstString(node: AstNode): node is AstString { return node.type === "string" }
export interface AstString extends AstNode {
    type: "string"
    value: string
}

export default class CalcParser {
    private operatorTable: Map<string, [string, number, boolean]>
    private parser: Parser<string, AstNode> = null

    public constructor(operatorTable: Map<string, [string, number, boolean]>) {
        this.operatorTable = operatorTable
        this.buildParser()
    }

    public parse(expression: string): AstNode {
        if (this.parser) {
            const result = this.parser(new ParserState(expression.split(""), 0))
            if (isSuccess(result)) {
                if (result.newState.currentIndex < expression.length) {
                    throw new Error(stringifyFailure(expression, fail(result.newState.currentIndex)))
                } else {
                    return result.value
                }
            } else if (isFailure(result)) {
                throw new Error(stringifyFailure(expression, result))
            }
        } else {
            throw new Error("Unbuilt Parser")
        }
    }

    public pretty(node: AstNode): string {
        if (isAstName(node) || isAstNumber(node)) {
            return node.value.toString()
        } else if (isAstOperator(node)) {
            return `(${this.pretty(node.left)} ${node.symbol.value} ${this.pretty(node.right)})`
        } else if (isAstFunctionCall(node)) {
            return `${node.name.value}(${node.arguments.map((x) => this.pretty(x)).join(", ")})`
        } else if (isAstArray(node)) {
            return `[${node.values.map((x) => this.pretty(x)).join(", ")}]`
        } else if (isAstString(node)) {
            return `"${node.value}"`
        } else {
            return "<UNKNOWN>"
        }
    }

    private buildParser(): void {
        // We need to construct a customized version a shunting yard transform using the operator table
        const shuntingYard = (nodes: AstNode[]): AstNode => {
            const stack: Array<[string, number]> = []
            const data: AstNode[] = []
            for (const node of nodes) {
                if (isAstOperatorSymbol(node)) {
                    const operator = this.operatorTable.get(node.value)
                    const precedence = operator ? operator[1] : 0
                    const rightAssociative = operator ? operator[2] : false
                    while (stack.length > 0 && ((!rightAssociative && stack[stack.length - 1][1] >= precedence) || (rightAssociative && stack[stack.length - 1][1] > precedence))) {
                        const r = data.pop()
                        const l = data.pop()
                        data.push({type: "operator", symbol: {type: "operatorSymbol", value: stack.pop()[0]}, left: l, right: r} as AstOperator)
                    }
                    stack.push([node.value, precedence])
                } else {
                    data.push(node)
                }
            }
            while (stack.length > 0) {
                const r = data.pop()
                const l = data.pop()
                data.push({type: "operator", symbol: {type: "operatorSymbol", value: stack.pop()[0]}, left: l, right: r} as AstOperator)
            }
            return data.pop()
        }

        // First, setup the lexer
        const lexNonQuote: Parser<string, string> = (state: ParserState<string>) => { if (state.peek() === '"' || state.peek() === null || state.peek() === undefined) { return fail(state.currentIndex) } else { return succeed(state.peek(), state.consume()) } }
        const lexStringContent: Parser<string, string> = concatenate(zeroOrMore(lexNonQuote))
        const lexWord: Parser<string, string> = concatenate(sequence(letter, concatenate(zeroOrMore(oneOf(letter, digit)))))
        const lexPunctuation: Parser<string, string> = concatenate(oneOrMore(tokens(..."!@#$%^&*-_=+{}';:/?\\|>.<~`".split(""))))
        const lexLParen: Parser<string, LParenToken> = transform(sequence(tokens("("), spaces), (v) => ({type: "lparen"} as LParenToken))
        const lexRParen: Parser<string, RParenToken> = transform(sequence(tokens(")"), spaces), (v) => ({type: "rparen"} as RParenToken))
        const lexLBracket: Parser<string, LParenToken> = transform(sequence(tokens("["), spaces), (v) => ({type: "lbracket"} as LBracketToken))
        const lexRBracket: Parser<string, RParenToken> = transform(sequence(tokens("]"), spaces), (v) => ({type: "rbracket"} as RBracketToken))
        const lexNumber: Parser<string, NumberToken> = transform(sequence(num, spaces), (v) => v[0], parseFloat, (v) => ({type: "number", value: v} as NumberToken))
        const lexName: Parser<string, NameToken> = transform(sequence(lexWord, spaces), (v) => v[0], (v) => ({type: "name", value: v} as NameToken))
        const lexOperator: Parser<string, OperatorToken> = transform(sequence(lexPunctuation, spaces), (v) => v[0], (v) => ({type: "operator", value: v} as OperatorToken))
        const lexComma: Parser<string, CommaToken> = transform(sequence(tokens(","), spaces), (v) => ({type: "comma"} as CommaToken))

        // Then, setup the tree-style AST
        const astNumber: Parser<string, AstNumber> = transform(lexNumber, (v) => v as AstNumber)
        const astName: Parser<string, AstName> = transform(lexName, (v) => v as AstName)
        const astUnaryOperator: Parser<string, AstUnaryOperator> = transform(sequence(lexOperator, lateBinding(() => astAtom)), (v) => ({type: "unaryOperator", symbol: v[0].value, right: v[1]}))
        const astOperatorSymbol: Parser<string, AstOperatorSymbol> = transform(lexOperator, (v) => ({type: "operatorSymbol", value: v.value}))
        const astString: Parser<string, AstString> = transform(sequence(tokens('"'), lexStringContent, tokens('"'), spaces), (v) => ({type: "string", value: v[1].replace(/\\n/g, "\n")}))
        const astAtom: Parser<string, AstNode> = oneOf(astNumber, astString, lateBinding(() => astArray), astUnaryOperator, lateBinding(() => astFunctionCall), astName, lateBinding(() => astPExpression))
        const astArgument: Parser<string, AstNode> = oneOf(lateBinding(() => astRExpression), astAtom)
        const astArgumentList: Parser<string, AstNode[]> = transform(zeroOrOne(transform(sequence(astArgument, zeroOrMore(transform(sequence(lexComma, astArgument), (v) => v[1]))), (v) => [v[0], ...v[1]])), (v) => v.length === 1 ? v[0] : [])
        const astArray: Parser<string, AstArray> = transform(sequence(lexLBracket, astArgumentList, lexRBracket), (v) => ({type: "array", values: v[1]} as AstArray))
        const astFunctionCall: Parser<string, AstNode> = transform(sequence(astName, lexLParen, astArgumentList, lexRParen), (v) => ({type: "functionCall", name: v[0], arguments: v[2]} as AstFunctionCall))
        const astRExpression: Parser<string, AstNode> = transform(sequence(astAtom, flatten(zeroOrMore(sequence(astOperatorSymbol, astAtom)))), (v) => [v[0], ...v[1]], shuntingYard)
        const astPExpression: Parser<string, AstNode> = transform(sequence(lexLParen, astRExpression, lexRParen), (v) => v[1])
        const astExpression: Parser<string, AstNode> = oneOf(astPExpression, astRExpression)

        this.parser = astRExpression
    }
}
