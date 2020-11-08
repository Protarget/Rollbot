import Bot from "../../Bot"
import TextMashupTable from "../../utils/TextMashupTable"
import TimedCache from "../../utils/TimedCache"
import twitter from "../../utils/TweetManager"
import CommandPlugin from "../CommandPlugin"

interface TweetIndexEntry {
    tweet: number
    startIndex: number
    endIndex: number
}

interface TweetIndex {
    tweets: string[]
    words: {[key: string]: TweetIndexEntry[]}
}

export default class Tweets extends CommandPlugin {
    private mashupCache: TimedCache<TextMashupTable> = new TimedCache()

    public constructor() {
        super()
        this.register("!tweet", this.tweets.bind(this))
    }

    private async tweets(from: string, args: string[]): Promise<void> {
        try {
            const namedArgs = args.filter(v => v.startsWith("@") ? v.substr(1) : v)
            if (namedArgs.length <= 0 || namedArgs.length > 2) {
                this.bot.sayToAll("Please supply either 1 or 2 twitter handles")
            }
            else if (namedArgs.length === 1) {
                const tweets = await twitter.getTweets(namedArgs[0], 1000)
                const tweet = tweets[Math.floor(Math.random() * tweets.length)]
                this.bot.sayToAll(tweet)
            }
            else if (namedArgs.length === 2) {
                const tables = await Promise.all(namedArgs.map(x => this.mashupCache.get(x, 14400, async () => new TextMashupTable(await twitter.getTweets(x, 1000)))))

                for (let x = 0; x < 100; x++) {
                    const candidate = tables[0].mashup(tables[1])
                    if (!candidate) {
                        this.bot.sayToAll("Could not find any points of intersection")
                        return
                    }
                    if (candidate.length <= 140) {
                        this.bot.sayToAll(candidate)
                        return
                    }
                }
                this.bot.sayToAll("Could not find any points of intersection")
            }
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll("Error fetching tweets")
        }
    }
}
