import { CalcFunction, CalcOperator, CalcUnaryOperator, CalcValue } from "../CalcEnvironment"
import CalcInterpreter from "../CalcInterpreter"
import { expect } from "./typechecking"

export default function defineArithmetic(interpreter: CalcInterpreter): void {
    interpreter.defineHelp("+", "Operator: Add together two numbers or strings (e.g '5 + 5' or '\"ass\" + \"ass\"')")
    interpreter.environment.define("+", new CalcOperator(1, false, expect([["number", "string"], ["number", "string"]], (x, y) => x + y)))

    interpreter.defineHelp("-", "Operator: Subtract two numbers (e.g '8 - 2')")
    interpreter.environment.define("-", new CalcOperator(1, false, expect(["number", "number"], (x, y) => x - y)))

    interpreter.defineHelp("*", "Operator: Multiply two numbers (e.g '2 * 4')")
    interpreter.environment.define("*", new CalcOperator(2, false, expect(["number", "number"], (x, y) => x * y)))

    interpreter.defineHelp("/", "Operator: Divide two numbers (e.g '2 / 4')")
    interpreter.environment.define("/", new CalcOperator(2, false, expect(["number", "number"], (x, y) => x / y)))

    interpreter.defineHelp("^", "Operator: Raise one number to the power of another (e.g '2 ^ 4')")
    interpreter.environment.define("^", new CalcOperator(3, true, expect(["number", "number"], (x, y) => Math.pow(x, y))))

    interpreter.defineHelp("==", "Operator: Determine if two values are equal, and produce 1 if they are and 0 otherwise (e.g '2 == 2' or '2 == X')")
    interpreter.environment.define("==", new CalcOperator(1, false, (x, y) => (x === y ? 1 : 0)))

    interpreter.defineHelp("!=", "Operator: Return 1 if the two values are not equal, and 0 otherwise (e.g '2 == 2' or '2 == X')")
    interpreter.environment.define("!=", new CalcOperator(1, false, (x, y) => (x !== y ? 1 : 0)))

    interpreter.defineHelp(">", "Operator: Return 1 if the first number is greater than the second, or 0 otherwise (e.g '2 > 1')")
    interpreter.environment.define(">", new CalcOperator(1, false, expect(["number", "number"], (x, y) => (x > y ? 1 : 0))))

    interpreter.defineHelp("<", "Operator: Return 1 if the first number is less than than the second, or 0 otherwise (e.g '1 < 2')")
    interpreter.environment.define("<", new CalcOperator(1, false, expect(["number", "number"], (x, y) => (x < y ? 1 : 0))))

    interpreter.defineHelp(">=", "Operator: Return 1 if the first value is greater than or equal to the second, or 0 otherwise (e.g '2 >= 1')")
    interpreter.environment.define(">=", new CalcOperator(1, false, expect(["number", "number"], (x, y) => (x >= y ? 1 : 0))))

    interpreter.defineHelp("<=", "Operator: Return 1 if the first value is less than or equal to the second, or 0 otherwise (e.g '1 <= 2')")
    interpreter.environment.define("<=", new CalcOperator(1, false, expect(["number", "number"], (x, y) => (x <= y ? 1 : 0))))

    interpreter.defineHelp("sin", "Function: Return the sine function applied to the argument (e.g 'sin(5)')")
    interpreter.environment.define("sin", new CalcFunction(expect(["number"], x => Math.sin(x))))

    interpreter.defineHelp("cos", "Function: Return the cosine function applied to the argument (e.g 'cos(5)')")
    interpreter.environment.define("cos", new CalcFunction(expect(["number"], x => Math.cos(x))))

    interpreter.defineHelp("tan", "Function: Return the tangent function applied to the argument (e.g 'tan(5)')")
    interpreter.environment.define("tan", new CalcFunction(expect(["number"], x => Math.tan(x))))

    interpreter.defineHelp("asin", "Function: Return the inverse sine function applied to the argument (e.g 'asin(5)')")
    interpreter.environment.define("asin", new CalcFunction(expect(["number"], x => Math.asin(x))))

    interpreter.defineHelp("acos", "Function: Return the inverse cosine function applied to the argument (e.g 'acos(5)')")
    interpreter.environment.define("acos", new CalcFunction(expect(["number"], x => Math.acos(x))))

    interpreter.defineHelp("atan", "Function: Return the inverse tangent function applied to the argument (e.g 'atan(5)')")
    interpreter.environment.define("atan", new CalcFunction(expect(["number"], x => Math.atan(x))))

    interpreter.defineHelp("sqrt", "Function: Return the square root of the argument (e.g 'sqrt(5)')")
    interpreter.environment.define("sqrt", new CalcFunction(expect(["number"], x => Math.sqrt(x))))

    interpreter.defineHelp("abs", "Function: Return the absolute value of the argument (the input number with the sign removed) (e.g 'abs(5)')")
    interpreter.environment.define("abs", new CalcFunction(expect(["number"], x => Math.abs(x))))

    interpreter.defineHelp("max", "Function: Return the larger of the two arguments (e.g 'max(1, 2)')")
    interpreter.environment.define("max", new CalcFunction(expect(["number", "number"], (x, y) => Math.max(x, y))))

    interpreter.defineHelp("min", "Function: Return the smaller of the two arguments (e.g 'min(1, 2)')")
    interpreter.environment.define("min", new CalcFunction(expect(["number", "number"], (x, y) => Math.min(x, y))))

    interpreter.defineHelp("floor", "Function: Return the argument rounded down to the nearest integer (e.g 'floor(5.5)')")
    interpreter.environment.define("floor", new CalcFunction(expect(["number"], x => Math.floor(x))))

    interpreter.defineHelp("ceil", "Function: Return the argument rounded up to the nearest integer (e.g 'ceil(5.5)')")
    interpreter.environment.define("ceil", new CalcFunction(expect(["number"], x => Math.ceil(x))))

    interpreter.defineHelp("integer", "Function: Return the argument rounded to the nearest integer (e.g 'integer(5.5)')")
    interpreter.environment.define("integer", new CalcFunction(expect(["number"], (x) => Math.round(x))))

    interpreter.defineHelp("round", "Function: Return the first argument rounded to the second argument decimal places (e.g 'round(1.2345, 2)')")
    interpreter.environment.define("round", new CalcFunction(expect(["number", "number"], (x, y) => parseFloat(x.toFixed(y)))))

    interpreter.environment.define("-", new CalcUnaryOperator(expect(["number"], x => -x)))

    interpreter.defineHelp("pi", "Constant: Its PI you fool")
    interpreter.environment.define("pi", new CalcValue(Math.PI))
}
