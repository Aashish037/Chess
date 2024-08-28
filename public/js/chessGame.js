const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = '';
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square',
                (rowindex + squareindex) % 2 === 0 ? 'light' : 'dark'
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? "white" : "black");

                // Set innerText for the piece element (you might want to use getPieceUnicode)
                pieceElement.innerText = getPieceUnicode(square);  // Set the appropriate piece symbol here

                // Set draggable if the piece belongs to the player
                pieceElement.draggable = playerRole === square.color;

                // Add dragstart event listener
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        // pieceElement.classList.add('dragging');
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                // Add dragend event listener
                pieceElement.addEventListener("dragend", (e) => {
                    // pieceElement.classList.remove('dragging');
                    draggedPiece = null;
                    sourceSquare = null;
                });

                // Append the piece element to the square element
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) =>{
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSource);
                }
            })

            // Append the square element to the board
            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === 'b'){
        boardElement.classList.add('flipped');
    }
    else{
        boardElement.classList.remove('flipped');
    }

};

const handleMove = (source, target) => {
    // Convert row/col indices to algebraic notation (like 'e2', 'e4')
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",  // Automatically promote to Queen (optional for pawn promotions)
    };

    socket.emit('move', move);
};


const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'p': '♙',  // Pawn
        'r': '♖',  // Rook 
        'n': '♘',  // Knight 
        'b': '♗',  // Bishop 
        'q': '♕',  // Queen 
        'k': '♔',   // King 
        'P': '♙',  // Pawn
        'R': '♖',  // Rook 
        'N': '♘',  // Knight 
        'B': '♗',  // Bishop 
        'Q': '♕',  // Queen 
        'K': '♔'   // King 
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function (role){
    playerRole = role
    renderBoard();
});

socket.on("spectatorRole", function (){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function (fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function (move){
    chess.move(move);
    renderBoard();
})

renderBoard();
