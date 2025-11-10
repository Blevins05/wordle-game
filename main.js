// game "database"
const WORDS = [
    "sport", "score", "track", "teams", "chess", "field", "racer", "jumps", "coach", "shoot", "storm", "cloud", "humid", "frost",
    "drift", "rainy", "snowy", "winds", "foggy", "happy", "angry", "proud", "sadly", "shock", "feary", "gloom", "jolly", "moody",
    "beach", "river", "house", "parks", "tower", "ocean", "plaza", "urban", "rural", "hotel", "chair", "table", "books", "couch",
    "phone", "lampy", "clock", "brush", "plate", "frame", "music", "party", "dance", "craft", "games", "drink", "songs", "laugh",
    "shine", "smile"
];

// colors
const GREEN = 'rgb(52.33, 188.3, 70.71)'
const YELLOW = 'rgb(249.48, 239.35, 71.2)'
const GREY = 'rgb(187.7, 196.42, 191.19)'

const ROWS = 6;
const COLS = 5;
let currentRow = 0;
let currentCol = 0;

const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('.modal-close')

// improving UI experience

// avoid horiontal scroll when modal appears
const getScrollbarWidth = () => {
    return window.innerWidth - document.documentElement.clientWidth;
};

const showModal = (msg) => {
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.marginRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';

    modalMessage.textContent = msg;
    modal.classList.remove('hidden');
}

const hideModal = () => {
    document.body.style.marginRight = '';
    document.body.style.overflow = '';

    modal.classList.add('hidden');
}

// game logic

const drawGrid = () => {
    const main = document.getElementById("game");
    if (!main) {
        console.error("Element with ID 'game' not found!");
        return;
    }

    main.innerHTML = '';
    for (let i = 0; i < ROWS; i++) {
        const wordRow = document.createElement("div");
        wordRow.classList.add("word");

        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            wordRow.appendChild(cell);
        }
        main.appendChild(wordRow);
    }
};

drawGrid();

const generateRandomWord = () => {
    return WORDS[Math.floor(Math.random() * WORDS.length)]
}

const solution = generateRandomWord().toUpperCase();
console.log(solution)

const isValidWord = async (word) => {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return response.ok;
    } catch (err) {
        console.error("Error validating the word:", err);
        return false;
    }
};

const getUserInput = () => {
    const wordRow = document.querySelectorAll('.word')[currentRow];
    const cells = wordRow.querySelectorAll('.cell');
    let userInput = "";

    cells.forEach(c => {
        userInput += c.textContent.trim();
    })
    return userInput;
}

const matchColors = (currentAttemp) => {
    let userArray = currentAttemp.split('');
    let tempSolutionArray = [...solution.split('')]; // copy
    const wordRow = document.querySelectorAll('.word')[currentRow];
    const cells = wordRow.querySelectorAll('.cell');
    const keys = Array.from(document.querySelectorAll('.key'));
    const animation_duration = 500; // ms

    for (let i = 0; i < userArray.length; i++) {
        const keyElement = keys.find((key) => key.textContent === userArray[i]);
        setTimeout(() => {
            if (userArray[i] === tempSolutionArray[i]) {
                cells[i].style.background = GREEN;
                tempSolutionArray[i] = null;
                if (keyElement) keyElement.style.background = GREEN;

            } else if (tempSolutionArray.includes(userArray[i])) {
                cells[i].style.background = YELLOW;
                tempSolutionArray[tempSolutionArray.indexOf(userArray[i])] = null;
                if (keyElement) keyElement.style.background = YELLOW;
            } else {
                cells[i].style.background = GREY;
                if (keyElement) keyElement.style.background = GREY;
            }
        }, ((i + 1) * animation_duration) / 2)

        cells[i].classList.add('animated');
        cells[i].style.animationDelay = `${(i * animation_duration) / 2}ms`
    }

    const isWinner = (currentAttemp === solution);
    const isGameOver = currentRow === 5;

    setTimeout(() => {
        if (isWinner) {
            showModal('Winner!! Congratulations')
            cells.forEach(cell => {
                cell.classList.add('win')
            })
        } else if (isGameOver) {
            showModal(`You lost. The secret word was: ${solution}`);
        }
    }, 3 * animation_duration);

}

const handleInputs = () => {
    document.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        const wordRow = document.querySelectorAll('.word')[currentRow];
        const cells = wordRow.querySelectorAll('.cell');

        if (/^[A-Z]$/.test(key)) {
            if (currentCol < cells.length) {
                cells[currentCol].textContent = key;
                currentCol++;
            }
        }
        else if (key === 'BACKSPACE') {
            if (currentCol > 0) {
                currentCol--;
                cells[currentCol].textContent = "";
            }

        } else if (key === "ENTER") {
            if (currentCol === cells.length) {
                const userInput = getUserInput();
                isValidWord(userInput).then((isValid) => {
                    if (isValid) {
                        matchColors(userInput)
                        currentRow++;
                        currentCol = 0;
                    } else {
                        showModal("Word does not exist.")
                        cells.forEach(cell => {
                            cell.classList.add('error')
                        })
                        setTimeout(() => {
                            hideModal();
                        }, 1000)
                    }
                })

            } else {
                showModal("Not enough letters");
                cells.forEach(cell => {
                    cell.classList.add('error');
                });
                setTimeout(() => {
                    hideModal();
                }, 1000)
            }
        }
        cells.forEach(cell => {
            cell.classList.remove('error')
        })
    });
}

handleInputs();
















