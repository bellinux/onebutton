

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('debug')) {
  document.getElementById('info').style.display = 'block';
  document.getElementById('ball').style.opacity = 0.5;
} else {
  document.getElementById('info').style.display = 'none';
}


const ball = document.getElementById("ball");
const circle = document.getElementById("circle");
const speedIndicator = document.getElementById("speed");
const directionIndicator = document.getElementById("direction");
const startRandomButton = document.getElementById("startRandom"); // Aggiungi riferimento al pulsante

const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
const radius = 200; // Raggio del cerchio

let posX = centerX;
let posY = centerY;

let horizontalSpeed = 0;
let verticalSpeed = 0;

let lastUpdateTime = null;
let movementStarted = false;

// Suoni
const rightSound = new Audio('right.mp3');
const leftSound = new Audio('left.mp3');
const upSound = new Audio('up.mp3');
const downSound = new Audio('down.mp3');

// Timing variables for sound
let lastHorizontalSoundPlayTime = 0;
let lastVerticalSoundPlayTime = 0;

// Posiziona il cerchio e la palla al centro dello schermo
circle.style.left = `${centerX - radius}px`;
circle.style.top = `${centerY - radius}px`;
ball.style.left = `${centerX - 10}px`;
ball.style.top = `${centerY - 10}px`;

let speedFactor=225;

let trialNumber=5;
let currentTrial=0;

let dataCSV="Trial, SoundSpeed, SoundAngle, MouseSpeed, MouseAngle\n";

// Funzione per generare velocità casuali
function generateRandomSpeed() {
    // Genera una velocità casuale tra 400ms e 1200ms (convertito in pixel per secondo)
    const randomHorizontalSpeed = Math.random() * (1800 - 300) + 300;
    const randomVerticalSpeed = Math.random() * (1800 - 300) + 300;

    // Assegna un segno casuale per determinare la direzione
    horizontalSpeed = (Math.random() < 0.5 ? -1 : 1) * (speedFactor / randomHorizontalSpeed);
    verticalSpeed = (Math.random() < 0.5 ? -1 : 1) * (speedFactor / randomVerticalSpeed);
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
    speedIndicator.textContent = speed;
    directionIndicator.textContent = ((direction + 360) % 360); // Assicura che la direzione sia tra 0-360°
}

// Controlla se la palla è all'interno del cerchio
function isWithinCircle(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
}

