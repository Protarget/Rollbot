import * as chess from "chess"
import Bot from "../../Bot"
import Image, { rgb } from "../../utils/Image"
import { Session, SessionManager } from "../../utils/SessionManager"
import CommandPlugin from "../CommandPlugin"

interface ChessArguments {
    white: string,
    black: string
}

class ChessSession extends Session<ChessArguments> {
    private gameClient: any
    private whitePlayer: string
    private blackPlayer: string
    private id: string
    private isBlackTurn: boolean = false

    public onCreate(args: ChessArguments, id: string): void {
        this.whitePlayer = args.white
        this.blackPlayer = args.black
        this.id = id
        this.gameClient = chess.create()
    }

    public move(move: string): void {
        this.gameClient.move(move)
        this.isBlackTurn = !this.isBlackTurn
    }

    public getStatus(): any {
        return this.gameClient.getStatus()
    }

    public getId(): any {
        return this.id
    }

    public getWhitePlayer(): string {
        return this.whitePlayer
    }

    public getBlackPlayer(): string {
        return this.blackPlayer
    }

    public getCurrentTurn(): string {
        return this.isBlackTurn ? "black" : "white"
    }

    public getBlackTurn(): boolean {
        return this.isBlackTurn
    }

    public isPlayerTurn(player: string): boolean {
        return (this.isBlackTurn && player === this.blackPlayer) || (!this.isBlackTurn && player === this.whitePlayer)
    }

    public isPlayerInvolved(player: string): boolean {
        return (player === this.blackPlayer || player === this.whitePlayer)
    }
}

interface ChessPieceImages {
    pawn: Image,
    rook: Image,
    knight: Image,
    bishop: Image,
    queen: Image
    king: Image
}

interface ChessPieceTeamImages {
    white: ChessPieceImages,
    black: ChessPieceImages
}

export default class Chess extends CommandPlugin {
    private sessionManager: SessionManager<ChessSession, ChessArguments> = new SessionManager(ChessSession)
    private pieceImages: ChessPieceTeamImages

    public constructor() {
        super()
        this.loadImages()
        this.register("!chess", this.startChessGame.bind(this))
        this.register("!chesslist", this.listChessGames.bind(this))
        this.register("!chessboard", this.showChessGame.bind(this))
        this.register("!chessmove", this.makeMove.bind(this))
        this.register("!chessresign", this.resign.bind(this))
    }

    public async loadImages(): Promise<void> {
        this.pieceImages = {
            black: {
                bishop: await Image.fromPath("data/Chess/b_bishop.png"),
                king: await Image.fromPath("data/Chess/b_king.png"),
                knight: await Image.fromPath("data/Chess/b_knight.png"),
                pawn: await Image.fromPath("data/Chess/b_pawn.png"),
                queen: await Image.fromPath("data/Chess/b_queen.png"),
                rook: await Image.fromPath("data/Chess/b_rook.png")
            },
            white: {
                bishop: await Image.fromPath("data/Chess/w_bishop.png"),
                king: await Image.fromPath("data/Chess/w_king.png"),
                knight: await Image.fromPath("data/Chess/w_knight.png"),
                pawn: await Image.fromPath("data/Chess/w_pawn.png"),
                queen: await Image.fromPath("data/Chess/w_queen.png"),
                rook: await Image.fromPath("data/Chess/w_rook.png")
            }
        }
    }

    public async startChessGame(from: string, args: string[]): Promise<void> {
        const white = from
        const black = args[0]

        if (args.length === 0) {
            this.showHelp()
        }
        else {
            const existingGames = this.sessionManager.getWhere(x => x.isPlayerInvolved(white) || x.isPlayerInvolved(black))

            // Check if either player is involved in another game and reject the request if so
            if (existingGames.length > 0) {
                this.bot.sayToAll("Unable to start new chess game, one of the players is involved in an existing game")
            }
            else {
                this.sessionManager.create(white + " " + black, {white, black})
                this.bot.sayToAll(`New chess game started between ${white} and ${black}`)
            }
        }
    }

    public async listChessGames(from: string, args: string[]): Promise<void> {
        const games: ChessSession[] = this.sessionManager.getAll()
        if (games.length === 0) {
            this.bot.sayToAll("No games in progress")
        }
        else {
            for (const game of games) {
                this.bot.sayToAll(`${game.getWhitePlayer()} vs ${game.getBlackPlayer()}, ${game.getCurrentTurn()} turn`)
            }
        }
    }

