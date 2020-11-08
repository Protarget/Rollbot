import * as fs from "fs"
import fetch from "node-fetch"
import CommandPlugin from "../CommandPlugin"

export default class Osu extends CommandPlugin {
    private key: string = ""

    public constructor() {
        super()
        const osukey = JSON.parse(fs.readFileSync("./data/_Secrets/osu.json").toString())
        this.key = osukey.apikey
        this.register("!osu", this.osuUser.bind(this))
    }

    private async osuUser(from: string, args: string[]): Promise<void> {
        try {
            if (args.length === 0) {
                this.bot.sayToAll("Please supply at least one username/userid")
            }
            for (const user of args) {
                const userData = await fetch("https://osu.ppy.sh/api/get_user?k=" + this.key + "&u=" + user)
                const userDataJson = await userData.json()
                if (userDataJson[0]) {
                    this.bot.sayToAll(userDataJson[0].username + " - " + userDataJson[0].pp_raw + "pp - #" + userDataJson[0].pp_rank + " (" + userDataJson[0].country + " #" + userDataJson[0].pp_country_rank + ")")
                }
                else {
                    this.bot.sayToAll(user + " not found")
                }
            }
        }
        catch {
            this.bot.sayToAll("Error...")
        }
    }
}
