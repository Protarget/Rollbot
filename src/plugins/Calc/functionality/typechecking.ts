export function expect<FN extends (...args: any[]) => any>(expectedTypes: Array<string | string[]>, fn: FN): FN {
    return ((...args: any[]) => {
        if (args.length === expectedTypes.length) {
            for (let index = 0; index < args.length; index++) {
                if (Array.isArray(expectedTypes[index])) {
                    const argMatch = expectedTypes[index] === "any" || (expectedTypes[index] as string[]).find(v => v === typeof(args[index]))
                    if (!argMatch) {
                        throw new Error("Argument type mismatch: expected " + (expectedTypes[index] as string[]).join(" or ") + " but got " + typeof(args[index]))
                    }
                }
                else if (typeof(args[index]) !== expectedTypes[index]) {
                    throw new Error("Argument type mismatch: expected " + expectedTypes[index] + " but got " + typeof(args[index]))
                }
            }
            return fn(...args)
        }
        else {
            throw new Error("Argument count mismatch: expected " + expectedTypes.length + " but got " + args.length)
        }
    }) as any as FN
}
