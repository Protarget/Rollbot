import { AstNode } from "./CalcParser"

class CalcVariableValue {

}

export class CalcValue extends CalcVariableValue {
    public readonly value: any

    public constructor(value: any) {
        super()
        this.value = value
    }
}

export class CalcFunction extends CalcVariableValue  {
    public readonly behaviour: (...args: any[]) => any

    public constructor(behaviour: (...args: any[]) => any) {
        super()
        this.behaviour = behaviour
    }
}

export class CalcOperator extends CalcVariableValue  {
    public readonly behaviour: (left: any, right: any) => any
    public readonly precedence: number = 0
    public readonly rightAssociative: boolean = false
    public unaryVersion: CalcUnaryOperator

    public constructor(precedence: number, rightAssociative: boolean, behaviour: (left: any, right: any) => any) {
        super()
        this.behaviour = behaviour
        this.precedence = precedence
        this.rightAssociative = rightAssociative
    }
}

export class CalcMacroFunction extends CalcVariableValue  {
    public readonly macroBehaviour: (...args: AstNode[]) => any

    public constructor(behaviour: (...args: AstNode[]) => any) {
        super()
        this.macroBehaviour = behaviour
    }
}

export class CalcMacroOperator extends CalcVariableValue  {
    public readonly macroBehaviour: (left: AstNode, right: AstNode) => any
    public readonly precedence: number = 0
    public readonly rightAssociative: boolean = false

    public constructor(precedence: number, rightAssociative: boolean, behaviour: (left: AstNode, right: AstNode) => any) {
        super()
        this.macroBehaviour = behaviour
        this.precedence = precedence
        this.rightAssociative = rightAssociative
    }
}

export class CalcUnaryOperator extends CalcVariableValue  {
    public readonly behaviour: (arg: any) => any

    public constructor(behaviour: (right: any) => any) {
        super()
        this.behaviour = behaviour
    }
}

export class CalcMacroUnaryOperator extends CalcVariableValue {
    public readonly macroBehaviour: (arg: AstNode) => any

    public constructor(macroBehaviour: (right: AstNode) => any) {
        super()
        this.macroBehaviour = macroBehaviour
    }
}

export function calcVariableValueToString(varVal: CalcVariableValue): string {
    if (varVal instanceof CalcValue) { return "a variable" }
    else if (varVal instanceof CalcOperator) { return "an operator" }
    else if (varVal instanceof CalcUnaryOperator) { return "a unary operator" }
    else if (varVal instanceof CalcFunction) { return "a function" }
    else if (varVal instanceof CalcMacroOperator) { return "a macro operator" }
    else if (varVal instanceof CalcMacroFunction) { return "a macro function" }
    else if (varVal instanceof CalcMacroUnaryOperator) { return "a macro unary operator" }
    else { return "an unknown value" }
}

export default class CalcEnvironment {
    private stack: Array<Map<string, CalcVariableValue>> = [new Map()]
    private definitionHandler: (name: string, value: CalcVariableValue) => void = null

    public define(name: string, value: CalcVariableValue): void {
        if (value instanceof CalcUnaryOperator) {
            const currentValue = this.lookup(name)
            if (currentValue && currentValue instanceof CalcOperator) {
                currentValue.unaryVersion = value
            }
            else {
                this.stack[this.stack.length - 1].set(name, value)
            }
        }
        else {
            this.stack[this.stack.length - 1].set(name, value)
        }

        if (this.definitionHandler) {
            this.definitionHandler(name, value)
        }
    }

    public lookup(name: string): CalcVariableValue {
        const local = this.stack[this.stack.length - 1].get(name)
        if (local !== undefined) { return local }
        const global = this.stack[0].get(name)
        if (global !== undefined) { return global }
    }

    public pushScope(inherit: boolean = false): void {
        if (inherit) {
            this.stack.push(new Map(this.stack[this.stack.length - 1]))
        }
        else {
            this.stack.push(new Map())
        }
    }

    public popScope(): Map<string, CalcVariableValue> {
        return this.stack.pop()
    }

    public getLowerScope(): Map<string, CalcVariableValue> {
        return this.stack[this.stack.length > 1 ? this.stack.length - 2 : 0]
    }

    public saveScope(): Map<string, CalcVariableValue> {
        return new Map(this.stack[this.stack.length - 1])
    }

    public restoreScope(scope: Map<string, CalcVariableValue>): void {
        this.stack.push(new Map(scope))
    }

    public onDefinition(handler: (name: string, value: CalcVariableValue) => void): void {
        this.definitionHandler = handler
    }

    public get allValues(): Array<[string, CalcVariableValue]> {
        return ([] as Array<[string, CalcVariableValue]>).concat(...this.stack.map(s => Array.from(s)))
    }

    public get operators(): Array<[string, CalcOperator]> {
        return this.allValues.filter(x => x[1] instanceof CalcOperator) as Array<[string, CalcOperator]>
    }

    public get operatorsAndMacroOperators(): Array<[string, CalcOperator | CalcMacroOperator]> {
        return this.allValues.filter(x => x[1] instanceof CalcOperator || x[1] instanceof CalcMacroOperator) as Array<[string, CalcOperator | CalcMacroOperator]>
    }

    public get functions(): Array<[string, CalcFunction]> {
        return this.allValues.filter(x => x[1] instanceof CalcFunction) as Array<[string, CalcFunction]>
    }
}
