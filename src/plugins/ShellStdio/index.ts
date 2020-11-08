import * as child_process from "child_process"
import * as path from "path"
import { setTimeout } from "timers"
import CommandPlugin from "../CommandPlugin"

export default class ShellStdio extends CommandPlugin {
    private process: child_process.ChildProcess
    private timeoutIdentifier: NodeJS.Timer
    private timeoutCancel: () => void
    private timeoutRefresh: () => void
    private path: string
    private timeout: number
    private crashMessage: string
    private timeoutMessage: string

    public constructor(command: string, path: string, timeout: number = 300, crashMessage: string = null, timeoutMessage: string = null) {
        super()
        try {
            this.path = path
            this.timeout = timeout
            this.crashMessage = crashMessage
            this.timeoutMessage = timeoutMessage
            this.register(command, this.complete.bind(this))
        }
        catch (e) {
            console.error(e)
        }
    }

    private complete(from: string, args: string[], fullMessage: string): void {
        this.getProcess().stdin.write(fullMessage + "\n")
    }

    private getProcess(): child_process.ChildProcess {
        if (!this.process) {

            const cwd = path.dirname(this.path)

            this.process = child_process.spawn(this.path, [], {cwd} as any)

            this.process.stdout.on("data", data => {
                this.timeoutRefresh()
                this.bot.sayToAll(data.toString().trim())
            })

            this.process.on("err", () => {
                this.timeoutCancel()
                if (this.crashMessage) {
                    this.bot.sayToAll(this.crashMessage)
                }
                this.process = null
            })

            this.process.on("exit", () => {
                this.timeoutCancel()
                this.process = null
            })

            this.timeoutCancel = () => {
                if (this.timeoutIdentifier) {
                    clearTimeout(this.timeoutIdentifier)
                }
                this.timeoutIdentifier = null
            }

            this.timeoutRefresh = () => {
                this.timeoutCancel()
                this.timeoutIdentifier = setTimeout(() => {
                    if (this.process != null) {
                        if (this.timeoutMessage) {
                            this.bot.sayToAll(this.timeoutMessage)
                        }
                        this.process.kill()
                        this.process = null
                    }
                }, this.timeout * 1000.0)
            }

            this.timeoutRefresh()
        }
        return this.process
    }
}
