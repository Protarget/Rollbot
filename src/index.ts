import * as irc from "irc"
import * as path from "path"
import * as process from "process"
import Bot from "./Bot"
import BotIRCClient from "./BotIRCClient"
import BotTestClient from "./BotTestClient"

import Calc from "./plugins/Calc"
import Caption from "./plugins/Caption"
import Cat from "./plugins/Cat"
import Chess from "./plugins/Chess"
import Face from "./plugins/Face"
import FRC from "./plugins/FRC"
import History from "./plugins/History"
import Osu from "./plugins/Osu"
import Query from "./plugins/Query"
import RandomLine from "./plugins/RandomLine"
import Roll from "./plugins/Roll"
import ShellStdio from "./plugins/ShellStdio"
import Steam from "./plugins/Steam"
import Trivia, { TriviaFileQuestionGenerator, TriviaJeopardyFileQuestionGenerator } from "./plugins/Trivia"
import Trout from "./plugins/Trout"
import Tweets from "./plugins/Tweets"
import Weather from "./plugins/Weather"
import Weed from "./plugins/Weed"
import Word from "./plugins/Word"
import Ai from "./plugins/Ai"
import Wordle from "./plugins/Wordle"

let rollBot = null

if (process.argv.map(x => x.trim()).some(x => x === "-d")) {
    rollBot = new Bot(new BotTestClient())
}
else {
    rollBot = new Bot(new BotIRCClient("irc.rizon.net", "rollbot", "#grandmashouse homer"))
}

rollBot.addPlugin(new History())
rollBot.addPlugin(new Roll())
rollBot.addPlugin(new Trout())
rollBot.addPlugin(new Trivia({jeopardy: new TriviaJeopardyFileQuestionGenerator("./data/Trivia/jeopardy.json"), triviaqa: new TriviaFileQuestionGenerator("./data/Trivia/questions.txt")}))
rollBot.addPlugin(new RandomLine("!oppa", "./data/words.txt", line => `Opp. Opp Opp... Oppa ${line} style!`))
rollBot.addPlugin(new RandomLine("!mao", "./data/Mao/mao.txt"))
rollBot.addPlugin(new RandomLine("!gd", "./data/GraeyDave/gd.txt"))
rollBot.addPlugin(new RandomLine("!mikef", "./data/MikeF/mikef.txt"))
rollBot.addPlugin(new Weather())
rollBot.addPlugin(new FRC("./data/FRC/days.txt", "./data/FRC/months.txt"))
rollBot.addPlugin(new Query())
rollBot.addPlugin(new Calc())
rollBot.addPlugin(new Tweets())
rollBot.addPlugin(new Caption("./data/Caption/corpus.txt", ["no person"], [["Tom", "./data/Caption/mnames.txt"], ["Mary", "./data/Caption/fnames.txt"]]))
rollBot.addPlugin(new Steam())
rollBot.addPlugin(new Osu())
rollBot.addPlugin(new Face())
rollBot.addPlugin(new Cat())
rollBot.addPlugin(new ShellStdio("!complete", path.join(process.cwd(), "data/gpt2/gen.sh"), 300, "GPT2 Server Crashed", "GPT2 Server Unloaded"))
rollBot.addPlugin(new Weed())
rollBot.addPlugin(new Chess())
rollBot.addPlugin(new Word())
rollBot.addPlugin(new Ai())
rollBot.addPlugin(new Wordle("./data/scrabble.txt"))
