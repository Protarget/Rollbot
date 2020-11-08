import * as fs from "fs"
import * as roman from "roman-numerals"
import * as seasons from "seasons-dates"
import Bot from "../../Bot"
import CommandPlugin from "../CommandPlugin"

export default class FRC extends CommandPlugin {
    private dayNames: string[] = []
    private monthNames: string[] = []

    public constructor(days: string, months: string) {
        super()
        this.register("!frc", this.frc.bind(this))
        this.dayNames = fs.readFileSync(days, "utf-8").split("\n")
        this.monthNames = fs.readFileSync(months, "utf-8").split("\n")
    }

    private frc(from: string, args: string[]): void {
        const equinox = (equinoxYear) => {
            equinoxYear += 1791
            const equinoxDate = new Date(Date.UTC(equinoxYear, 8, seasons(equinoxYear).autumn.getUTCDate(), 0, 0, 0, 0))
            return equinoxDate
        }
        const date = new Date()
        let year = date.getFullYear() - 1792
        if (date.getMonth() > 8) {
            year += 1
        }
        if (date.getMonth() === 8 && date >= equinox(year + 1)) {
            year += 1
        }
        const dayOfYear = Math.floor((+date - +equinox(year)) / 86400000)
        const month = Math.floor((dayOfYear) / 30)
        const dayOfMonth = ((dayOfYear) % 30) + 1
        this.bot.sayToAll(`Today is ${this.dayNames[dayOfYear]} -- ${dayOfMonth} ${this.monthNames[month]} ${roman.toRoman(year)}`)
    }
}
