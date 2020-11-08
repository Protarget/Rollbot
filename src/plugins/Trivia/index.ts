import * as fs from "fs"
import fetch from "node-fetch"
import * as removeAccents from "remove-accents"
import Bot from "../../Bot"
import { Session, SessionManager } from "../../utils/SessionManager"
import CommandPlugin from "../CommandPlugin"

class TriviaQuestion {
    public question: string
    public answers: string[]
    public additional: string[]

    public constructor(q: string, a: string[], additional: string[] = []) {
        this.question = q
        this.answers = a
        this.additional = additional
    }
}

interface TriviaQuestionGenerator {
    getQuestions(count: number): Promise<TriviaQuestion[]>
}

export class TriviaFileQuestionGenerator implements TriviaQuestionGenerator {
    private questions: TriviaQuestion[]

    public constructor(filename: string) {
        this.questions = this.loadQuestions(filename)
    }

    public loadQuestions(filename: string): TriviaQuestion[] {
        return fs.readFileSync(filename, "utf-8").split("\n").filter(Boolean).map(x => {
            const values = x.split("~")
            const question = values.shift()
            return new TriviaQuestion(question, values)
        })
    }

    public async getQuestions(count: number): Promise<TriviaQuestion[]> {
        return new Array(count).fill(null).map(x => this.getQuestion())
    }

    public getQuestion(): TriviaQuestion {
        return this.questions[Math.floor(Math.random() * this.questions.length)]
    }
}

export class TriviaJeopardyQuestionGenerator implements TriviaQuestionGenerator {
    public async getQuestions(count: number): Promise<TriviaQuestion[]> {
        try {
            const apiResult = await fetch(`http://jservice.io/api/random?count=${count}`)
            const apiJson = await apiResult.json()
            return apiJson.map(x => {
                const value = x.value ? `, $${x.value}` : ""
                const airdate = x.airdate ? `, ${new Date(x.airdate).getFullYear()}` : ""
                const category = x.category && x.category.title ? x.category.title : "unknown category"
                const question = `(${category}${value}${airdate}) ${x.question}`
                const noTags = x.answer.replace(/\<.+?\>/g, "").replace(/\\'/g, "'").trim()

                return new TriviaQuestion(question, [noTags])
            })
        }
        catch {
            return null
        }
    }
}

export class TriviaJeopardyFileQuestionGenerator extends TriviaFileQuestionGenerator {
    public loadQuestions(filename: string): TriviaQuestion[] {
        return JSON.parse(fs.readFileSync(filename, "utf-8")).map(x => {
            const question = x.question
            const answers = x.answer
            const value = x.value
            const year = x.year
            const category = x.category
            const media = x.media
            return new TriviaQuestion(`(${category}, ${value}, ${year}) ${question}`, answers, media)
        })
    }
}

interface TriviaArguments {
    bot: Bot,
    questions: TriviaQuestion[]
}

class TriviaSession extends Session<TriviaArguments> {
    private active: boolean = true
    private bot: Bot
    private channel: string
    private sessionTimer: NodeJS.Timer
    private score: { [id: string]: number } = {}
    private questions: TriviaQuestion[]
    private questionTotal: number = 0

    public onCreate(args: TriviaArguments): void {
        this.bot = args.bot
        this.questions = args.questions
        this.questionTotal = args.questions.length
        this.run()
    }

    public isActive(): boolean {
        return this.active
    }

    public answer(from: string, message: string): void {
        const normalizedAnswer = this.normalize(message)
        const acceptableAnswers = this.preserveParentheticals(this.questions[0].answers)
        if (acceptableAnswers.some(n => this.normalize(n) === normalizedAnswer)) {
            this.correct(from, message.trim())
        }
    }

    private generateHints(answer: string, count: number): string[] {
        const hiddenIndices: number[] = []
        const hints: string[] = []
        for (let x = 0; x < answer.length; x++) {
            hiddenIndices.push(x)
        }

        for (let c = count; c > 0; c--) {
            const max = Math.ceil(c / (count + 1) * answer.length)
            while (hiddenIndices.length > max) {
                hiddenIndices.splice(Math.floor(Math.random() * hiddenIndices.length), 1)
            }

            let hint = ""
            for (let x = 0; x < answer.length; x++) {
                hint += hiddenIndices.indexOf(x) !== -1 ? "_" : answer.charAt(x)
            }
            hints.push(hint)
        }
        return hints
    }

    private async run(): Promise<void> {
        if (!this.active) { return }
        const hiddenIndices: number[] = []
        const answer: string = this.questions[0].answers[0]
        const hints: string[] = this.generateHints(answer, 3)
        const prefix: string = this.questionTotal > 1 ? `Q (${this.questionTotal - this.questions.length + 1}/${this.questionTotal}): ` : "Q: "

        this.bot.sayToAll(prefix + this.questions[0].question)
        for (const additional of this.questions[0].additional) {
            this.bot.sayToAll(additional)
        }
        await this.wait(15000)

        for (let x = 0; x < hints.length; x++) {
            this.bot.sayToAll(`Hint (${x + 1}/${hints.length}): ${hints[x]}`)
            await this.wait(15000)
        }

        this.bot.sayToAll("Times Up! Answer: " + this.questions[0].answers[0])
        this.nextQuestion()
    }

