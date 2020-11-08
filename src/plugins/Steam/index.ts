import fetch from "node-fetch"
import Bot from "../../Bot"
import TimedCache from "../../utils/TimedCache"
import CommandPlugin from "../CommandPlugin"

interface GameScreenshot {
    id: number,
    path_full: string
}

interface GameData {
    success: boolean
    data: {
        name?: string
        short_description?: string
        detailed_description?: string
        screenshots: GameScreenshot[]
    }
}

export default class Steam extends CommandPlugin {
    private mashupCache: TimedCache<number[]> = new TimedCache()

    public constructor() {
        super()
        this.register("!steam", this.steamDescription.bind(this))
        this.register("!steamshot", this.steamScreenshot.bind(this))
    }

    private async steamDescription(): Promise<void> {
        const newlineRegex = /\<br *?\/? *?\>/g
        const otherTagRegex = /\<\/?.+? *?\>/g
        const quoteRegex = /\&quot\;/g
        await this.withRandomSteamGame(gameData => {
            if (gameData.data.short_description.length > 0 || gameData.data.detailed_description.length > 0) {
                const options: string[] = []
                if (gameData.data.detailed_description.trim().length > 0) {
                    const lines = gameData.data.detailed_description
                        .replace(newlineRegex, "\n")
                        .replace(otherTagRegex, "")
                        .replace(quoteRegex, "\"")
                        .split("\n")
                        .filter(x => x.trim().length > 0)
                    const chosenLine = lines[Math.floor(Math.random() * lines.length)]
                    options.push(chosenLine)
                }

                if (gameData.data.short_description.trim().length > 0) {
                    options.push(gameData.data.short_description.trim().replace(newlineRegex, "\n").replace(otherTagRegex, "").replace(quoteRegex, "\""))
                }

                this.bot.sayToAll(options[Math.floor(Math.random() * options.length)])

                return true
            }
            else {
                return false
            }
        })
    }

    private async steamScreenshot(): Promise<void> {
        await this.withRandomSteamGame(gameData => {
            if (gameData.data.screenshots && gameData.data.screenshots.length > 0) {
                this.bot.sayToAll(gameData.data.screenshots[Math.floor(Math.random() * gameData.data.screenshots.length)].path_full)
                return true
            }
            else {
                return false
            }
        })
    }

    private async withRandomSteamGame(fn: (data: GameData) => boolean): Promise<void> {
        const maxAttempts = 10
        try {
            for (let attempts = 0; attempts < maxAttempts; attempts++) {
                try {
                    const game = await this.getRandomSteamApp()
                    const gameData = await this.getSteamAppDetails(game)
                    if (gameData.success) {
                        const result = fn(gameData)
                        if (result) {
                            return
                        }
                        const options: string[] = []
                    }
                }
                catch (e) {
                    console.error(e)
                }
            }
            throw new Error("I give up")
        }
        catch (e) {
            console.error(e)
            this.bot.sayToAll("Could not fetch random game")
        }
    }

    private async getRandomSteamApp(): Promise<number> {
        const gameList = await this.mashupCache.get("games", 86400, async () => {
            const games = await fetch("http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json")
            const gamesJson = await games.json()
            if (gamesJson.applist && gamesJson.applist.apps) {
                return gamesJson.applist.apps.map(x => x.appid)
            }
            else {
                throw new Error("Apps JSON in invalid structure")
            }
        })

        return gameList[Math.floor(Math.random() * gameList.length)]
    }

    private async getSteamAppDetails(appId: number): Promise<GameData> {
        const gameData = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)
        const gameDataJson = await gameData.json()
        return gameDataJson[appId]
    }
}
