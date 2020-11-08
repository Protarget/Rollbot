import Bot from "../../Bot"
import CommandPlugin from "../CommandPlugin"
import CalcEnvironment, { CalcFunction, CalcMacroFunction, CalcMacroOperator, CalcMacroUnaryOperator, CalcOperator, CalcUnaryOperator, CalcValue } from "./CalcEnvironment"
import CalcInterpreter from "./CalcInterpreter"
import { AstName, AstNode, isAstFunctionCall, isAstName } from "./CalcParser"
import defineArithmetic from "./functionality/arithmetic"
import defineArrays from "./functionality/arrays"
import defineMacros from "./functionality/macros"

export default class Calc extends CommandPlugin {
    private interpreter: CalcInterpreter = new CalcInterpreter()

    public constructor() {
        super()
        defineArithmetic(this.interpreter)
        defineArrays(this.interpreter)
        defineMacros(this.interpreter)

        this.register("!c", this.calc.bind(this))
    }

    private calc(from: string, args: string[], original: string): void {
        try {
            if (args.length === 0) {
                this.bot.sayToAll("Use '!c help' to get a list of operators and functions, and '!c help <TOPIC>' for help on a specific topic")
            }
            else if (args.length > 0 && args[0] === "help") {
                this.help(from, args.slice(1), original)
            }
            else if (args.length > 0 && args[0] === "parse") {
                this.pretty(from, args.slice(1), args.slice(1).join(" "))
            }
            else {
                this.interpreter.environment.define("user", new CalcValue(from))
                const result = this.interpreter.run(original)
                if (result !== null && result !== undefined) {
                    this.bot.sayToAll(this.prettyResult(result))
                }
            }
        }
        catch (e) {
            this.bot.sayToAll(e.toString())
        }
    }

    private pretty(from: string, args: string[], original: string): void {
        try {
            const result = this.interpreter.pretty(original)
            this.bot.sayToAll(result)
        }
        catch (e) {
            this.bot.sayToAll(e.toString())
        }
    }

    private help(from: string, args: string[], original: string): void {
        try {
            if (args.length === 0) {
                this.bot.sayToAll("Available help entries: " + this.interpreter.helpEntries.join(" "))
            }
            else {
                for (const arg of args) {
                    const entry = this.interpreter.help(arg.trim())
                    this.bot.sayToAll(entry)
                }
            }
        }
        catch (e) {
            this.bot.sayToAll(e.toString())
        }
    }

    private prettyResult(result: any): string {
        if (Array.isArray(result)) {
            return `[${result.map(x => this.prettyResult(x)).join(", ")}]`
        }
        else if (result instanceof CalcFunction) {
            return "<function>"
        }
        else if (result instanceof CalcOperator) {
            return "<operator>"
        }
        else if (result instanceof CalcMacroFunction) {
            return "<macro function>"
        }
        else if (result instanceof CalcMacroOperator) {
            return "<macro operator>"
        }
        else if (result instanceof CalcValue) {
            return `<boxed value: ${this.prettyResult(result.value)}>`
        }
        else {
            return result.toString()
        }
    }
}
