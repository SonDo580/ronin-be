// File: notifier.ts

export enum EventName {
  ROOM_UPDATED = "roomUpdated",
  SELECT_SQUARE = "selectSquare",
  // ... other events
}

interface NotifyCurrentPlayerParams<T> {
  eventName: EventName;
  data?: T;
}

interface NotifyBothPlayersParams<T> extends NotifyCurrentPlayerParams<T> {
  room: Room;
}

export class Notifier {
  constructor(private readonly socket: Socket, private readonly io: Server) {}

  /* Notify players in the room */
  public notifyPlayers<T>({
    eventName,
    data,
    room,
  }: NotifyBothPlayersParams<T>) {
    this.notifyCurrentPlayer({ eventName, data });
    this.notifyOtherPlayer({ eventName, data, room });
  }

  /* Notify current player */
  public notifyCurrentPlayer<T>({
    eventName,
    data,
  }: NotifyCurrentPlayerParams<T>) {
    this.socket.emit(eventName, data);
  }

  /* Notify the other player if they joined */
  private notifyOtherPlayer<T>({
    eventName,
    data,
    room,
  }: NotifyBothPlayersParams<T>) {
    const currentPlayerId = this.socket.id;
    const { otherPlayer } = getPlayers(room, currentPlayerId);

    if (otherPlayer) {
      this.io.to(otherPlayer.id).emit(eventName, data);
    }
  }
}

// ==============================

// File: game.controller.ts
export class GameController {
  /**
   * Handle SELECT_SQUARE event
   * - first click: highlight the valid moves
   * - second click: make a valid move or clear highlight
   */
  public static selectSquareHandler(socket: Socket, io: Server) {
    const notifier = new Notifier(socket, io);

    return (roomId: string, row: number, col: number) => {
      const room = searchRoomById(roomId);

      // Check if the game has already ended
      if (GameController.isGameEnded(room)) {
        return;
      }

      const position = posString(row, col);

      // Make a move if there's a current selection and the move is valid
      if (room.currentSquare && room.moves.includes(position)) {
        GameController.processMove(room, position);
        GameController.notifyPlayers(notifier, room);
        return;
      }

      // Handle selecting a new piece
      if (!GameController.isSquareValidForSelection(room, row, col)) {
        clearSelection(room);
        GameController.notifyPlayers(notifier, room);
        return;
      }

      // Update selected square, valid moves, highlighting
      room.currentSquare = position;
      room.moves = GameController.getValidMoves(room, row, col);
      room.squaresToHighlight = [position, ...room.moves];

      GameController.notifyPlayers(notifier, room);
    };
  }

  private static notifyPlayers(notifier: Notifier, room: Room) {
    notifier.notifyPlayers({
      eventName: EventName.ROOM_UPDATED,
      room,
      data: room,
    });
  }

  /* Check if the game is already ended */
  private static isGameEnded(room: Room) {
    return room.result.kind !== undefined;
  }

  /* Make a move & update room state */
  private static processMove(room: Room, position: SquarePos) {
    const { turn, board, enPassant, castlingRights } = room;
    const currentSquare = room.currentSquare as SquarePos;

    // Update board state after making thee move
    room.board = makeMove(
      board,
      currentSquare,
      position,
      enPassant,
      castlingRights[turn]
    );

    // Handle highlighting state
    room.lastMove = position;
    clearSelection(room);

    // The current king should not be in danger now. Reset 'check' state
    // -> the function name is not good
    checkAttacks(room);

    GameController.updateCastlingRights(room, currentSquare);
    GameController.updateEnPassant(room, currentSquare, position);

    // Handle pawn promotion
    if (needPromotion(room.board, position, turn)) {
      room.needPromotion = true;
      return;
    }

    GameController.update50MoveState(room, currentSquare, position);

    swapTurn(room);

    // check if the opponent king is under attack & update the room's attacked king 
    // -> the name 'check' is not good
    checkAttacks(room);

    // Check for end game & update result if needed 
    // -> the name 'check' is not good
    checkEndGame(room);
  }

  /* Update castling right for current player */
  private static updateCastlingRights(room: Room, currentSquare: SquarePos) {
    const { turn, board, castlingRights } = room;
    const castlingRight = castlingRights[turn];

    // Skip if castling right has been removed for both side (king & queen)
    if (!castlingRight.q && !castlingRight.k) {
      return;
    }

    room.castlingRights[turn] = updateCastlingRight(
      board,
      currentSquare,
      castlingRight
    );
  }

  /* Update en-passant state */
  private static updateEnPassant(
    room: Room,
    currentSquare: SquarePos,
    position: SquarePos
  ) {
    // Reset after making a valid move
    if (room.enPassant.pieces.length > 0) {
      room.enPassant = defaultEnPassantInfo;
      return;
    }

    // Check & update en-passant state
    // -> the function name is not good
    room.enPassant = checkEnPassant(
      room.board,
      currentSquare,
      position,
      room.turn
    );
  }

  /* Update state for 50-Move rule */
  private static update50MoveState(
    room: Room,
    currentSquare: SquarePos,
    position: SquarePos
  ) {
    if (shouldReset50Move(room.board, currentSquare, position)) {
      room.fiftyMoveCount = 0;
      return;
    }
    room.fiftyMoveCount++;
  }

  /* Check if selected square is valid (first click) */
  private static isSquareValidForSelection(
    room: Room,
    row: number,
    col: number
  ) {
    const square = room.board[row][col];

    // Select an empty square
    if (!square) {
      return false;
    }

    // Select the same piece twice
    if (room.currentSquare === posString(row, col)) {
      return false;
    }

    // Select the piece with correct color 
    const [pieceColor] = square;
    return pieceColor === room.turn;
  }

  /* Get valid moves for the selected square */
  private static getValidMoves(room: Room, row: number, col: number) {
    const { board, turn, enPassant, castlingRights } = room;
    return getMoves(board, row, col, turn, enPassant, castlingRights[turn]);
  }
}



// NOTE:
// - This code still needs improvement. I'm directly mutating the 'room' object,
//   which will make it very hard to track changes as the codebase grows larger.
// - To improve traceability, we should use an immutable approach 
//   (creating and returning a new room object).
// - However, there may be performance trade-offs, 
//   as assigning is generally faster than cloning.