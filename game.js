
function initializeGame() {
	gameState.board = Array(9).fill('');
	gameState.currentPlayer = playerSymbol;
	gameState.gameOver = false;
	gameState.winningCombination = null;
	
	cells.forEach(cell => {
		cell.textContent = '';
		cell.classList.remove('x-cell', 'o-cell', 'winning-cell');
	});
	
	status.textContent = 'Your turn (X)';
	updateScore();
}

function updateScore() {
	playerScoreElem.textContent = scores.player;
	drawScoreElem.textContent = scores.draw;
	aiScoreElem.textContent = scores.ai;
}

function handleCellClick(event) {
	if (gameState.gameOver) {
		return;
	}
	
	if (gameState.currentPlayer !== playerSymbol) {
		return;
	}

	const cell = event.target;
	if (!cell.classList.contains('cell')) return;

	const index = cell.dataset.index;
	if (gameState.board[index] !== '') return;

	makeMove(index, playerSymbol);
	
	if (!gameState.gameOver) {
		setTimeout(() => {
			aiMove();
		}, 300);
	}
}

function makeMove(index, player) {
	gameState.board[index] = player;
	cells[index].textContent = player;
	cells[index].classList.add(player === playerSymbol ? 'x-cell' : 'o-cell');

	checkGameStatus();
	
	if (!gameState.gameOver) {
		gameState.currentPlayer = gameState.currentPlayer === playerSymbol ? opponentSymbol : playerSymbol;
		status.textContent = gameState.currentPlayer === playerSymbol ? 'Your turn (X)' : 'AI thinking... (O)';
	}
}

function aiMove() {
	if (gameState.gameOver) return;
	
	const bestMove = findBestMove(gameState.board);
	makeMove(bestMove, opponentSymbol);
}

function checkWinner(board) {
	const winPatterns = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8],
		[0, 3, 6], [1, 4, 7], [2, 5, 8],
		[0, 4, 8], [2, 4, 6]
	];

	for (const pattern of winPatterns) {
		const [a, b, c] = pattern;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			gameState.winningCombination = pattern;
			return board[a];
		}
	}

	return board.includes('') ? null : 'draw';
}

function checkGameStatus() {
	if (checkWinner(gameState.board) !== null && checkWinner(gameState.board) !== 'draw') {
		gameState.gameOver = true;  
		highlightWinningCells(gameState.winningCombination);
		const combinationIndex = gameState.winningCombination[0];
		
		if (gameState.board[combinationIndex] === playerSymbol) {
			status.textContent = 'You win!';
			scores.player++;
		} else {
			status.textContent = 'Computer wins!';
			scores.ai++;
		}
		
		updateScore();
		return;
	}

	// Check for draw
	if (!gameState.board.includes('')) {
		gameState.gameOver = true;
		status.textContent = 'Game ended in a draw!';
		scores.draw++;
		updateScore();
	}
}

function highlightWinningCells(pattern) {
	for (const index of pattern) {
		cells[index].classList.add('winning-cell');
	}
}

function restartGame() {
	initializeGame();
}

function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
	const result = checkWinner(board);
	if (result !== null) {
		return result === playerSymbol ? -10 + depth : result === opponentSymbol ? 10 - depth : 0;
	}

	if (isMaximizing) {
		let bestScore = -Infinity;
		for (let i = 0; i < board.length; i++) {
			if (board[i] === '') {
				board[i] = opponentSymbol;
				const score = minimax(board, depth + 1, false, alpha, beta);
				board[i] = '';
				bestScore = Math.max(score, bestScore);
				alpha = Math.max(alpha, bestScore);
				if (beta <= alpha) {
					break; // Alpha-beta pruning
				} 
			}
		}
		return bestScore;
	} else {
		let bestScore = Infinity;
		for (let i = 0; i < board.length; i++) {
			if (board[i] === '') {
				board[i] = playerSymbol;
				const score = minimax(board, depth + 1, true, alpha, beta);
				board[i] = '';
				bestScore = Math.min(score, bestScore);
				beta = Math.min(beta, bestScore);
				if (beta <= alpha) {
					break;
				} 
			}
		}
		return bestScore;
	}
}

function findBestMove(board) {
	let bestScore = -Infinity;
	let bestMove = -1;
	
	// Start with center position if available (optimization for first move)
	if (board[4] === '') {
		return 4;
	}
	
	// Check if AI can win in the next move
	for (let i = 0; i < board.length; i++) {
		if (board[i] === '') {
			board[i] = opponentSymbol;
			if (checkWinner(board) === opponentSymbol) {
				board[i] = '';
				return i;
			}
			board[i] = '';
		}
	}
	
	// Check if player can win in the next move and block
	for (let i = 0; i < board.length; i++) {
		if (board[i] === '') {
			board[i] = playerSymbol;
			if (checkWinner(board) === playerSymbol) {
				board[i] = '';
				return i;
			}
			board[i] = '';
		}
	}
	
	// Otherwise use minimax to find best move
	for (let i = 0; i < board.length; i++) {
		if (board[i] === '') {
			board[i] = opponentSymbol;
			const score = minimax(board, 0, false);
			board[i] = '';
			if (score > bestScore) {
				bestScore = score;
				bestMove = i;
			}
		}
	}
	
	return bestMove;
}

const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const playerScoreElem = document.getElementById('player-score');
const drawScoreElem = document.getElementById('draw-score');
const aiScoreElem = document.getElementById('computer-score');

const playerSymbol = 'X';
const opponentSymbol = 'O';

let scores = {
	player: 0,
	draw: 0,
	ai: 0
};

let gameState = {
	board: Array(9).fill(''),
	currentPlayer: playerSymbol,
	gameOver: false,
	winningCombination: null
};

initializeGame();

boardElement.addEventListener('click', handleCellClick);
restartBtn.addEventListener('click', restartGame);