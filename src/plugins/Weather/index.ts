import fetch from "node-fetch"
import Bot from "../../Bot"
import CommandPlugin from "../CommandPlugin"

export default class Weather extends CommandPlugin {
    public constructor(){
        super()
        this.register("!weather", this.sayWeather.bind(this))
        this.register("!metar", this.sayMetar.bind(this))
    }

    private async sayWeather(from: string, args: string[]): Promise<void> {
        const weatherLocation = String(args.join(" "))

        if (weatherLocation.length === 0) {
            this.bot.sayToAll("Usage: specify a location, such as a city name or three-letter airport code")
        }

        else if (weatherLocation.match(/^[\ a-zA-Z0-9\-_,~]+$/)) {
            try {
                const page = await fetch("http://wttr.in/" + weatherLocation + "?m?0?T", {
                        headers: { "User-Agent": "curl" }
                    })
                const pageText = await page.text()
                const weather = pageText

                if (weather.startsWith("ERROR: Unknown location") === true) {
                    this.bot.sayToAll("Error: Unknown location: " + weatherLocation)
                }
                else {
                    this.bot.sayToAll(weather)
                }
            }
            catch (e) {
                console.log("Error:", e)
            }
        }

        else {
            this.bot.sayToAll("Error: Please do not use special characters")
        }
    }

    private async sayMetar(from: string, args: string[]): Promise<void> {
        const metarLocation = String(args.join(" ").toUpperCase())

        if (metarLocation.length === 0) {
            this.bot.sayToAll("Usage: specify a four-character ICAO code")
        }

        else if (metarLocation.match(/^[A-Z0-9]{4}$/)) {
            try {
                const page = await fetch("http://tgftp.nws.noaa.gov/data/observations/metar/stations/" + metarLocation + ".TXT")
                const pageText = await page.text()
                const metar = pageText

                if (metar.includes("404 Not Found") === true) {
                    this.bot.sayToAll("Error: Unknown ICAO code: " + metarLocation)
                }
                else {
                    this.bot.sayToAll(metar.split("\n")[1])
                }
            }
            catch (e) {
                console.log("Error:", e)
            }
        }

        else {
            this.bot.sayToAll("Error: Please specify a four-character ICAO code")
        }
    }
}