    public async showChessGame(from: string, args: string[]): Promise<void> {
        const game = this.getGame(from)

        if (game) {
            try {
                const result: Image = this.renderSession(game, game.getBlackPlayer() === from)
                const url = await result.upload()
                this.bot.sayToAll(url)
            }
            catch (e) {
                this.bot.sayToAll("Error rendering game")
            }
        }
        else {
            this.bot.sayToAll("You are not currently involved with a game")
        }
    }

    public async makeMove(from: string, args: string[]): Promise<void> {
        const game = this.getGame(from)

        if (game) {
            if (game.isPlayerTurn(from)) {
                try {
                    game.move(args[0])

                    if (game.getStatus().isCheckmate) {
                        this.bot.sayToAll("Checkmate!")
                        this.sessionManager.destroy(game.getId())
                    }
                    else if (game.getStatus().isCheck) {
                        this.bot.sayToAll("Check")
                    }
                }
                catch {
                    this.bot.sayToAll("Invalid move")
                    return
                }

                try {
                    const result: Image = this.renderSession(game, game.getBlackTurn())
                    const url = await result.upload()
                    this.bot.sayToAll(url)
                }
                catch (e) {
                    this.bot.sayToAll("Error rendering game")
                }

            }
            else {
                this.bot.sayToAll("It is not currently your turn")
            }
        }
        else {
            this.bot.sayToAll("You are not currently involved with a game")
        }
    }

    public async resign(from: string, args: string[]): Promise<void> {
        const game = this.getGame(from)

        if (game) {
            this.bot.sayToAll("You resign")
            this.sessionManager.destroy(game.getId())
        }
        else {
            this.bot.sayToAll("You are not currently involved with a game")
        }
    }

    private getGame(player: string): ChessSession {
        const existingGames = this.sessionManager.getWhere(x => x.isPlayerInvolved(player))

        if (existingGames.length > 0) {
            return existingGames[0]
        }
        else {
            return null
        }
    }

    private showHelp(): void {
        this.bot.sayToAll("Chess plugin commands")
        this.bot.sayToAll("!chess <player name>: start a chess game between yourself as white and another player as black")
        this.bot.sayToAll("!chessmove <algebraic notation move>: Make a move in your current game")
        this.bot.sayToAll("!chessresign: Resign your current game")
        this.bot.sayToAll("!chesslist: List the currently running games")
        this.bot.sayToAll("!chessboard: Render the board of your current game")
    }

    private renderSession(session: ChessSession, flipped: boolean): Image {
        const result: Image = this.renderChessboard()
        this.renderPieces(result, session.getStatus(), flipped)
        const background: Image = this.renderChessboardBackground(flipped)
        background.composite(result, 20, 20)
        return background
    }

    private renderChessboardBackground(flipped: boolean): Image {
        const numberToFile = ["a", "b", "c", "d", "e", "f", "g", "h"]
        const result: Image = new Image(552, 552)
        result.setFillColor(rgb(115, 86, 62))
        result.fillRect(0, 0, 552, 552)
        for (let y = 0; y < 8; y++) {
            const center = (y * 64 + 32) + 20
            result.setFillColor(rgb(255, 255, 255))
            result.textAlign("center")
            result.textBaseline("middle")

            const gridNum = flipped ? y : (7 - y)

            result.fillText(10, center, (gridNum + 1).toString())
            result.fillText(center, 552 - 10, numberToFile[7 - gridNum])
        }
        return result
    }

    private renderChessboard(): Image {
        const result: Image = new Image(512, 512)
        let white: boolean = true
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (white) {
                    result.setFillColor(rgb(239, 216, 180))
                }
                else {
                    result.setFillColor(rgb(180, 135, 98))
                }
                result.fillRect(x * 64, y * 64, 64, 64)
                white = !white
            }
            white = !white
        }
        return result
    }

    private renderPieces(canvas: Image, status: any, flipped: boolean): void {
        const fileToNumber = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7}
        for (const square of status.board.squares) {
            if (square.piece !== null) {
                let x = fileToNumber[square.file]
                let y = square.rank - 1

                if (flipped) {
                    x = 7 - x
                    y = 7 - y
                }

                const pieceName = square.piece.type
                const sideName = square.piece.side.name
                this.renderPiece(canvas, pieceName, sideName, x, y)
            }
        }
    }

    private renderPiece(canvas: Image, piece: string, side: string, x: number, y: number): void {
        const pieceImage: Image = this.pieceImages[side][piece]

        if (pieceImage !== null) {
            canvas.composite(pieceImage, x * 64 + 4, (7 - y) * 64 + 4, 56, 56)
        }
    }
}
