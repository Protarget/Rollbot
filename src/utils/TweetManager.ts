import * as fs from "fs"
import * as Twit from "twit"
import TimedCache from "./TimedCache"

export class TweetManager {
    private client: Twit = null
    private cacheTime: number
    private tweetCache: TimedCache<string[]> = new TimedCache()

    public constructor(secretFile: string, cacheTime: number = 14400) {
        this.cacheTime = cacheTime
        const data = JSON.parse(fs.readFileSync(secretFile).toString())
        this.client = new Twit({
            app_only_auth: true,
            consumer_key: data.consumerKey,
            consumer_secret: data.consumerSecret
        })
    }

    public async getTweets(name: string, total: number): Promise<string[]> {
        return this.tweetCache.get(name, this.cacheTime, async () => this.getTweetsRemote(name, total), [total])
    }

    protected async getTweetsRemote(name: string, total: number): Promise<string[]> {
        let lastId: string
        let result: string[] = []
        let tweetArray = []
        let remaining = total
        do {
            const timeline = await this.client.get("statuses/user_timeline", {screen_name: name, count: Math.min(200, remaining), tweet_mode: "extended", include_rts: false, max_id: lastId} as Twit.Params)
            tweetArray = (timeline.data as any[])
            if (tweetArray.length === 0) {
                break
            }
            lastId = decIntegerString(tweetArray[tweetArray.length - 1].id_str)
            result = result.concat(tweetArray.map(x => x.full_text))
            remaining -= tweetArray.length
        } while (remaining > 0)

        return result
    }
}

/**
 * Decrement an integer in a string by recursively subtracting 1 and carrying
 * @param num The number to decrement
 */
function decIntegerString(num: string): string {
    const remainder = num.substring(0, num.length - 1)
    const c = num[num.length - 1]
    switch (c) {
        case "0": return decIntegerString(remainder) + "9"
        default: return remainder + String.fromCharCode(c.charCodeAt(0) - 1)
    }
}

const manager = new TweetManager("./data/_Secrets/twitter.json")

export default manager
