

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
const rightSound = new Audio('right.wav');
const leftSound = new Audio('left.wav');
const upSound = new Audio('up.wav');
const downSound = new Audio('down.wav');

// Timing variables for sound
let lastHorizontalSoundPlayTime = 0;
let lastVerticalSoundPlayTime = 0;

let randomHorizontalInterval = 0
let randomVerticalInterval = 0

// Posiziona il cerchio e la palla al centro dello schermo
circle.style.left = `${centerX - radius}px`;
circle.style.top = `${centerY - radius}px`;
ball.style.left = `${centerX - 10}px`;
ball.style.top = `${centerY - 10}px`;

let speedFactor=30;

let trialNumber=5;
let currentTrial=0;

let dataCSV="Trial, SoundSpeed, SoundAngle, MovSpeed, MovAngle, soundStart, startDragTime, endDragTime\n";


// Funzione per generare intervalli casuali
function generateRandomIntervals() {
    // Gli intervalli rappresentano i ritmi a cui vengono riprodotti i suoni, espressi in millisecondi
    // Vanno da un minimo di 400 ms (seminima) a un massimo di 1600 ms (semibreve) e possono assumere valori continui
    randomHorizontalInterval = Math.random() * (1600 - 200) + 200;
    randomVerticalInterval = Math.random() * (1600 - 200) + 200;

    // Genera velocità casuali orizzontali e verticali, in base agli intervalli generati sopra.
    // Queste velocità saranno usate nella funzione updatePositionAndSounds(), dove vengono moltiplicate per il deltaTime
    // (cioè il tempo trascorso tra un aggiornamento e l'altro, espresso in millisecondi).
    // Pertanto, queste velocità corrispondono a velocità per millisecondo.
    horizontalSpeed = (Math.random() < 0.5 ? -1 : 1) * (speedFactor / randomHorizontalInterval);
    verticalSpeed = (Math.random() < 0.5 ? -1 : 1) * (speedFactor / randomVerticalInterval);
}

