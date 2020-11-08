import Bot from "./Bot"

export default abstract class BotPlugin {
    protected bot: Bot

    public onChatMessage?(from: string, message: string): void
    public onPrivateMessage?(from: string, message: string): void
    public onOutgoingChatMessage?(message: string): void
    public onOutgoingPrivateMessage?(to: string, message: string): void
    public onStart?(): void
    public onEnd?(): void

    public setBot(bot: Bot): void {
        this.bot = bot
    }
}