    private correct(from: string, message: string): void {
        this.bot.sayToAll("Correct " + from + ", the answer was: " + this.questions[0].answers[0])
        this.score[from] = this.score[from] || 0
        this.score[from]++
        clearTimeout(this.sessionTimer)
        this.nextQuestion()
    }

    private done(): void {
        clearTimeout(this.sessionTimer)
        this.end()
    }

    private nextQuestion(): void {
        if (!this.active) { return }
        this.questions.shift()
        if (this.questions.length === 0) {
            if (this.questionTotal > 1) {
                this.bot.sayToAll("Session over")
                this.announceScore()
            }
            this.done()
        }
        else {
            this.run()
        }
    }

    private announceScore(): void {
        const entries: Array<[string, number]> = Object.keys(this.score).map(x => [x, this.score[x]]).sort((a, b) => (b[1] as number) - (a[1] as number)) as Array<[string, number]>
        let index = 0
        if (entries.length === 0) {
            this.bot.sayToAll("Nobody answered any questions. Wow. Sad")
        }
        entries.reduce((l, r) => {
            if (l[1] !== r[1]) {index++}
            this.bot.sayToAll(`${index}. ${r[0]} with ${r[1]} points`)
            return r
        }, ["", -1])
    }

    private preserveParentheticals(value: string[]): string[] {
        const answers: string[] = []
        value.forEach(n => answers.push(n, n.replace(/\(|\)/g, "")))
        return answers
    }

    private normalize(value: string): string {
        const accentsRemoved = removeAccents(value)
        const lower = accentsRemoved.toLowerCase()
        const noBrackets = lower.replace(/\(.+?\)/g, "")
        const noDashes = noBrackets.replace(/\-/g, " ")
        const compactSpaces = noDashes.replace(/  +/g, " ")
        const normalizedAnd = compactSpaces.replace(/&/g, "and")
        const noPunctuation = normalizedAnd.replace(/[^a-zA-Z0-9 ]/g, "")
        const noPrefixA = noPunctuation.replace(/^a /g, "")
        const noPrefixAn = noPrefixA.replace(/^an /g, "")
        const noPrefixThe = noPrefixAn.replace(/^the /g, "")
        return noPrefixThe.trim()
    }

    private wait(t: number): Promise<void> {
        return new Promise(resolve => this.sessionTimer = setTimeout(resolve, t))
    }
}

export default class Trivia extends CommandPlugin {
    private sessions: SessionManager<TriviaSession, TriviaArguments> = new SessionManager(TriviaSession)
    private questionGenerators: {[key: string]: TriviaQuestionGenerator}
    private currentQuestionGenerator: string
    private spawningSession: boolean = false

    public constructor(questionGenerators: {[key: string]: TriviaQuestionGenerator}) {
        super()
        this.register("!trivia", this.startTrivia.bind(this))
        this.register("!triviamode", this.setTriviaMode.bind(this))
        this.questionGenerators = questionGenerators
        this.currentQuestionGenerator = Object.keys(questionGenerators)[0]
    }

    public onNoCommand(from: string, message: string): void {
        this.sessions.with("triv", session => {
            session.answer(from, message)
        })
    }

    private async getQuestions(count: number): Promise<TriviaQuestion[]> {
        const generator = this.questionGenerators[this.currentQuestionGenerator]
        if (generator !== null && generator !== undefined) {
            return generator.getQuestions(count)
        }
        else {
            return null
        }
    }

    private setTriviaMode(from: string, args: string[]): void {
        if (args.length >= 1) {
            const generator = this.questionGenerators[args[0]]
            if (generator !== null && generator !== undefined) {
                this.currentQuestionGenerator = args[0]
                this.bot.sayToAll(`Trivia mode changed to: ${args[0]}`)
            }
            else {
                this.bot.sayToAll(`Invalid trivia mode`)
            }
        }
        else {
            this.bot.sayToAll(`Current trivia mode: ${this.currentQuestionGenerator}`)
            this.bot.sayToAll(`Valid trivia modes: ${Object.keys(this.questionGenerators).join(", ")}`)
        }
    }

    private startTrivia(from: string, args: string[]): void {
        if (this.spawningSession) {
            return
        }

        this.sessions.without("triv", async () => {
            this.spawningSession = true
            let questionCount = 1
            if (args.length === 1 && !Number.isNaN(parseInt(args[0], 10))) {
                questionCount = parseInt(args[0], 10)
            }

            if (questionCount > 0 && questionCount <= 20) {
                if (questionCount > 1) {
                    this.bot.sayToAll(`Starting trivia session with ${questionCount} questions`)
                }
                const questions = await this.getQuestions(questionCount)

                if (questions === null) {
                    this.bot.sayToAll(`Invalid trivia mode?! This shouldn't ever happen!`)
                }
                else {
                    this.sessions.create("triv", {bot: this.bot, questions})
                }
            }
            else {
                this.bot.sayToAll("Enter a valid number between 1 and 20")
            }
            this.spawningSession = false
        })
    }
}
