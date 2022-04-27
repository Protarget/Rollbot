import Wordle from "."
import WordleUtils from "./WordleUtils"
import WordleWord from "./WordleWord"

export enum WordleLetterScore {
    Incorrect = 1,
    PartiallyCorrect = 2,
    Correct = 3
}

export default class WordleWordScore {
    private readonly word: WordleWord
    private readonly score: WordleLetterScore[]
    private readonly correct: boolean
    
    public constructor(word: WordleWord, correctWord: WordleWord) {
        this.word = word
        if (word.getLength() !== correctWord.getLength()) {
            this.score = Array(Math.max(word.getLength(), correctWord.getLength())).fill(WordleLetterScore.Incorrect)
            this.correct = false
        }
        else {
            const letterCounts = correctWord.getLetterCounts()
            this.score = Array(word.getLength()).fill(WordleLetterScore.Incorrect)
            let correct = true

            for (let index = 0; index < word.getLength(); index++) {
                const letter = word.getLetterAt(index)
                const correctLetter = correctWord.getLetterAt(index)
                if (letter === correctLetter) {
                    this.score[index] = WordleLetterScore.Correct
                    letterCounts[letter]--
                }
                else {
                    correct = false
                }
            }
    
            for (let index = 0; index < word.getLength(); index++) {
                const letter = word.getLetterAt(index)
                if (this.score[index] === WordleLetterScore.Incorrect && letterCounts[letter]) {
                    this.score[index] = WordleLetterScore.PartiallyCorrect
                    letterCounts[letter]--
                }
            }

            this.correct = correct
        }
    }

    public isCorrect(): boolean {
        return this.correct
    }

    public getLength() {
        return this.word.getLength()
    }

    public getWord(): WordleWord {
        return this.word
    }

    public getLetterAt(index: number): string {
        return this.word.getLetterAt(index)
    }

    public getLetterScoreAt(index: number): WordleLetterScore {
        return this.score[index] || WordleLetterScore.Incorrect
    }

    public getLettersAndScores(): ReadonlyArray<[string, WordleLetterScore]> {
        const result = []
        for (let index = 0; index < this.word.getLength(); index++) {
            const letter = this.getLetterAt(index)
            const score = this.getLetterScoreAt(index)
            result.push([letter, score])
        }
        return result
    }

    public toPrettyString(): string {
        return this.getLettersAndScores().map(([letter, score]) => `${WordleUtils.letterScoreToColorCode(score)}${letter}`).join("") + WordleUtils.IRC_COLOR_CODE_CHAR
    }
}