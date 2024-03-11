document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("DOMContentLoaded", () => {
	const grid = document.querySelector(".grid");
	const flagsRemaining = document.querySelector("#flags-remaining");
	const result = document.querySelector("#result");
	const width = 10;
	let flags = 0;
	let bombCount = 20;
	let squares = [];
	let isGameOver = false;

	// Click events
	const click = (square) => {
		let isChecked = square.classList.contains("checked");
		let isFlagged = square.classList.contains("flag");
		let isBomb = square.classList.contains("bomb");

		if (isGameOver || isChecked || isFlagged) {
			return;
		}

		if (isBomb) {
			gameOver();
		} else {
			let total = square.getAttribute("data");
			if (total != 0) {
				square.textContent = total;
				return;
			}
			checkSquare(square);
		}
		square.classList.add("checked");
	};

	const addFlag = (square) => {
		if (isGameOver) {
			return;
		}

		let isChecked = square.classList.contains("checked");
		let isFlagged = square.classList.contains("flag");

		if (!isChecked && flags < bombCount) {
			if (!isFlagged) {
				square.classList.add("flag");
				++flags;
				square.innerHTML = "<span><i class='fa fa-flag'/></span>";
				flagsRemaining.innerHTML = bombCount - flags;
				checkWin();
			} else {
				square.classList.remove("flag");
				--flags;
				square.innerHTML = "";
				flagsRemaining.innerHTML = bombCount - flags;
			}
		}
	};

	const checkWin = () => {
		let matches = 0;

		for (const element of squares) {
			let isFlagged = element.classList.contains("flag");
			let isBomb = element.classList.contains("bomb");

			if (isFlagged && isBomb) {
				++matches;
			}
		}

		if (matches == bombCount) {
			result.innerHTML = "YOU WON !!!";
			isGameOver = true;
		}
	};

	const checkSquare = (square) => {
		const curId = square.id;
		const isLeftEdge = curId % width == 0;
		const isRightEdge = curId % width == width - 1;

		setTimeout(() => {
			// Top-left
			if (curId > 11 && !isLeftEdge) {
				const newId = parseInt(curId) - 1 - width;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Top-middle
			if (curId > 10) {
				const newId = parseInt(curId) - width;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Top-right
			if (curId > 9 && !isRightEdge) {
				const newId = parseInt(curId) + 1 - width;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Left
			if (curId > 0 && !isLeftEdge) {
				const newId = parseInt(curId) - 1;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Right
			if (curId < 98 && !isRightEdge) {
				const newId = parseInt(curId) + 1;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Bottom-Left
			if (curId < 90 && !isLeftEdge) {
				const newId = parseInt(curId) - 1 + width;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Bottom-Middle
			if (curId < 89) {
				const newId = parseInt(curId) + width;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
			// Bottom-Right
			if (curId < 88 && !isRightEdge) {
				const newId = parseInt(curId) + 1 + width;
				const newSquare = document.getElementById(newId);

				click(newSquare);
			}
		}, 10);
	};

	const gameOver = () => {
		result.innerHTML = "BOOOOOOOOOM! Game Over WOMP WOMP!";
		isGameOver = true;

		// show all bombs
		squares.forEach((square) => {
			let squareIsBomb = square.classList.contains("bomb");

			if (squareIsBomb) {
				square.innerHTML = "<span><i class='fa fa-bomb'/></span>";
				square.classList.remove("bomb");
				square.classList.add("checked");
			}
		});
	};

	const shuffleArray = (arr) => {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	};

	// Create our board
	const createBoard = () => {
		flagsRemaining.innerHTML = bombCount;

		// Get shuffled game arrays with random bombs and valid squares
		const bombArray = Array(bombCount).fill("bomb");
		const emptyArray = Array(width * width - bombCount).fill("valid");
		const gameArray = emptyArray.concat(bombArray);
		const shuffledArray = shuffleArray(gameArray);

		// Iterate through all the squares
		for (let i = 0; i < width * width; ++i) {
			// Create a div for the square
			const square = document.createElement("div");

			// Set the id and class to the square based on position in the shuffledArray
			square.id = i;
			square.classList.add(shuffledArray[i]);

			// Left-click to check square
			square.addEventListener("click", () => {
				click(square);
			});
			// Shift-click to add flag
			square.addEventListener("contextmenu", () => {
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
			if (squares[i].classList.contains("valid")) {
				// top-left
				if (
					i > 11 &&
					!isLeftEdge &&
					squares[i - 1 - width].classList.contains("bomb")
				)
					++total;

				// top-middle
				if (i > 10 && squares[i - width].classList.contains("bomb"))
					++total;

				// top-right
				if (
					i > 9 &&
					!isRightEdge &&
					squares[i + 1 - width].classList.contains("bomb")
				)
					++total;

				// left
				if (
					i > 0 &&
					!isLeftEdge &&
					squares[i - 1].classList.contains("bomb")
				)
					++total;

				// right
				if (
					i < 99 &&
					!isRightEdge &&
					squares[i + 1].classList.contains("bomb")
				)
					++total;

				// bottom-left
				if (
					i < 89 &&
					!isLeftEdge &&
					squares[i + width].classList.contains("bomb")
				)
					++total;

				// bottom-middle
				if (i < 90 && squares[i - 1 + width].classList.contains("bomb"))
					++total;

				// bottom-right
				if (
					i < 88 &&
					!isRightEdge &&
					squares[i + 1 + width].classList.contains("bomb")
				)
					++total;

				squares[i].setAttribute("data", total);
			}
		}
	};

	createBoard();
});
