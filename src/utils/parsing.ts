
function highlightTextSection(text: string, from: number, to: number): string {
    return text.substring(0, from) + "\x0300,04" + text.substring(from, to + 1) + "\x0F" + text.substring(to + 1)
}

export function stringifyFailure(originalMessage: string, failure: ParserFailure<any, any>): string {
    let result = "Parse failure: "
    if (failure.index !== undefined) {
        result += highlightTextSection(originalMessage, failure.index, failure.index)
    }
    return result
}

interface ParserResult<I, O> {
    success: boolean
}

interface ParserSuccess<I, O> extends ParserResult<I, O> {
    success: true
    value: O
    newState: ParserState<I>
}

interface ParserFailure<I, O> extends ParserResult<I, O> {
    success: false
    index?: number
}

export function isSuccess<I, O>(result: ParserResult<I, O>): result is ParserSuccess<I, O> {
    return result.success
}

export function isFailure<I, O>(result: ParserResult<I, O>): result is ParserFailure<I, O> {
    return !result.success
}

export function succeed<I, O>(value: O, newState: ParserState<I>): ParserSuccess<I, O> {
    return {success: true, value, newState}
}

export function fail<I, O>(index: number = 0): ParserFailure<I, O> {
    return {success: false, index}
}

export class ParserState<I> {
    private readonly stream: I[]
    private readonly index: number

    public constructor(stream: I[], index: number) {
        this.stream = stream
        this.index = index
    }

    public peek(n: number = 0): I {
        return this.stream[this.index + n]
    }

    public consume(): ParserState<I> {
        return new ParserState(this.stream, this.index + 1)
    }

    public rewind(): ParserState<I> {
        return new ParserState(this.stream, this.index - 1)
    }

    public get currentIndex(): number {
        return this.index
    }
}

export type Parser<I, O> = (state: ParserState<I>) => ParserResult<I, O>

// Represents a terminal value in the grammar
export function tokens<T>(...values: T[]): Parser<T, T> {
    return (state: ParserState<T>) => {
        const token = state.peek()
        const match = values.find(x => x === token)
        if (match !== undefined) {
            return succeed(match, state.consume())
        }
        else {
            return fail(state.currentIndex)
        }
    }
}

export function transform<I, O1, O2>(parser: Parser<I, O1>, fn1: (x: O1) => O2): Parser<I, O2>
export function transform<I, O1, O2, O3>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3): Parser<I, O3>
export function transform<I, O1, O2, O3, O4>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4): Parser<I, O4>
export function transform<I, O1, O2, O3, O4, O5>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5): Parser<I, O5>
export function transform<I, O1, O2, O3, O4, O5, O6>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6): Parser<I, O6>
export function transform<I, O1, O2, O3, O4, O5, O6, O7>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7): Parser<I, O7>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8): Parser<I, O8>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9): Parser<I, O9>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10): Parser<I, O10>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11): Parser<I, O11>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12): Parser<I, O12>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13): Parser<I, O13>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14): Parser<I, O14>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15): Parser<I, O15>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16): Parser<I, O16>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17): Parser<I, O17>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18): Parser<I, O18>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19): Parser<I, O19>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20): Parser<I, O20>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21): Parser<I, O21>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22): Parser<I, O22>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23): Parser<I, O23>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24): Parser<I, O24>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25): Parser<I, O25>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26): Parser<I, O26>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26, fn26: (x: O26) => O27): Parser<I, O27>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26, fn26: (x: O26) => O27, fn27: (x: O27) => O28): Parser<I, O28>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26, fn26: (x: O26) => O27, fn27: (x: O27) => O28, fn28: (x: O28) => O29): Parser<I, O29>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26, fn26: (x: O26) => O27, fn27: (x: O27) => O28, fn28: (x: O28) => O29, fn29: (x: O29) => O30): Parser<I, O30>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30, O31>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26, fn26: (x: O26) => O27, fn27: (x: O27) => O28, fn28: (x: O28) => O29, fn29: (x: O29) => O30, fn30: (x: O30) => O31): Parser<I, O31>
export function transform<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30, O31, O32>(parser: Parser<I, O1>, fn1: (x: O1) => O2, fn2: (x: O2) => O3, fn3: (x: O3) => O4, fn4: (x: O4) => O5, fn5: (x: O5) => O6, fn6: (x: O6) => O7, fn7: (x: O7) => O8, fn8: (x: O8) => O9, fn9: (x: O9) => O10, fn10: (x: O10) => O11, fn11: (x: O11) => O12, fn12: (x: O12) => O13, fn13: (x: O13) => O14, fn14: (x: O14) => O15, fn15: (x: O15) => O16, fn16: (x: O16) => O17, fn17: (x: O17) => O18, fn18: (x: O18) => O19, fn19: (x: O19) => O20, fn20: (x: O20) => O21, fn21: (x: O21) => O22, fn22: (x: O22) => O23, fn23: (x: O23) => O24, fn24: (x: O24) => O25, fn25: (x: O25) => O26, fn26: (x: O26) => O27, fn27: (x: O27) => O28, fn28: (x: O28) => O29, fn29: (x: O29) => O30, fn30: (x: O30) => O31, fn31: (x: O31) => O32): Parser<I, O32>
export function transform(parser: any, ...fns: any[]): any {
    return (state: ParserState<any>) => {
        const result = parser(state)
        if (isSuccess(result)) {
            let value = result.value
            for (const fn of fns) {
                value = fn(value)
            }
            return succeed(value, result.newState)
        }
        else {
            return result
        }
    }
}