// Calcola la velocità totale in pixel al secondo
function calculateTotalSpeed() {
    // Poiché horizontalSpeed e verticalSpeed rappresentano velocità in pixel per millisecondo (vedi funzione updatePositionAndSounds),
    // per ottenere la velocità totale in pixel al secondo è necessario moltiplicare per 1000 (ms in un secondo).
    return Math.sqrt(horizontalSpeed * horizontalSpeed + verticalSpeed * verticalSpeed) * 1000;
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

// Aggiorna la posizione della palla e riproduce i suoni in base alle velocità e direzioni
function updatePositionAndSounds(timestamp) {
    // Inizializza il timestamp del precedente aggiornamento se non è già definito
    if (!lastUpdateTime) {
        lastUpdateTime = timestamp;
    }

    // Calcola il tempo trascorso (in millisecondi) dall'ultimo aggiornamento
    const deltaTime = (timestamp - lastUpdateTime);
    lastUpdateTime = timestamp;

    // L'uso di deltaTime rende il movimento della palla e la gestione dei suoni
    // indipendenti dal framerate. In questo modo, gli aggiornamenti sono basati
    // sul tempo effettivamente trascorso (in millisecondi) tra i frame, garantendo
    // comportamenti uniformi su dispositivi con differenti frequenze di aggiornamento.

    // Procedi solo se il movimento della palla è iniziato
    if (movementStarted) {
        // Aggiorna le coordinate della palla in base alle velocità e al tempo trascorso
        // (le velocità sono espresse in pixel per millisecondo - vedi righe sotto dove si usano valori in px)
        posX += horizontalSpeed * deltaTime;
        posY += verticalSpeed * deltaTime;

        // Modifica la posizione visiva della palla nell'interfaccia.
        ball.style.left = `${posX - 10}px`;
        ball.style.top = `${posY - 10}px`;

        // Aggiorna i valori degli indicatori di velocità e direzione nell'interfaccia
        updateIndicators();

        // Riproduci i suoni in base alla velocità e alla direzione orizzontale/verticale
        const now = timestamp; // Timestamp attuale per il confronto con gli intervalli

        // Gestione dei suoni orizzontali
        if (horizontalSpeed > 0) { // Se la palla si muove verso destra
            if (now - lastHorizontalSoundPlayTime >= randomHorizontalInterval) {
                playSound(rightSound); // Riproduce il suono per la direzione destra
                lastHorizontalSoundPlayTime = now; // Aggiorna il timestamp dell'ultimo suono
            }
        } else if (horizontalSpeed < 0) { // Se la palla si muove verso sinistra
            if (now - lastHorizontalSoundPlayTime >= randomHorizontalInterval) {
                playSound(leftSound); // Riproduce il suono per la direzione sinistra
                lastHorizontalSoundPlayTime = now; // Aggiorna il timestamp dell'ultimo suono
            }
        }

        // Gestione dei suoni verticali
        if (verticalSpeed > 0) { // Se la palla si muove verso il basso
            if (now - lastVerticalSoundPlayTime >= randomVerticalInterval) {
                playSound(downSound); // Riproduce il suono per la direzione giù
                lastVerticalSoundPlayTime = now; // Aggiorna il timestamp dell'ultimo suono
            }
        } else if (verticalSpeed < 0) { // Se la palla si muove verso l'alto
            if (now - lastVerticalSoundPlayTime >= randomVerticalInterval) {
                playSound(upSound); // Riproduce il suono per la direzione su
                lastVerticalSoundPlayTime = now; // Aggiorna il timestamp dell'ultimo suono
            }
        }

        // Controlla se la palla è ancora all'interno di un cerchio definito
        // Se la palla esce, resetta la posizione al centro
        if (!isWithinCircle(posX, posY)) {
            resetPosition();
        }
    }

    // Pianifica il prossimo aggiornamento animato con requestAnimationFrame
    // Questo metodo chiama la funzione alla prossima opportunità di ridisegno,
    // ma il comportamento rimane indipendente dal framerate grazie al calcolo
    // basato su deltaTime.
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
	generateRandomIntervals(); // Genera nuove velocità casuali
    resetPosition(); // Resetta la posizione iniziale
    movementStarted = true; // Inizia il movimento
    //updatePositionAndSounds(); // Inizia il ciclo di aggiornamento
	soundStart = Date.now();	// Salva il momento di inizio di riproduzione del suono
	document.getElementById('soundStartTime').innerHTML = soundStart;
	document.getElementById('dragStartTime').innerHTML = "";
	document.getElementById('dragStopTime').innerHTML = "";
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
ballDrag.addEventListener('mousedown', startDrag);
ballDrag.addEventListener('touchstart', startDrag, { passive: false });

function startDrag(event) {
    event.preventDefault(); // Previene effetti collaterali
    isDragging = true;

    // Gestisce sia l'evento mouse che touch
    const point = event.touches ? event.touches[0] : event;
    startX = point.clientX;
    startY = point.clientY;
    startTime = Date.now(); // Guarda il tempo di inizio
	document.getElementById("dragStartTime").innerHTML = startTime;
    //reactionTime = (startTime - soundStart) / 1000;	// Calcola il tempo di reazione dell'utente
}

// Durante el drag
document.addEventListener('mousemove', handleDrag);
document.addEventListener('touchmove', handleDrag, { passive: false });

function handleDrag(event) {
    if (isDragging) {
        // Gestisce le coordinate per touch e mouse
        const point = event.touches ? event.touches[0] : event;
        currentX = point.clientX;
        currentY = point.clientY;

        const dist = distanceFromCenter(currentX, currentY);

        if (dist <= radius-7) {
            // Mueve la bola solo dentro del círculo
            ballDrag.style.left = `${currentX - 10}px`;
            ballDrag.style.top = `${currentY - 10}px`;
        } else {
            // Cambia colore del cerchio e calcola direzione/velocità al bordo
            circle.style.borderColor = "yellow";
	    ball.style.opacity = '1';
	    ballDrag.style.opacity = '0';
            const direction = calculateDirectionG(currentX, currentY);
            const elapsedTime = (Date.now() - startTime) / 1000; // Tiempo en segundos
            const speed = dist / elapsedTime; // Velocidad en píxeles/segundo
			const endDragTime = Date.now();	// Salva il momento di fine del drag
			document.getElementById("dragStopTime").innerText = endDragTime;
            document.getElementById("speedG").innerText = speed;
            document.getElementById("directionG").innerText = direction;

            dataCSV += `${currentTrial},${document.getElementById("speed").innerText},${document.getElementById("direction").innerText},${speed},${direction},${soundStart},${startTime},${endDragTime}\n`;

            setTimeout(() => {
		ball.style.opacity = '0';
		ballDrag.style.opacity = '1';
                // Regresa la bola al centro
                circle.style.borderColor = "black";
                ballDrag.style.left = `${centerX - 10}px`;
                ballDrag.style.top = `${centerY - 10}px`;
                newRandomSequence();
                document.getElementById("speedG").innerText = "x";
                document.getElementById("directionG").innerText = "y";
                currentTrial++;

                document.getElementById('currentT').innerHTML = currentTrial + 1;

                if (trialNumber == currentTrial) {
                    console.log(dataCSV);
                    downloadCSV(dataCSV);

                    alert("Experiment end");

                    document.body.style.display = "none";
                }
            }, 4000);

            // Forza il final del drag
            isDragging = false;
        }
    }
}


// Finalizar drag
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function endDrag() {
    isDragging = false;

    // Restablece la posición al centro si se interrumpe el drag
    ballDrag.style.left = `${centerX - 10}px`;
    ballDrag.style.top = `${centerY - 10}px`;
}


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






/*

let lastPosition = ball.getBoundingClientRect(); // Posizione iniziale
let intervalId = setInterval(() => {
    // Ottieni la posizione attuale della palla
    const currentPosition = ball.getBoundingClientRect();
    
    // Calcola lo spostamento su X e Y
    const deltaX = currentPosition.left - lastPosition.left;
    const deltaY = currentPosition.top - lastPosition.top;
    
    // Calcola la distanza percorsa (spostamento totale)
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    
    // Calcola la velocità (distanza percorsa in 200 ms -> scala in secondi)
    const speed = distance; // 0.2 secondi = 200 ms
    
    console.log(`Velocità: ${speed.toFixed(2)} pixel/s`);
    
    // Aggiorna la posizione precedente
    lastPosition = currentPosition;
}, 1000);




*/