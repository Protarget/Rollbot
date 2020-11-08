import CalcEnvironment, { CalcFunction, CalcMacroFunction, CalcMacroOperator, CalcOperator, CalcValue } from "../CalcEnvironment"
import CalcInterpreter from "../CalcInterpreter"
import { AstName, AstNode, isAstFunctionCall, isAstName, isAstOperator } from "../CalcParser"

export default function defineMacros(interpreter: CalcInterpreter): void {
    interpreter.defineHelp("=", "Macro Operator: Perform an assignment, setting the symbol on the left equal to the value on the right\nin the form 'x = 32', the value of the variable 'x' is set to 32\nin the form 'f(x, y) = x + y', a custom function is created with the arguments x and y bound to the input of the function")
    interpreter.environment.define("=", new CalcMacroOperator(0, false, (left: AstNode, right: AstNode) => {
        if (isAstName(left)) {
            const result = interpreter.evaluateAst(right)
            if (result instanceof CalcFunction) {
                interpreter.environment.define(left.value, result)
            }
            else {
                interpreter.environment.define(left.value, new CalcValue(result))
            }

        }
        else if (isAstFunctionCall(left)) {
            if (left.arguments.every(isAstName)) {
                const scope = interpreter.environment.saveScope()
                interpreter.environment.define(left.name.value, new CalcFunction((...args: any[]) => {
                    if (args.length !== left.arguments.length) {
                        throw new Error("Argument count mismatch: expected " + left.arguments.length + " but got " + args.length)
                    }
                    interpreter.environment.restoreScope(scope)
                    try {
                        for (let argIndex = 0; argIndex < args.length; argIndex++) {
                            const argName: AstName = left.arguments[argIndex] as AstName
                            interpreter.environment.define(argName.value, new CalcValue(args[argIndex]))
                        }
                        const result = interpreter.evaluateAst(right)
                        interpreter.environment.popScope()
                        return result
                    }
                    catch (e) {
                        interpreter.environment.popScope()
                        throw e
                    }
                }))
            }
            else {
                throw new Error("All arguments of defined function must be names")
            }
        }
        else if (isAstOperator(left)) {
            if (isAstName(left.left) && isAstName(left.right)) {
                const scope = interpreter.environment.saveScope()
                interpreter.environment.define(left.symbol.value, new CalcOperator(0, false, (opl: any, opr: any) => {
                    interpreter.environment.restoreScope(scope)
                    try {
                        const leftName = left.left as AstName
                        const rightName = left.right as AstName
                        interpreter.environment.define(leftName.value, new CalcValue(opl))
                        interpreter.environment.define(rightName.value, new CalcValue(opr))
                        const result = interpreter.evaluateAst(right)
                        interpreter.environment.popScope()
                        return result
                    }
                    catch (e) {
                        interpreter.environment.popScope()
                        throw e
                    }
                }))
            }
            else {
                throw new Error("Left and right of defined operator must be names")
            }
        }
        else {
            throw new Error("Assignment failure")
        }
    }))

    interpreter.environment.define(":=:", new CalcMacroOperator(0, false, (left: AstNode, right: AstNode) => {
        if (isAstFunctionCall(left) && left.arguments.every(isAstName)) {
            const scope = interpreter.environment.saveScope()
            interpreter.environment.define(left.name.value, new CalcMacroFunction((...args: AstNode[]) => {
                if (args.length !== left.arguments.length) {
                    throw new Error("Argument count mismatch: expected " + left.arguments.length + " but got " + args.length)
                }
                interpreter.environment.restoreScope(scope)
                try {
                    for (let argIndex = 0; argIndex < args.length; argIndex++) {
                        const argName: AstName = left.arguments[argIndex] as AstName
                        interpreter.environment.define(argName.value, new CalcValue(args[argIndex]))
                    }
                    const result = interpreter.evaluateAst(right)
                    interpreter.environment.popScope()
                    return result
                }
                catch (e) {
                    interpreter.environment.popScope()
                    throw e
                }
            }))
        }
        else if (isAstOperator(left) && isAstName(left.left) && isAstName(left.right)) {
            const scope = interpreter.environment.saveScope()
            interpreter.environment.define(left.symbol.value, new CalcMacroOperator(0, false, (opl: AstNode, opr: AstNode) => {
                interpreter.environment.restoreScope(scope)
                try {
                    const leftName = left.left as AstName
                    const rightName = left.right as AstName
                    interpreter.environment.define(leftName.value, new CalcValue(opl))
                    interpreter.environment.define(rightName.value, new CalcValue(opr))
                    const result = interpreter.evaluateAst(right)
                    interpreter.environment.popScope()
                    return result
                }
                catch (e) {
                    interpreter.environment.popScope()
                    throw e
                }
            }))
        }
        else {
            throw new Error("Left hand of :=: must be a function definition or operator definition")
        }
    }))

    interpreter.environment.define("eval", new CalcFunction((arg: AstNode) => {
        return interpreter.evaluateAst(arg)
    }))

    interpreter.environment.define("error", new CalcFunction((arg: any) => {
        throw new Error(arg)
    }))

    interpreter.environment.define("astname", new CalcFunction((arg: AstNode) => {
        if (isAstName(arg)) {
            return arg.value
        }
        else {
            throw new Error("'name' macro expected AST Name")
        }
    }))

    interpreter.environment.define("define", new CalcFunction((left: string, right: any) => {
        interpreter.environment.getLowerScope().set(left, new CalcValue(right))
        return right
    }))

    interpreter.defineHelp("lambda", "Macro Function: Create an anonymous function. for example, lambda(x, x * 2) returns a function that takes one argument and multiplies it by two")
    interpreter.environment.define("lambda", new CalcMacroFunction((...lambdaArgs: AstNode[]) => {
        const argNames: AstName[] = []

        if (lambdaArgs.length === 0) {
            throw new Error("Must specify parameters to lambda")
        }

        for (let i = 0; i < lambdaArgs.length - 1; i++) {
            if (!isAstName(lambdaArgs[i])) {
                throw new Error("Lambda expected parameters on left")
            }
            else {
                argNames.push(lambdaArgs[i] as AstName)
            }
        }

        const scope = interpreter.environment.saveScope()

        return new CalcFunction((...args: any[]) => {
            if (args.length !== argNames.length) {
                throw new Error("Argument count mismatch: expected " + argNames.length + " but got " + args.length)
            }
            interpreter.environment.restoreScope(scope)
            try {
                for (let argIndex = 0; argIndex < args.length; argIndex++) {
                    const argName: AstName = argNames[argIndex] as AstName
                    interpreter.environment.define(argName.value, new CalcValue(args[argIndex]))
                }
                const result = interpreter.evaluateAst(lambdaArgs[lambdaArgs.length - 1])
                interpreter.environment.popScope()
                return result
            }
            catch (e) {
                interpreter.environment.popScope()
                throw e
            }
        })
    }))

    interpreter.defineHelp("if", "Macro Function: if the first argument is 'truthy' (not 0, not an empty string), evaluate and return the expression in the second argument. otherwise, evaluate and return the expression in the third argument\nif(x > 2, \"X is greater than two\", \"X is less than two\")")
    interpreter.environment.define("if", new CalcMacroFunction((x, y, z) => {
        const condition = interpreter.evaluateAst(x)
        const conditionMet = Array.isArray(condition) ? condition.every(Boolean) : Boolean(condition)
        if (conditionMet) {
            return interpreter.evaluateAst(y)
        }
        else {
            return interpreter.evaluateAst(z)
        }
    }))

    interpreter.defineHelp("let", "Macro Function: Allows locally-scoped declarations that apply to a block in the same scope")
    interpreter.environment.define("let", new CalcMacroFunction((...args) => {
        interpreter.environment.pushScope(true)
        let last = 0
        try {
            for (const a of args) {
                last = interpreter.evaluateAst(a)
            }
            interpreter.environment.popScope()
            return last
        }
        catch (e) {
            interpreter.environment.popScope()
            throw e
        }
    }))
}