export function oneOf<I, O>(...parsers: Array<Parser<I, O>>): Parser<I, O> {
    return (state: ParserState<I>) => {
        for (const parser of parsers) {
            const result = parser(state)
            if (isSuccess(result)) {
                return result
            }
        }
        return fail(state.currentIndex)
    }
}

export function oneOrMore<I, O>(parser: Parser<I, O>): Parser<I, O[]> {
    return (state: ParserState<I>) => {
        const finalValue: O[] = []
        while (true) {
            const result = parser(state)
            if (isSuccess(result)) {
                finalValue.push(result.value)
                state = result.newState
            } else if (finalValue.length === 0) {
                return fail(state.currentIndex)
            }
            else {
                break
            }
        }
        return succeed(finalValue, state)
    }
}

export function zeroOrMore<I, O>(parser: Parser<I, O>): Parser<I, O[]> {
        return (state: ParserState<I>) => {
        const finalValue: O[] = []
        while (true) {
            const result = parser(state)
            if (isSuccess(result)) {
                finalValue.push(result.value)
                state = result.newState
            }
            else {
                break
            }
        }
        return succeed(finalValue, state)
    }
}

export function zeroOrOne<I, O>(parser: Parser<I, O>): Parser<I, O[]> {
        return (state: ParserState<I>) => {
        const finalValue: O[] = []
        const result = parser(state)
        if (isSuccess(result)) {
            return succeed([result.value], result.newState)
        }
        else {
            return succeed([], state)
        }
    }
}

export function sequence<I, O1>(p1: Parser<I, O1>): Parser<I, [O1]>
export function sequence<I, O1, O2>(p1: Parser<I, O1>, p2: Parser<I, O2>): Parser<I, [O1, O2]>
export function sequence<I, O1, O2, O3>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>): Parser<I, [O1, O2, O3]>
export function sequence<I, O1, O2, O3, O4>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>): Parser<I, [O1, O2, O3, O4]>
export function sequence<I, O1, O2, O3, O4, O5>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>): Parser<I, [O1, O2, O3, O4, O5]>
export function sequence<I, O1, O2, O3, O4, O5, O6>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>): Parser<I, [O1, O2, O3, O4, O5, O6]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>): Parser<I, [O1, O2, O3, O4, O5, O6, O7]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>, p27: Parser<I, O27>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>, p27: Parser<I, O27>, p28: Parser<I, O28>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>, p27: Parser<I, O27>, p28: Parser<I, O28>, p29: Parser<I, O29>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>, p27: Parser<I, O27>, p28: Parser<I, O28>, p29: Parser<I, O29>, p30: Parser<I, O30>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30, O31>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>, p27: Parser<I, O27>, p28: Parser<I, O28>, p29: Parser<I, O29>, p30: Parser<I, O30>, p31: Parser<I, O31>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30, O31]>
export function sequence<I, O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30, O31, O32>(p1: Parser<I, O1>, p2: Parser<I, O2>, p3: Parser<I, O3>, p4: Parser<I, O4>, p5: Parser<I, O5>, p6: Parser<I, O6>, p7: Parser<I, O7>, p8: Parser<I, O8>, p9: Parser<I, O9>, p10: Parser<I, O10>, p11: Parser<I, O11>, p12: Parser<I, O12>, p13: Parser<I, O13>, p14: Parser<I, O14>, p15: Parser<I, O15>, p16: Parser<I, O16>, p17: Parser<I, O17>, p18: Parser<I, O18>, p19: Parser<I, O19>, p20: Parser<I, O20>, p21: Parser<I, O21>, p22: Parser<I, O22>, p23: Parser<I, O23>, p24: Parser<I, O24>, p25: Parser<I, O25>, p26: Parser<I, O26>, p27: Parser<I, O27>, p28: Parser<I, O28>, p29: Parser<I, O29>, p30: Parser<I, O30>, p31: Parser<I, O31>, p32: Parser<I, O32>): Parser<I, [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15, O16, O17, O18, O19, O20, O21, O22, O23, O24, O25, O26, O27, O28, O29, O30, O31, O32]>
export function sequence<I, O>(...parsers: Array<Parser<I, O>>): Parser<I, O[]>
export function sequence(...parsers: Array<Parser<any, any>>): Parser<any, any[]> {
        return (state: ParserState<any>) => {
        const finalValue: any[] = []
        for (const parser of parsers) {
            const result = parser(state)
            if (isSuccess(result)) {
                finalValue.push(result.value)
                state = result.newState
            }
            else {
                return result
            }
        }
        return succeed(finalValue, state)
    }
}

