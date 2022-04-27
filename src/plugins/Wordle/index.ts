import * as fs from "fs"
import CommandPlugin from "../CommandPlugin"
import WordleDictionary from "./WordleDictionary"
import WordleGame, { WordleGameGuessResult, WordleGameGuessResultType } from "./WordleGame"
import WordleUtils from "./WordleUtils"
import WordleWord from "./WordleWord"

export default class Wordle extends CommandPlugin {
    private dictionary: WordleDictionary
    private game: WordleGame

    public constructor(filename: string) {
        super()
        try {
            this.dictionary = new WordleDictionary(fs.readFileSync(filename, "utf-8").split("\n"))
            this.register("!wordle", this.wordle.bind(this))
        }
        catch (e) {
            console.error(e)
        }
    }

    private wordle(from: string, args: string[]) {
        try {
            if (this.isPlaying() && args[0] == "show") {
                this.showGameState()
            }
            else if (args[0] == "help") {
                this.bot.sayToAll("Use !wordle to start a game with default settings (5 letters, 6 guesses)")
                this.bot.sayToAll("Use !wordle <letters> to start a game with an alternate number of letters")
                this.bot.sayToAll("Use !wordle <letters> <guesses> to start a game with an alternate number of letters and guesses")
                this.bot.sayToAll("Use !wordle <word> to make a guess in an ongoing game")
                this.bot.sayToAll("Use !wordle show to show the current ongoing game")
            }
            else if (this.isPlaying()) {
                if (args.length === 1) {
                    this.makeMove(args[0])
                }
                else if (args.length === 2 && args[0] == "confirm") {
                    this.makeMove(args[1], false)
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
            console.error(e)
            this.bot.sayToAll("Uhh, something went wrong? I'm going to reset everything instead of crashing")
            this.game = null
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

        const subDictionary = this.dictionary.filter(x => x.length === letterCount)

        if (subDictionary.isEmpty()) {
            this.bot.sayToAll(`No words with ${letterCount} letters were found`)
            return
        }

        this.game = new WordleGame(subDictionary, guessMaximum)
        this.bot.sayToAll("Wordle game started")
    }

    private makeMove(move: string, enforceSafety: boolean = true) {
        const result = this.game.guess(move, enforceSafety)
        switch (result.getType()) {
            case WordleGameGuessResultType.Victory:
                this.winGame(result)
                return
            case WordleGameGuessResultType.Loss:
                this.loseGame(result)
                return
            case WordleGameGuessResultType.Valid:
                this.showMove(result)
                return
            case WordleGameGuessResultType.Invalid:
                this.showInvalid(result)
                return
            case WordleGameGuessResultType.Unsafe:
                this.showUnsafe(result)
                return
        }
    }

    private winGame(result: WordleGameGuessResult) {
        this.bot.sayToAll(`Wordle ∞ Victory (${this.game.getCorrectWord()}) ${this.game.toProgressString()}`)
        this.showGame()
        this.game = null
    }

    private loseGame(result: WordleGameGuessResult) {
        this.bot.sayToAll(`Wordle ∞ Failure (${this.game.getCorrectWord()}) ${this.game.toProgressString()}`)
        this.showGame()
        this.game = null
    }

    private showInvalid(result: WordleGameGuessResult) {
        this.bot.sayToAll(`Invalid move: ${result.getReason()}`)
    }

    private showUnsafe(result: WordleGameGuessResult) {
        this.bot.sayToAll(`Unsafe move: ${result.getReason()}`)
        this.bot.sayToAll("Use '!wordle confirm <word>' to override safety checks")
    }

    private showGameState() {
        this.bot.sayToAll(`Wordle ∞ Currently Playing ${this.game.toProgressString()}`)
        if (this.game.getGuessCount() > 0) {
            this.showGame(true)
        }
    }

    private showMove(result: WordleGameGuessResult) {
        const wordString = `${result.getScore().toPrettyString()} (${this.game.toProgressString()}) ${this.game.toLetterGroupString()}`
        this.bot.sayToAll(wordString)
    }

    private showGame(showAdditionalInfo: boolean = false) {
        const boardString = this.game.toPrettyString(showAdditionalInfo)
        for (const line of boardString.split("\n")) {
            this.bot.sayToAll(line)
        }
    }

    private isPlaying(): boolean {
        return this.game !== null && this.game !== undefined
    }
}