// Resetta la posizione della palla al centro
function resetPosition() {
    posX = centerX;
    posY = centerY;
    ball.style.left = `${posX - 10}px`;
    ball.style.top = `${posY - 10}px`;


/*
    // Ferma la riproduzione dei suoni
    rightSound.pause();
    leftSound.pause();
    upSound.pause();
    downSound.pause();
	*/

    updateIndicators(); // Aggiorna gli indicatori di velocità e direzione
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
            if (now - lastHorizontalSoundPlayTime >= speedFactor / Math.abs(horizontalSpeed)) {
                playSound(rightSound);
                lastHorizontalSoundPlayTime = now;
            }
        } else if (horizontalSpeed < 0) {
            if (now - lastHorizontalSoundPlayTime >= speedFactor / Math.abs(horizontalSpeed)) {
                playSound(leftSound);
                lastHorizontalSoundPlayTime = now;
            }
        }

        // Gestione suono verticale
        if (verticalSpeed > 0) {
            if (now - lastVerticalSoundPlayTime >= speedFactor / Math.abs(verticalSpeed)) {
                playSound(downSound);
                lastVerticalSoundPlayTime = now;
            }
        } else if (verticalSpeed < 0) {
            if (now - lastVerticalSoundPlayTime >= speedFactor / Math.abs(verticalSpeed)) {
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

// Gestisce l'evento di pressione del pulsante "startRandom"
startRandomButton.addEventListener('click', () => {
	newRandomSequence();
	startRandomButton.style.display = "none";
	document.getElementById('instr').style.display = 'block';
	document.getElementById('status').style.display = 'block';
	document.getElementById('currentT').innerHTML = "1"
	document.getElementById('totalT').innerHTML = trialNumber;
	
});

function newRandomSequence(){
	generateRandomSpeed(); // Genera nuove velocità casuali
    resetPosition(); // Resetta la posizione iniziale
    movementStarted = true; // Inizia il movimento
    updatePositionAndSounds(); // Inizia il ciclo di aggiornamento
}

// Inizia il ciclo di aggiornamento
requestAnimationFrame(updatePositionAndSounds);





const ballDrag = document.getElementById("ballDrag");

let isDragging = false;
let startX, startY, startTime;
let currentX, currentY;

// Coloca la bola en el centro
ballDrag.style.left = `${centerX - 10}px`;
ballDrag.style.top = `${centerY - 10}px`;

// Función para calcular la distancia desde el centro
function distanceFromCenter(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Función para calcular la dirección en grados (0-360)
function calculateDirectionG(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    return (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
}

// Iniciar drag
ballDrag.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startTime = Date.now(); // Guarda el tiempo de inicio
    event.preventDefault(); // Previene efectos colaterales del evento drag
});

// Durante el drag
document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        currentX = event.clientX;
        currentY = event.clientY;

        const dist = distanceFromCenter(currentX, currentY);

        if (dist <= radius) {
            // Mueve la bola solo dentro del círculo
            ballDrag.style.left = `${currentX - 10}px`;
            ballDrag.style.top = `${currentY - 10}px`;
        } else {
            // Calcula dirección y velocidad cuando llega al borde del círculo
			circle.style.borderColor="yellow";
            const direction = calculateDirectionG(currentX, currentY);
            const elapsedTime = (Date.now() - startTime) / 1000; // Tiempo en segundos
            const speed = dist / elapsedTime; // Velocidad en píxeles/segundo

            //console.log(`Velocidad: ${speed.toFixed(2)} px/s, Dirección: ${direction.toFixed(2)}°`);
			document.getElementById("speedG").innerText = speed;
			document.getElementById("directionG").innerText = direction;
			
			dataCSV+=currentTrial+"," + document.getElementById("speed").innerText + "," + document.getElementById("direction").innerText + "," + speed + "," + direction + "\n";

			
			setTimeout(() => {
				// Regresa la bola al centro
				circle.style.borderColor="black";
				ballDrag.style.left = `${centerX - 10}px`;
				ballDrag.style.top = `${centerY - 10}px`;
				newRandomSequence();
				document.getElementById("speedG").innerText = "x";
				document.getElementById("directionG").innerText = "y";
				currentTrial++;
				
				document.getElementById('currentT').innerHTML = currentTrial+1;
				
				if (trialNumber==currentTrial){
					
					console.log(dataCSV);
					downloadCSV(dataCSV);
					
					alert("Experiment end");
					
					document.body.style.display = "none";

				}
				
			}, 400);

            
            // Forza el final del drag
            isDragging = false;
			
        }
    }
});

// Finalizar drag
document.addEventListener('mouseup', () => {
    isDragging = false;
    // Restablece la posición al centro si se interrumpe el drag
    ballDrag.style.left = `${centerX - 10}px`;
    ballDrag.style.top = `${centerY - 10}px`;
});

// Prevenir comportamiento inesperado del cursor
ballDrag.addEventListener('dragstart', (event) => {
    event.preventDefault(); // Evita que el navegador interprete un drag nativo
});



function downloadCSV(text) {
    // Genera il timestamp corrente
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Crea il contenuto del file CSV
    const csvContent = `data:text/csv;charset=utf-8,${text}`;

    // Codifica il contenuto come URI
    const encodedUri = encodeURI(csvContent);

    // Crea un elemento <a> temporaneo per il download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${timestamp}.csv`);

    // Aggiungi il link al documento, attiva il download, e rimuovi il link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
