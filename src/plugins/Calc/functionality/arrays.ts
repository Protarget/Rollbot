import {  CalcFunction, CalcOperator } from "../CalcEnvironment"
import CalcInterpreter from "../CalcInterpreter"
import { expect } from "./typechecking"

export default function defineArrays(interpreter: CalcInterpreter): void {

    interpreter.defineHelp(":", "Operator: Merge the values on the left with the values on the right to form an array (e.g '1 : 2', '[1, 2] : 3', '1 : [2, 3]', '[1, 2] : [3, 4]')")
    interpreter.environment.define(":", new CalcOperator(1, false, (x, y) => {
        const lArray = Array.isArray(x)
        const rArray = Array.isArray(y)
        if (lArray && rArray) {
            return x.concat(y)
        }
        else if (lArray && !rArray) {
            return x.concat([y])
        }
        else if (!lArray && rArray) {
            return [x].concat(y)
        }
        else {
            return [x, y]
        }
    }))

    interpreter.defineHelp("@", "Operator: Retrieve the value from the string or array on the left at the index (or array of indices) on the right (e.g '[1, 2, 3] @ 1', '[1, 2] @ [0, 1]', '\"hello\" @ 1')")
    interpreter.environment.define("@", new CalcOperator(10, false, expect([["object", "string"], ["object", "number"]], (x, y) => {
        if (!Array.isArray(y)) {
            if (Array.isArray(x)) {
                return x[y]
            }
            else if (typeof(x) === "string") {
                return x[y]
            }
            else {
                return x
            }
        }
        else {
            if (Array.isArray(x)) {
                return y.map(v => x[v])
            }
            else if (typeof(x) === "string") {
                return y.map(v => x[v])
            }
            else {
                return y.map(v => x)
            }
        }
    })))

    interpreter.defineHelp("@!", "Operator: Return the array ro string with the value at the specified index (or array of indices) removed (e.g. '[1, 2, 3] @! 1', '[1, 2, 3]' @! [1, 2]', '\"hello\" @! 1)")
    interpreter.environment.define("@!", new CalcOperator(10, false, expect([["object", "string"], ["object", "number"]], (x, y) => {
        if (!Array.isArray(y)) {
            if (Array.isArray(x)) {
                const clonedArray = [...x]
                clonedArray.splice(y, 1)
                return clonedArray
            }
            else if (typeof(x) === "string") {
                return x.substring(0, y) + x.substring(y + 1)
            }
            else {
                return x
            }
        }
        else {
            const sorted = Array.from(new Set(y.map(Math.floor))).sort()
            if (Array.isArray(x)) {
                const clonedArray = [...x]
                for (let index = sorted.length - 1; index >= 0; index--) {
                    clonedArray.splice(sorted[index], 1)
                }
                return clonedArray
            }
            else if (typeof(x) === "string") {
                for (let index = sorted.length - 1; index >= 0; index--) {
                    x = x.substring(0, sorted[index]) + x.substring(sorted[index] + 1)
                }
                return x
            }
            else {
                return x
            }
        }
    })))

    interpreter.defineHelp("range", "Function: Generate an array containing the range of values from the first argument to the second (e.g 'range(1, 10)')")
    interpreter.environment.define("range", new CalcFunction(expect(["number", "number"], (x, y) => {
        const result = []
        for (let v = Math.min(x, y); v <= Math.max(x, y); v++) {
            result.push(v)
        }
        return result
    })))

    interpreter.defineHelp("map", "Function: Take a function as the first argument and apply it to every element of the second argument '(e.g 'map(sin, [1, 2, 3, 4])')")
    interpreter.environment.define("map", new CalcFunction((x, y) => {
        if (x instanceof CalcFunction) {
            if (Array.isArray(y)) {
                return y.map(n => x.behaviour(n))
            }
            else {
                return x.behaviour(y)
            }
        }
        else {
            throw new Error("Left argument of 'map' must be function")
        }
    }))

    interpreter.defineHelp("fold", "Function: Take a function as the first argument and apply it repeatedly to elements in the array.\nFor example, fold(add, [1, 2, 3, 4]) is equivalent to add(add(add(1, 2), 3), 4)\n'(e.g 'fold(lambda(x, x + y), [1, 2, 3, 4])')")
    interpreter.environment.define("fold", new CalcFunction((x, y, z) => {
        if (!(x instanceof CalcFunction)) {
            throw new Error("Left argument of 'fold' must be function")
        }

        let seed = z
        if ((seed === undefined || seed === null) && (Array.isArray(y) && y.length > 0 || !Array.isArray(y))) {
            if (Array.isArray(y)) {
                seed = y[0]
            }
            else {
                seed = y
            }
        }
        else {
            throw new Error("Fold over empty array requires seed")
        }

        if (Array.isArray(y)) {
            return y.reduce((a, b) => x.behaviour(a, b))
        }
        else {
            if (z === undefined || z === null) {
                return seed
            }
            else {
                return x.behaviour(seed, x)
            }
        }
    }))

    interpreter.defineHelp("zip", "Function: Take a function as the first argument and apply it to merge together either two arrays of the same length, two scalars, or one scalar and one array.\nFor example, zip(add, [1, 2, 3, 4], [5, 6, 7, 8]) is equivalent to [add(1, 5), add(2, 6), add(3, 7), add(4, 8)]\nzip(add, [1, 2, 3, 4], 5) is equivalent to [add(1, 5), add(2, 5), add(3, 5), add(4, 5)]\nzip(add, 1, 2) is equivalent to add(1, 2)")
    interpreter.environment.define("zip", new CalcFunction((x, y, z) => {
        if (!(x instanceof CalcFunction)) {
            throw new Error("Left argument of 'zip' must be function")
        }

        if (Array.isArray(y) && Array.isArray(z)) {
            if (y.length !== z.length) {
                throw new Error("Both array arguments of 'zip' must be of same length")
            }
            const result = []
            for (let index = 0; index < y.length; index++) {
                result.push(x.behaviour(y[index], z[index]))
            }
            return result
        }
        else if (Array.isArray(y)) {
            return y.map(v => x.behaviour(v, z))
        }
        else if (Array.isArray(z)) {
            return z.map(v => x.behaviour(y, v))
        }
        else {
            return x.behaviour(y, z)
        }

    }))

    interpreter.defineHelp("repeat", "Function: Create an array of the second argument repeated X times, where X is the value of the first argument. (e.g 'repeat(5, 10)')")
    interpreter.environment.define("repeat", new CalcFunction(expect(["number", "any"], (x, y) => new Array(x).fill(y))))

    interpreter.defineHelp("length", "Function: Return the length of the array or string argument (e.g 'length([1, 2, 3, 4])', 'length(\"ass\")')")
    interpreter.environment.define("length", new CalcFunction(expect([["object", "string"]], x => x.length)))

    interpreter.defineHelp("sample", "Function: Return a random sample from the array argument (e.g 'sample([1, 2, 3])')")
    interpreter.environment.define("sample", new CalcFunction(expect(["object"], x => x[Math.floor(Math.random() * x.length)])))

    interpreter.defineHelp("join", "Function: Convert all values in the first argument (an array) into strings, and then concatenate them together, seperated by the second argument (a string) (e.g 'join([1, 2, 3], \", \")')")
    interpreter.environment.define("join", new CalcFunction(expect(["object", "string"], (x, y) => x.join(y))))

    interpreter.defineHelp("sum", "Function: Take the sum of an array (e.g 'sum([1, 2, 3])'")
    interpreter.environment.define("sum", new CalcFunction(expect(["object"], x => x.reduce((a, b) => a + b, 0))))
}
