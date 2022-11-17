let origBoard;      // дошка
let huPlayer = 'O'; // гравець
let aiPlayer = 'X'; // бот
let player1 = 'X'; // гравець1
let player2 = 'O'; // гравець2
let currentPlayer = player1;
let isGameWithAI;
let gameStarted = false;

const winCombos = [ // виграшні комбінації
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 4, 8],
	[6, 4, 2],
	[2, 5, 8],
	[1, 4, 7],
	[0, 3, 6]
];

const cells = document.querySelectorAll('.cell');
startGame();

/*вибір символа*/
function selectSym(sym) {
	huPlayer = sym;
	aiPlayer = sym === 'O' ? 'X' : 'O';

	// хрестики ходять першими
	if (aiPlayer === 'X') {
		turn(bestSpot(), aiPlayer);
	}
	// приховуємо вікно для вибору символа
	document.querySelector('.selectSym').style.display = "none";
	setEventListeners(cells);
}

function setEventListeners(cells) {
	for (let i = 0; i < cells.length; i++) {
		cells[i].addEventListener('click', turnClick, false);
	}
}
function chooseGameType(gameType) {
	isGameWithAI = gameType === 'Игра с компьютером';
	document.querySelector('.selectGameType').style.display = "none";
	if (isGameWithAI) {
		// показуєм вікно для вибору символа
		document.querySelector('.selectSym').style.display = "block";
	} else {
		setEventListeners(cells);
	}
}

/*початок гри*/
function startGame() {
	// ховаємо вікно з результатом гри
	document.querySelector('.endgame').style.display = "none";
	document.querySelector('.endgame .text').innerText = "";
	origBoard = Array.from(Array(9).keys());
	// показуємо вікно для вибору типу гри
	document.querySelector('.selectGameType').style.display = "block";
	// для гри вдвох
	currentPlayer = player1;
	// очищаємо поле від символів та підсвічування переможної комбінації
	for (let i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
		cells[i].style.removeProperty('background-color');
	}

}

/*обробка ходу гравця*/
function turnClick(cell) {
	// перевірка що хід на порожню клітинку
	if (typeof origBoard[cell.target.id] === 'number') {
		if (isGameWithAI) {
			turn(cell.target.id, huPlayer);
			if (!checkWin(origBoard, huPlayer) && !checkTie())
				turn(bestSpot(), aiPlayer);
		} else {
			turn(cell.target.id, currentPlayer);
		}

	}
}

/*хід*/
function turn(cellId, player) {
	currentPlayer = player === player1 ? currentPlayer = player2 : currentPlayer = player1;
	// записуємо символ гравця в масив
	origBoard[cellId] = player;
	// відображаємо символ у клітинці
	document.getElementById(cellId).innerHTML = player;
	// перевірка на перемогу
	let gameWon = checkWin(origBoard, player);
	if (isGameWithAI) {
		if (gameWon) gameOver(gameWon);
		// перевірка на нічию
		checkTie();
	} else {
		if (gameWon) {
			gameOver(gameWon);
		} else {
			// перевірка на нічию
			checkTie();
		}
	}

}

/*перевірка на перемогу*/
function checkWin(board, player) {
	// отримуємо список ходів для поточного гравця
	// a - акумулятор (повер. значення, поч. ініціалізація - [])
	// e - елемент (клітинка)
	// i - ітератор
	let turns = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
	let gameWon = null; // переможна комбінація гравця
	// пошук по всіх переможних комбінаціях
	for (let [index, win] of winCombos.entries()) {
		// перевіряємо кожен елемент переможної комбінації з ходами гравця
		if (win.every(e => turns.indexOf(e) > -1)) {
			// запам'ятовуємо індекс переможної комбінації та гравця
			gameWon = { index: index, player: player };
			break;
		}
	}
	return gameWon; // null or not
}

/*завершення гри*/
function gameOver(gameWon) {
	// знімаємо слухачі з клітинок
	for (let i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', turnClick, false);
	}
	for (let index of winCombos[gameWon.index]) {
		// фарбуємо клітинки переможної комбінації в синій чи червоний
		// залежно від гравця
		if (isGameWithAI) {
			document.getElementById(index).style.backgroundColor =
				gameWon.player === huPlayer ? "lightblue" : "pink";
		} else {
			document.getElementById(index).style.backgroundColor =
				gameWon.player === player1 ? "lightblue" : "pink";
		}
	}
	// оголошуємо переможця
	if (isGameWithAI) {
		declareResult(gameWon.player === huPlayer ? "ПЕРЕМОГА!" : "Ви програли!");
	} else {
		declareResult(gameWon.player === player1 ? "Переміг гравець 1!" : "Переміг гравець 2!");
	}
}

/*оголошення результату гри*/
function declareResult(result) {
	// показуємо вікно з результатом гри
	document.querySelector(".endgame").style.display = "block";
	document.querySelector(".endgame .text").innerText = result;
	gameStarted = false;
}

/*отримання порожніх клітинок*/
function emptyCells() {
	return origBoard.filter((e, i) => i === e);
}

function bestSpot() {
	return minimax(origBoard, aiPlayer).index;
}

/*Перевірка на нічию*/
function checkTie() {
	if (emptyCells().length === 0) {
		for (let i = 0; i < cells.length; i++) {
			cells[i].style.backgroundColor = "lightgreen";
			cells[i].removeEventListener('click', turnClick, false);
		}
		declareResult("Нічия!");
		return true;
	}
	return false;
}

function minimax(newBoard, player) {
	// доступні клітини
	var availableCells = emptyCells(newBoard);

	if (checkWin(newBoard, huPlayer)) {
		// якщо перемагає гравець, -10
		return { score: -10 };
	} else if (checkWin(newBoard, aiPlayer)) {
		// якщо перемагає комп'ютер, +10
		return { score: 10 };
	} else if (availableCells.length === 0) {
		// якщо більше немає доступних клітинок
		return { score: 0 };
	}

	var moves = [];
	for (let i = 0; i < availableCells.length; i++) {
		var move = {};
		move.index = newBoard[availableCells[i]];
		newBoard[availableCells[i]] = player;

		if (player === aiPlayer)
			move.score = minimax(newBoard, huPlayer).score;
		else
			move.score = minimax(newBoard, aiPlayer).score;

		newBoard[availableCells[i]] = move.index;
		if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
			return move;
		else
			moves.push(move);
	}

	let bestMove, bestScore;
	if (player === aiPlayer) {
		bestScore = -1000;
		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		bestScore = 1000;
		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}