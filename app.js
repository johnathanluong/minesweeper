document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid');
	const flagsRemaining = document.querySelector('#flags-remaining');
	const result = document.querySelector('#result');
	const resetButton = document.querySelector('#reset-button');
	const width = 10;
	let flags = 0;
	let bombCount = 20;
	let squares;
	let isGameOver = false;
	let bombPositions = [];

	/**
	 * Reveals a square on the board and recursively reveals neighboring squares if the square is empty.
	 * @param {HTMLElement} square - The square to be revealed.
	 */
	const revealSquare = (square) => {
		let isRevealed = square.classList.contains('revealed');
		let isFlagged = square.classList.contains('flag');
		let isBomb = square.classList.contains('bomb');

		if (isGameOver || isRevealed || isFlagged) {
			return;
		}

		if (isBomb) {
			gameOver();
		} else {
			let total = square.getAttribute('data');
			square.classList.add('revealed');
			if (total != 0) {
				square.textContent = total;
				return;
			}

			const row = Math.floor(parseInt(square.id) / width);
			const col = parseInt(square.id) % width;
			revealNeighbors(row, col);
		}
	};

	/**
	 * Adds or removes a flag to the square and checks if the game is complete
	 * @param {HTMLElement} square - The square to be flagged.
	 */
	const addFlag = (square) => {
		if (isGameOver) {
			return;
		}

		let isRevealed = square.classList.contains('revealed');
		let isFlagged = square.classList.contains('flag');

		// Checks if the square has been revealed
		if (!isRevealed && flags < bombCount) {
			if (!isFlagged) {
				square.classList.add('flag');
				++flags;
				square.innerHTML = "<span><i class='fa fa-flag'/></span>";
				flagsRemaining.innerHTML = bombCount - flags;
				checkWin();
			} else {
				square.classList.remove('flag');
				--flags;
				square.innerHTML = '';
				flagsRemaining.innerHTML = bombCount - flags;
			}
		} else if (isFlagged) {
			square.classList.remove('flag');
			--flags;
			square.innerHTML = '';
			flagsRemaining.innerHTML = bombCount - flags;
		}
	};

	/**
	 * Gets the surrounding squares and reveals them using revealSquare()
	 * @param {number} row - The row index of the square
	 * @param {number} col - The column index of the square
	 */
	const revealNeighbors = (row, col) => {
		const directions = [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -1],
			[0, 1],
			[1, -1],
			[1, 0],
			[1, 1]
		];

		for (const [dx, dy] of directions) {
			const newRow = row + dx;
			const newCol = col + dy;

			if (newRow >= 0 && newRow < width && newCol >= 0 && newCol < width) {
				const square = squares[newRow][newCol];
				revealSquare(square);
			}
		}
	};

	/**
	 * Checks to see if the game is in the win state, check if all bomb squares are flagged
	 */
	const checkWin = () => {
		let matches = 0;

		for (const [row, col] of bombPositions) {
			const square = squares[row][col];
			if (square.classList.contains('flag')) {
				++matches;
			}
		}

		if (matches === bombCount) {
			result.innerHTML = 'YOU WON !!!';
			isGameOver = true;
		}
	};

	/**
	 * Puts the game into the loss state
	 */
	const gameOver = () => {
		result.innerHTML = 'BOOOOOOOOOM! Game Over WOMP WOMP!';
		isGameOver = true;

		// Reveals all bombs
		for (const [row, col] of bombPositions) {
			const square = squares[row][col];
			square.innerHTML = "<span><i class='fa fa-bomb'/></span>";
			square.classList.remove('bomb');
			square.classList.add('revealed');
		}
	};

	/**
	 * Creates the board and initializes the squares and bombPositions arrays
	 */
	const createBoard = () => {
		flagsRemaining.innerHTML = bombCount;

		// Creates an empty gameArray filled with undefined, then maps bomb to the first bombCount number of elements and the rest as valid
		const gameArray = Array(width * width)
			.fill()
			.map((_, index) => (index < bombCount ? 'bomb' : 'valid'));

		// Shuffles the array
		const shuffledArray = shuffleArray(gameArray);

		bombPositions = [];
		squares = Array.from({ length: width }, () => []);

		// Creates and sets up each square on the board
		for (let row = 0; row < width; row++) {
			for (let col = 0; col < width; col++) {
				// Create a div for each square
				const square = document.createElement('div');

				// Set the id and the corresponding class to the square from shuffledArray
				const i = row * width + col;
				square.id = i;
				square.classList.add(shuffledArray[i]);

				// Add row and column indices to bombPosition if square is a bomb
				if (square.classList.contains('bomb')) {
					bombPositions.push([row, col]);
				}

				// Append the square to the grid
				grid.appendChild(square);
				squares[row][col] = square;

				// Left-click to reveal square
				square.addEventListener('click', () => {
					revealSquare(square);
				});

				// Shift-click to add flag
				square.addEventListener('contextmenu', () => {
					addFlag(square);
				});
			}
		}

		// Calculates each square's data based on the surrounding bombs
		for (let row = 0; row < width; row++) {
			for (let col = 0; col < width; col++) {
				const square = squares[row][col];
				if (square.classList.contains('valid')) {
					const surroundingBombs = countSurroundingBombs(row, col);
					square.setAttribute('data', surroundingBombs);
				}
			}
		}
	};

	/**
	 * Resets the board when clicking the resetButton
	 */
	const resetGame = () => {
		grid.innerHTML = '';

		flags = 0;
		isGameOver = false;
		squares = [];

		flagsRemaining.textContent = bombCount;
		result.textContent = '';

		createBoard();
	};

	// Adds reset button functionality
	resetButton.addEventListener('click', () => {
		resetGame();
	});

	/**
	 * Counts the number of surrounding bombs for a given square
	 * @param {number} row - The row index of the square
	 * @param {number} col - The column index of the square
	 * @returns {number} The count of surrounding bombs
	 */
	const countSurroundingBombs = (row, col) => {
		const directions = [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -1],
			[0, 1],
			[1, -1],
			[1, 0],
			[1, 1]
		];

		let count = 0;

		for (const [dx, dy] of directions) {
			const newRow = row + dx;
			const newCol = col + dy;

			if (
				newRow >= 0 &&
				newRow < width &&
				newCol >= 0 &&
				newCol < width &&
				squares[newRow][newCol].classList.contains('bomb')
			) {
				++count;
			}
		}

		return count;
	};

	createBoard();
});

/**
 * Shuffles the array using Knuth shuffle algorithm
 * @param {Array} arr
 * @returns {Array} arr - Shuffled array
 */
const shuffleArray = (arr) => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};
