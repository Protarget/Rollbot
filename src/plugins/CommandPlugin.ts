import BotPlugin from "../BotPlugin"

type Command = (from: string, args: string[], original?: string) => void

export default abstract class CommandPlugin extends BotPlugin {
    private commands: { [id: string]: Command } = {}
    private privateCommands: { [id: string]: Command } = {}

    public onNoCommand(from: string, message: string): void { /* */ }
    public onNoPrivateCommand(from: string, message: string): void { /* */ }

    public onChatMessage(from: string, message: string): void {
        const command = this.parseCommand(this.commands, message)
        if (command) {
            command[0](from, command[1].filter(Boolean), command[2])
        }
        else {
            this.onNoCommand(from, message)
        }
    }

    public onPrivateMessage(from: string, message: string): void {
        const command = this.parseCommand(this.privateCommands, message)
        if (command) {
            command[0](from, command[1].filter(Boolean), command[2])
        }
        else {
            this.onNoPrivateCommand(from, message)
        }
    }

    public register(cmdName: string, cmdFunction: Command): void {
        this.commands[cmdName.trim()] = cmdFunction
    }

    public registerPrivate(cmdName: string, cmdFunction: Command): void {
        this.privateCommands[cmdName.trim()] = cmdFunction
    }

    private parseCommand(basis: { [id: string]: Command }, message: string): [Command, string[], string] {
        for (const key in basis) {
            if (message.trim() === key) {
                return [basis[key], [], ""]
            }
            else if (message.startsWith(key + " ")) {
                let buffer = ""
                const argString = message.substr(key.length + 1)
                let stringMode = false
                const args: string[] = []

                for (let index = 0; index < argString.length; index++) {
                    const c = argString.charAt(index)
                    if (c === "\"") {
                        stringMode = !stringMode
                        if (stringMode) {
                            buffer = buffer.trim()
                        }
                        args.push(buffer)
                        buffer = ""
                    }
                    else if (c === " " && !stringMode) {
                        args.push(buffer)
                        buffer = ""

                    }
                    else {
                        buffer += c
                    }
                }
                args.push(buffer)
                return [basis[key], args, argString]
            }
        }
        return null
    }
}
