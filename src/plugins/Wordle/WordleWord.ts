import WordleUtils from "./WordleUtils"

export default class WordleWord {
    private readonly letters: string[]

    public constructor(word: string) {
        this.letters = WordleUtils.normalizeWord(word).split("")
    }

    public getLength() {
        return this.letters.length
    }

    public getLetterAt(index: number): string {
        return this.letters[index] || null
    }

    public getLetters(): ReadonlyArray<String> {
        return this.letters
    }

    public getLetterCounts(): {[letter: string]: number} {
        const letterCounts = {}
        for (const letter of this.letters) {
            letterCounts[letter] = letterCounts[letter] ? letterCounts[letter] + 1 : 1
        }
        return letterCounts
    }

    public toString() {
        return this.letters.join("")
    }
}