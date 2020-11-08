import Bot from "../../Bot"
import CommandPlugin from "../CommandPlugin"

export default class Roll extends CommandPlugin {
    public constructor() {
        super()
        this.register("!roll", this.roll.bind(this))
    }

    private roll(from: string, args: string[]): void {
        let rollDice = 2
        let rollSides = 6
        const rollResult = []
        if (args[0]) {
            if (args[0].match(/^[0-9]+d[0-9]+$/)) {
                const rollInput = args[0].split("d")
                rollDice = Number(rollInput[0])
                if (rollDice > 100) {
                    rollDice = 100
                }
                rollSides = Number(rollInput[1])
                if (rollSides > 1000000){
                    rollSides = 1000000
                }
            }
        }
        let rollCount = rollDice
        while (rollCount > 0) {
            rollResult.push(Math.floor(Math.random() * rollSides) + 1)
            rollCount--
        }
        this.bot.sayToAll(`${from} rolled ${rollDice} ${rollSides}-sided dice: ${rollResult.join(" ")}`)
    }
}
