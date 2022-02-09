import * as fs from "fs"
import CommandPlugin from "../CommandPlugin"

const ALPHANUMERIC_REGEX = /^[a-z]+$/i
const IRC_COLOR_CODE_CHAR = String.fromCharCode(3)

export default class Wordle extends CommandPlugin {
    private words: string[] = []
    private playing: boolean
    private currentWord: string
    private validWords: Set<string>
    private guessHistory: string[] = []
    private guessMaximum: number = 0

    public constructor(filename: string) {
        super()
        try {
            this.words = fs.readFileSync(filename, "utf-8").split("\n").map(x => x.toUpperCase()).filter(x => ALPHANUMERIC_REGEX.test(x))
            this.register("!wordle", this.wordle.bind(this))
        }
        catch (e) {
            console.error(e)
        }
    }

    private wordle(from: string, args: string[]) {
        try {
            if (args[0] == "show") {
                this.showGameState()
            }
            else if (args[0] == "help") {
                this.bot.sayToAll("Use !wordle to start a game with default settings (5 letters, 6 guesses)")
                this.bot.sayToAll("Use !wordle <letters> to start a game with an alternate number of letters")
                this.bot.sayToAll("Use !wordle <letters> <guesses> to start a game with an alternate number of letters and guesses")
                this.bot.sayToAll("Use !wordle <word> to make a guess in an ongoing game")
                this.bot.sayToAll("Use !wordle show to show the current ongoing game")
            }
            else if (this.playing) {
                if (args.length === 1) {
                    this.makeMove(args[0].toUpperCase())
                }
                else {
                    this.bot.sayToAll("Use '!wordle <word>' to make a guess, or '!wordle show' to see the current game state")
                }
            } else {
                let letterCount = 5
                let guessMaximum = 6

                if (args.length >= 1) {
                    letterCount = parseInt(args[0])
                    if (Number.isNaN(letterCount)) {
                        this.bot.sayToAll("The specified letter count is non-numeric")
                        return
                    }
                }

                if (args.length >= 2) {
                    guessMaximum = parseInt(args[1])
                    if (Number.isNaN(letterCount)) {
                        this.bot.sayToAll("The specified guess count is non-numeric")
                        return
                    }
                }

                this.startGame(letterCount, guessMaximum)
            }
        }
        catch (e) {
            this.bot.sayToAll("Uhh, something went wrong? I'm going to reset everything instead of crashing")
            this.playing = false
        }
    }

    private startGame(letterCount: number, guessMaximum: number) {
        if (letterCount < 1 || letterCount > 20) {
            this.bot.sayToAll("I'm begging you to use a reasonable letter count (positive, between 1 and 20)")
            return
        }

        if (guessMaximum < 1 || guessMaximum > 20) {
            this.bot.sayToAll("I'm begging you to use a reasonable guess count (positive, between 1 and 20)")
            return
        }

        const possibleWords = this.words.filter(x => x.length === letterCount)
        
        if (possibleWords.length === 0) {
            this.bot.sayToAll(`No words with ${letterCount} letters were found`)
            return
        }

        this.validWords = new Set(possibleWords)
        this.currentWord = possibleWords[Math.floor(Math.random() * possibleWords.length)]
        this.guessHistory = []
        this.guessMaximum = guessMaximum
        this.playing = true
        this.bot.sayToAll("Wordle game started")
    }

    private makeMove(move: string) {
        if (move.length !== this.currentWord.length) {
            this.bot.sayToAll(`A guess should be ${this.currentWord.length} letters long`)
        }
        else if (!this.validWords.has(move)) {
            this.bot.sayToAll(`That isn't a valid guess`)
        }
        else if (move === this.currentWord) {
            this.guessHistory.push(move)
            this.winGame()
        }
        else {
            this.guessHistory.push(move)

            if (this.guessHistory.length >= this.guessMaximum) {
                this.loseGame()
            }
            else {
                this.showMove(move, true)
            }
        }
    }

    private winGame() {
        this.bot.sayToAll(`Wordle ∞ Victory ${this.guessHistory.length}/${this.guessMaximum}`)
        this.showGame()
        this.playing = false
    }

    private loseGame() {
        this.bot.sayToAll(`Wordle ∞ Failure (${this.currentWord}) ${this.guessHistory.length}/${this.guessMaximum}`)
        this.showGame()
        this.playing = false
    }

    private showGameState() {
        this.bot.sayToAll(`Wordle ∞ Currently Playing ${this.guessHistory.length}/${this.guessMaximum}`)
        this.showGame()
    }

    private showGame() {
        for (const guess of this.guessHistory) {
            this.showMove(guess)
        }
    }

    private showMove(move: string, includeCount: boolean = false) {
        const moveText = this.colorWord(move)
        const countText = (includeCount ? ` (${this.guessHistory.length}/${this.guessMaximum})` : "")
        this.bot.sayToAll(moveText + countText)
    }
    
    private colorWord(move: string): string {
        return this.scoreWord(move).map(x => this.colorScoredLetter(x)).join("") + IRC_COLOR_CODE_CHAR
    }

    private colorScoredLetter(scoredLetter: [string, number]): string {
        const letter = scoredLetter[0]
        const score = scoredLetter[1]

        if (score === 2) {
            return `${IRC_COLOR_CODE_CHAR}00,03${letter}`
        }
        else if (score === 1) {
            return `${IRC_COLOR_CODE_CHAR}00,07${letter}`
        }
        else {
            return `${IRC_COLOR_CODE_CHAR}00,14${letter}`
        }
    }

    private scoreWord(word: string): Array<[string, number]> {
        const letterCounts = this.getLetterCounts()
        const result: Array<[string, number]> = word.split("").map(x => [x, 0] as [string, number])

        for (let index = 0; index < word.length; index++) {
            const moveLetter = result[index][0]
            const actualLetter = this.currentWord.charAt(index)
            if (moveLetter === actualLetter) {
                result[index][1] = 2
                letterCounts[moveLetter]--
            }
        }

        for (let index = 0; index < word.length; index++) {
            const moveLetter = word.charAt(index)
            if (result[index][1] === 0 && letterCounts[moveLetter]) {
                result[index][1] = 1
                letterCounts[moveLetter]--
            }
        }

        return result
    }

    private getLetterCounts(): {[letter: string]: number} {
        const letterCounts = {}

        for (const letter of this.currentWord.split("")) {
            if (letterCounts[letter]) {
                letterCounts[letter] = letterCounts[letter] + 1
            }
            else {
                letterCounts[letter] = 1
            }
        }

        return letterCounts
    }
}
