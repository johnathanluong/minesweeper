document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid');
	const flagsRemaining = document.querySelector('#flags-remaining');
	const result = document.querySelector('#result');
	const width = 10;
	let flags = 0;
	let bombCount = 20;
	let squares = [];
	let isGameOver = false;
	let bombPositions;

	/**
	 * Reveals a square on the board and recursively reveals neighboring squares if the square is empty.
	 * @param {HTMLElement} square - The square to be revealed.
	 */
	const revealSquare = (square) => {
		let isChecked = square.classList.contains('checked');
		let isFlagged = square.classList.contains('flag');
		let isBomb = square.classList.contains('bomb');

		if (isGameOver || isChecked || isFlagged) {
			return;
		}

		if (isBomb) {
			gameOver();
		} else {
			let total = square.getAttribute('data');
			if (total != 0) {
				square.textContent = total;
				return;
			}
			square.classList.add('checked');
			revealNeighbors(square);
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

		let isChecked = square.classList.contains('checked');
		let isFlagged = square.classList.contains('flag');

		if (!isChecked && flags < bombCount) {
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
		}
	};

	/**
	 * Gets the surrounding squares and reveals them using revealSquare()
	 * @param {HTMLElement} square
	 */
	const revealNeighbors = (square) => {
		const curId = parseInt(square.id);
		const isLeftEdge = curId % width === 0;
		const isRightEdge = (curId + 1) % width === 0;

		const neighbors = [];

		// Top-left
		if (curId >= width && !isLeftEdge) {
			const newId = curId - 1 - width;
			neighbors.push(newId);
		}

		// Top
		if (curId >= width) {
			const newId = curId - width;
			neighbors.push(newId);
		}

		// Top-right
		if (curId >= width && !isRightEdge) {
			const newId = curId + 1 - width;
			neighbors.push(newId);
		}

		// Left
		if (!isLeftEdge) {
			const newId = curId - 1;
			neighbors.push(newId);
		}

		// Right
		if (!isRightEdge) {
			const newId = curId + 1;
			neighbors.push(newId);
		}

		// Bottom-left
		if (curId < width * (width - 1) && !isLeftEdge) {
			const newId = curId - 1 + width;
			neighbors.push(newId);
		}

		// Bottom
		if (curId < width * (width - 1)) {
			const newId = curId + width;
			neighbors.push(newId);
		}

		// Bottom-right
		if (curId < width * (width - 1) && !isRightEdge) {
			const newId = curId + 1 + width;
			neighbors.push(newId);
		}

		for (const neighbor of neighbors) {
			const newSquare = document.getElementById(neighbor);
			revealSquare(newSquare);
		}
	};

	/**
	 * Checks to see if the game is in the win state, check if all bomb squares are flagged
	 */
	const checkWin = () => {
		let matches = 0;

		for (const element of squares) {
			let isFlagged = element.classList.contains('flag');
			let isBomb = element.classList.contains('bomb');

			if (isFlagged && isBomb) {
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

		// show all bombs
		bombPositions.forEach((position) => {
			squares[position].innerHTML = "<span><i class='fa fa-bomb'/></span>";
			squares[position].classList.remove('bomb');
			squares[position].classList.add('checked');
		});
	};

	/**
	 * Creates the board and initializes the squares array
	 */
	const createBoard = () => {
		flagsRemaining.innerHTML = bombCount;

		// Get shuffled game arrays with random bombs and valid squares
		const bombArray = Array(bombCount).fill('bomb');
		const emptyArray = Array(width * width - bombCount).fill('valid');
		const gameArray = emptyArray.concat(bombArray);
		const shuffledArray = shuffleArray(gameArray);

		bombPositions = new Set(
			shuffledArray.reduce((acc, curr, i) => {
				if (curr === 'bomb') {
					acc.push(i);
				}
				return acc;
			}, [])
		);

		// Iterate through all the squares
		for (let i = 0; i < width * width; ++i) {
			// Create a div for the square
			const square = document.createElement('div');

			// Set the id and class to the square based on position in the shuffledArray
			square.id = i;
			square.classList.add(shuffledArray[i]);

			// Left-click to check square
			square.addEventListener('click', () => {
				revealSquare(square);
			});
			// Shift-click to add flag
			square.addEventListener('contextmenu', () => {
				addFlag(square);
			});

			// Append the square to the grid
			grid.appendChild(square);
			squares.push(square);
		}

		// Iterate through the squares
		for (let i = 0; i < squares.length; ++i) {
			let total = 0;

			// Check if current square is on the left or right edge
			const isLeftEdge = i % width === 0;
			const isRightEdge = i % width === width - 1;

			// Counting the squares around each valid square for bombs
			if (squares[i].classList.contains('valid')) {
				// Top-left
				if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) ++total;

				// Top-middle
				if (i > 10 && squares[i - width].classList.contains('bomb')) ++total;

				// Top-right
				if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) ++total;

				// Left
				if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) ++total;

				// Right
				if (i < 99 && !isRightEdge && squares[i + 1].classList.contains('bomb')) ++total;

				// Bottom-left
				if (i < 89 && !isLeftEdge && squares[i + width].classList.contains('bomb')) ++total;

				// Bottom-middle
				if (i < 90 && squares[i - 1 + width].classList.contains('bomb')) ++total;

				// Bottom-right
				if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) ++total;

				squares[i].setAttribute('data', total);
			}
		}
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