export function seperatedBy<I, O>(seperator: Parser<I, O>, parsers: Array<Parser<I, O>>): Array<Parser<I, O>> {
        const result: Array<Parser<I, O>> = []
        for (let index = 0; index < parsers.length; index++) {
        result.push(parsers[index])
        if (index < parsers.length - 1) {
            result.push(seperator)
        }
    }
        return result
}

export function concatenate(parser: Parser<string, string[]>): Parser<string, string> {
        return transform(parser, x => x.join(""))
}

export function flatten<I, O>(parser: Parser<I, O[][]>): Parser<I, O[]> {
        return transform(parser, x => [].concat(...x))
}

export function lateBinding<I, O>(fn: () => Parser<I, O>): Parser<I, O> {
        return (state: ParserState<I>) => {
        return fn()(state)
    }
}

export function parse<O>(text: string, parser: Parser<string, O>): O {
        const result = parser(new ParserState(text.split(""), 0))
        if (isSuccess(result)) {
        return result.value
    }
    else {
        throw new Error("Parse failed")
    }
}

export function debugParser(text: string): Parser<any, any> {
        return (state: ParserState<any>): ParserResult<any, any> => {
        return fail(state.currentIndex)
    }
}

export const symbol = tokens(..."!@#$%^&*-_=+[{}]\"';:/?\\|>.<,()~`".split(""))
export const digit = tokens(..."0123456789".split(""))
export const space = tokens(" ")
export const punctuation = concatenate(oneOrMore(symbol))
export const spaces = concatenate(zeroOrMore(space))
export const lowerCaseLetter = tokens(..."abcdefghijklmnopqrstuvwxyz".split(""))
export const upperCaseLetter = tokens(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))
export const letter = oneOf(lowerCaseLetter, upperCaseLetter)
export const integer = concatenate(oneOrMore(digit))
export const fractional = concatenate(sequence(tokens("."), integer))
export const decimal = concatenate(sequence(integer, fractional))
export const word = concatenate(oneOrMore(letter))
export const num = oneOf(decimal, integer)

/*
Code used to generate function signatures!

for sequence:

let aggr = []
let lines = []
for (let x = 0; x < 32; x++) {
  aggr.push(x)
  let garg = aggr.map(v => "O" + (v+1)).join(", ")
  let aarg = aggr.map(v => `p${v + 1}: Parser<I, O${v+1}>`).join(", ")
  lines.push(`export function sequence<I, ${garg}>(${aarg}): Parser<I, [${garg}]>`)
}
console.log(lines.join("\n"))

for transform:

let aggr = []
let lines = []
for (let x = 1; x < 32; x++) {
  aggr.push(x)
  let garg = aggr.map(v => "O" + (v+1)).join(", ")
  let aarg = aggr.map(v => `fn${v}: (x: O${v}) => O${v+1}`).join(", ")
  lines.push(`export function transform<I, O1, ${garg}>(parser: Parser<I, O1>, ${aarg}): Parser<I, O${x+1}>`)
}
console.log(lines.join("\n"))

*/
