
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('debug')) {
  document.getElementById('info').style.display = 'block';
} else {
  document.getElementById('info').style.display = 'none';
}

const ball = document.getElementById("ball");
const circle = document.getElementById("circle");
const speedIndicator = document.getElementById("speed");
const directionIndicator = document.getElementById("direction");

const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const radius = 200; // Radius of the circle

let posX = centerX;
let posY = centerY;

let horizontalSpeed = 0;
let verticalSpeed = 0;

let lastHorizontalPress = 0;
let lastVerticalPress = 0;

let horizontalSet = false;
let verticalSet = false;

let movementStarted = false;
let lastUpdateTime = null;

// Suoni
const rightSound = new Audio('right.wav');
const leftSound = new Audio('left.wav');
const upSound = new Audio('up.wav');
const downSound = new Audio('down.wav');

// Timing variables for sound
let horizontalRhythm = 0;
let verticalRhythm = 0;
let lastHorizontalSoundPlayTime = 0;
let lastVerticalSoundPlayTime = 0;

// Posiziona il cerchio e la palla al centro dello schermo
circle.style.left = `${centerX - radius}px`;
circle.style.top = `${centerY - radius}px`;
ball.style.left = `${centerX - 10}px`;
ball.style.top = `${centerY - 10}px`;

let speedFactor = 300;

let maxTrainingTrials = 40;

document.getElementById('totalT').innerHTML = maxTrainingTrials;

let currentTrainingTrial = 1;
document.getElementById('currentT').innerHTML = currentTrainingTrial;


// Funzione per calcolare la velocità in base all'intervallo di tempo tra le pressioni dei tasti
function calculateSpeed(interval) {
    return speedFactor / interval; // La velocità è inversamente proporzionale al tempo
}

// Calcola la velocità totale in pixel al secondo
function calculateTotalSpeed() {
    return Math.sqrt(horizontalSpeed * horizontalSpeed + verticalSpeed * verticalSpeed) * 60; // Moltiplica per 60 per ottenere pixel/secondo (supponendo 60fps)
}

// Calcola la direzione in gradi (0-360)
function calculateDirection() {
    return Math.atan2(verticalSpeed, horizontalSpeed) * (180 / Math.PI);
}

// Aggiorna gli indicatori di velocità e direzione
function updateIndicators() {
    const speed = calculateTotalSpeed();
    const direction = calculateDirection();
    speedIndicator.textContent = Math.round(speed);
    directionIndicator.textContent = Math.round((direction + 360) % 360); // Assicura che la direzione sia tra 0-360°
}

// Controlla se la palla è all'interno del cerchio
function isWithinCircle(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
}

// Resetta la posizione della palla al centro e ferma il movimento
function resetPosition() {
    posX = centerX;
    posY = centerY;
    ball.style.left = `${posX - 10}px`;
    ball.style.top = `${posY - 10}px`;

    // Resetta tutti i parametri
    horizontalSpeed = 0;
    verticalSpeed = 0;
    lastHorizontalPress = 0;
    lastVerticalPress = 0;
    horizontalSet = false;
    verticalSet = false;
    movementStarted = false;

    // Ferma la riproduzione dei suoni
    rightSound.pause();
    leftSound.pause();
    upSound.pause();
    downSound.pause();

    updateIndicators(); // Aggiorna gli indicatori di velocità e direzione
	
	currentTrainingTrial++;
	document.getElementById('currentT').innerHTML = currentTrainingTrial;
		
	if (currentTrainingTrial-1==maxTrainingTrials) {
		document.body.style.display="none";
		alert ("Training terminato");
	}
}

// Riproduce un suono
function playSound(sound) {
    sound.currentTime = 0; // Riavvia il suono dall'inizio
    sound.play();
}

// Aggiorna la posizione della palla e i suoni
function updatePositionAndSounds(timestamp) {
    if (!lastUpdateTime) {
        lastUpdateTime = timestamp;
    }

    const deltaTime = (timestamp - lastUpdateTime) / 1000; // Tempo in secondi
    lastUpdateTime = timestamp;

    if (movementStarted) {
        posX += horizontalSpeed * deltaTime * 60; // Velocità per frame (supponendo 60fps)
        posY += verticalSpeed * deltaTime * 60;

        // Aggiorna la posizione della palla
        ball.style.left = `${posX - 10}px`;
        ball.style.top = `${posY - 10}px`;

        // Aggiorna gli indicatori di velocità e direzione
        updateIndicators();

        // Riproduci i suoni in base alle velocità orizzontali e verticali
        const now = timestamp;

        // Gestione suono orizzontale
        if (horizontalSpeed > 0) {
            horizontalRhythm = speedFactor / Math.abs(horizontalSpeed); // Intervallo in millisecondi
            if (now - lastHorizontalSoundPlayTime >= horizontalRhythm) {
                playSound(rightSound);
                lastHorizontalSoundPlayTime = now;
            }
        } else if (horizontalSpeed < 0) {
            horizontalRhythm = speedFactor / Math.abs(horizontalSpeed);
            if (now - lastHorizontalSoundPlayTime >= horizontalRhythm) {
                playSound(leftSound);
                lastHorizontalSoundPlayTime = now;
            }
        }

        // Gestione suono verticale
        if (verticalSpeed > 0) {
            verticalRhythm = speedFactor / Math.abs(verticalSpeed);
            if (now - lastVerticalSoundPlayTime >= verticalRhythm) {
                playSound(downSound);
                lastVerticalSoundPlayTime = now;
            }
        } else if (verticalSpeed < 0) {
            verticalRhythm = speedFactor / Math.abs(verticalSpeed);
            if (now - lastVerticalSoundPlayTime >= verticalRhythm) {
                playSound(upSound);
                lastVerticalSoundPlayTime = now;
            }
        }

        // Se la palla esce dal cerchio, resettare la posizione al centro
        if (!isWithinCircle(posX, posY)) {
            resetPosition();
        }
    }

    requestAnimationFrame(updatePositionAndSounds);
}

// Gestisce gli eventi di pressione dei tasti
window.addEventListener('keydown', (event) => {
    if (movementStarted) {
        return; // Ignora ulteriori input se la palla si sta già muovendo
    }

    const now = new Date().getTime();

    switch (event.key) {
        case 'ArrowRight':
            if (lastHorizontalPress) {
                horizontalSpeed = calculateSpeed(now - lastHorizontalPress);
                horizontalSet = true;
            }
            lastHorizontalPress = now;
            break;
        case 'ArrowLeft':
            if (lastHorizontalPress) {
                horizontalSpeed = -calculateSpeed(now - lastHorizontalPress);
                horizontalSet = true;
            }
            lastHorizontalPress = now;
            break;
        case 'ArrowUp':
            if (lastVerticalPress) {
                verticalSpeed = -calculateSpeed(now - lastVerticalPress);
                verticalSet = true;
            }
            lastVerticalPress = now;
            break;
        case 'ArrowDown':
            if (lastVerticalPress) {
                verticalSpeed = calculateSpeed(now - lastVerticalPress);
                verticalSet = true;
            }
            lastVerticalPress = now;
            break;
    }

    // Inizia il movimento solo se entrambe le componenti orizzontale e verticale sono impostate
    if (horizontalSet && verticalSet) {
        movementStarted = true;
		
    }
});

requestAnimationFrame(updatePositionAndSounds);
