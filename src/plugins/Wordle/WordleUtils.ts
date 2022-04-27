import WordleWordScore, { WordleLetterScore } from "./WordleScore"

const IRC_COLOR_CODE_CHAR = String.fromCharCode(3)
const ALPHABETICAL_REGEX = /^[a-zA-Z]+$/i

export default class WordleUtils {
    public static IRC_COLOR_CODE_CHAR = IRC_COLOR_CODE_CHAR

    public static letterScoreToColorCode(state: WordleLetterScore) {
        switch (state) {
            case WordleLetterScore.Incorrect: return `${IRC_COLOR_CODE_CHAR}00,14`
            case WordleLetterScore.PartiallyCorrect: return `${IRC_COLOR_CODE_CHAR}00,07`
            case WordleLetterScore.Correct: return `${IRC_COLOR_CODE_CHAR}00,03`
        }
    }

    public static normalizeWord(word: string) {
        return word.toUpperCase().trim()
    }

    public static isAlphabetical(word: string) {
        return ALPHABETICAL_REGEX.test(word)
    }
}