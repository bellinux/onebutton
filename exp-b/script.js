

const urlParams = new URLSearchParams(window.location.search);

let soundPlay=false;
if (urlParams.has('debug')) {
  document.getElementById('info').style.display = 'block';
  document.getElementById('ballAlt').style.opacity = 1;
  soundPlay=true;
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

let speedFactor = 30;

let trialNumber=40;
let currentTrial=0;

let THor, TVer, THorSecond, TVerSecond;

let dataCSV="Trial, RandomSpeed, RandomAngle, UserSpeed, UserAngle, StartMovementTime, THor, TVer, THorSecond, TVerSecond, randomHorizontalInterval, randomVerticalInterval\n";


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

// Funzione per generare velocità casuali
function generateRandomInterval() {
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
    return Math.sqrt(horizontalSpeed * horizontalSpeed + verticalSpeed * verticalSpeed) * 1000; // Moltiplica per 60 per ottenere pixel/secondo (supponendo 60fps)
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
	if (soundPlay){
		sound.currentTime = 0; // Riavvia il suono dall'inizio
		sound.play();
	}
}

var moveBall=true;
// Aggiorna la posizione della palla e i suoni
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

    if (movementStarted || moveBall) {
        posX += horizontalSpeed * deltaTime;
        posY += verticalSpeed * deltaTime;

        // Aggiorna la posizione della palla
        ball.style.left = `${posX - 10}px`;
        ball.style.top = `${posY - 10}px`;

        // Aggiorna gli indicatori di velocità e direzione
        updateIndicators();

        // Riproduci i suoni in base alle velocità orizzontali e verticali
        const now = timestamp;

        // Gestione suono orizzontale
        if (horizontalSpeed > 0) {
            if (now - lastHorizontalSoundPlayTime >= randomHorizontalInterval) {
                playSound(rightSound);
                lastHorizontalSoundPlayTime = now;
            }
        } else if (horizontalSpeed < 0) {
            if (now - lastHorizontalSoundPlayTime >= randomHorizontalInterval) {
                playSound(leftSound);
                lastHorizontalSoundPlayTime = now;
            }
        }

        // Gestione suono verticale
        if (verticalSpeed > 0) {
            if (now - lastVerticalSoundPlayTime >= randomVerticalInterval) {
                playSound(downSound);
                lastVerticalSoundPlayTime = now;
            }
        } else if (verticalSpeed < 0) {
            if (now - lastVerticalSoundPlayTime >= randomVerticalInterval) {
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
	generateRandomInterval(); // Genera nuove velocità casuali
    resetPosition(); // Resetta la posizione iniziale
    movementStarted = true; // Inizia il movimento
    startMovementTime = Date.now();	// Salva il momento di inizio del movimento della pallina
    //updatePositionAndSounds(); // Inizia il ciclo di aggiornamento -- questa linea non sembra necessaria...

	document.getElementById('startMovementTime').innerHTML = startMovementTime;
	document.getElementById('firstHorT').innerHTML = "";
	document.getElementById('secondHorT').innerHTML = "";
	document.getElementById('firstVerT').innerHTML = "";
	document.getElementById('secondVerT').innerHTML = "";
}

// Inizia il ciclo di aggiornamento
requestAnimationFrame(updatePositionAndSounds);
















const speedIndicatorAlt = document.getElementById("speedAlt");
const directionIndicatorAlt = document.getElementById("directionAlt");


const centerXAlt = window.innerWidth / 2;
const centerYAlt = window.innerHeight / 2;
const radiusAlt = 200; // Raggio del cerchio

let posXAlt = centerXAlt;
let posYAlt = centerYAlt;

let horizontalSpeedAlt = 0;
let verticalSpeedAlt = 0;

let lastHorizontalPressAlt = 0;
let lastVerticalPressAlt = 0;

let horizontalSetAlt = false;
let verticalSetAlt = false;

let movementStartedAlt = false;
let lastUpdateTimeAlt = null;

// Posiziona il cerchio e la palla al centro dello schermo
circle.style.left = `${centerXAlt - radiusAlt}px`;
circle.style.top = `${centerYAlt - radiusAlt}px`;
ballAlt.style.left = `${centerXAlt - 10}px`;
ballAlt.style.top = `${centerYAlt - 10}px`;

// Funzione per calcolare la velocità in base all'intervallo di tempo tra le pressioni dei tasti
function calculateSpeedAlt(interval) {
    return speedFactor / interval; // La velocità è inversamente proporzionale al tempo
}

// Calcola la velocità totale in pixel al secondo
function calculateTotalSpeedAlt() {
    return Math.sqrt(horizontalSpeedAlt * horizontalSpeedAlt + verticalSpeedAlt * verticalSpeedAlt) * 1000;
}

// Calcola la direzione in gradi (0-360)
function calculateDirectionAlt() {
    return Math.atan2(verticalSpeedAlt, horizontalSpeedAlt) * (180 / Math.PI);
}

// Aggiorna gli indicatori di velocità e direzione
function updateIndicatorsAlt() {
    const speed = calculateTotalSpeedAlt();
    const direction = calculateDirectionAlt();
    speedIndicatorAlt.textContent = speed;
    directionIndicatorAlt.textContent = ((direction + 360) % 360); // Assicura che la direzione sia tra 0-360°
	
	
	
	if (movementStarted){
		soundPlay=true;
		resetPosition();
		document.getElementById('ballAlt').style.opacity = 1;
		setTimeout(() => {
			
			soundPlay=false;
			document.getElementById('ballAlt').style.opacity = 0;
					//movementStarted=false;
					//startRandomButton.click();
					dataCSV+=currentTrial+"," + document.getElementById("speed").innerText + "," + document.getElementById("direction").innerText + "," + document.getElementById("speedAlt").innerText + "," + document.getElementById("directionAlt").innerText + "," + startMovementTime + "," + THor + "," + TVer + "," + THorSecond + "," + TVerSecond + "," + randomHorizontalInterval + "," + randomVerticalInterval + "\n";

					resetPosition()
					resetPositionAlt()
					newRandomSequence();
					//generateRandomSpeed()
					document.getElementById("speedAlt").innerText = "x";
					document.getElementById("directionAlt").innerText = "y";
					currentTrial++;
					
					document.getElementById('currentT').innerHTML = currentTrial+1;
					console.log(trialNumber, currentTrial);
					if (trialNumber==currentTrial){
						
						console.log(dataCSV);
						downloadCSV(dataCSV);
						
						alert("Experiment end");
						
						document.body.style.display = "none";

					}
					document.getElementById("circle").style.background="";
					
		}, 3800);
		
		setTimeout(() => {
			document.getElementById("circle").style.background="black";
		}, 3000);
	}
	
	movementStarted=false;
	moveBall=true;
	
	setTimeout(() => {
		moveBall=false;
	}, 3600);
	
}

// Controlla se la palla è all'interno del cerchio
function isWithinCircleAlt(x, y) {
    const dx = x - centerXAlt;
    const dy = y - centerYAlt;
    return Math.sqrt(dx * dx + dy * dy) <= radiusAlt;
}

// Resetta la posizione della palla al centro e ferma il movimento
function resetPositionAlt() {
    posXAlt = centerXAlt;
    posYAlt = centerYAlt;
    ballAlt.style.left = `${posXAlt - 10}px`;
    ballAlt.style.top = `${posYAlt - 10}px`;

    // Resetta tutti i parametri
    horizontalSpeedAlt = 0;
    verticalSpeedAlt = 0;
    lastHorizontalPressAlt = 0;
    lastVerticalPressAlt = 0;
    horizontalSetAlt = false;
    verticalSetAlt = false;
    movementStartedAlt = false;

    //updateIndicatorsAlt(); // Aggiorna gli indicatori di velocità e direzione
}

// Aggiorna la posizione della palla
function updatePositionAlt(timestamp) {
    if (!lastUpdateTimeAlt) {
        lastUpdateTimeAlt = timestamp;
    }

    const deltaTime = (timestamp - lastUpdateTimeAlt);
    lastUpdateTimeAlt = timestamp;

    if (movementStartedAlt) {
        posXAlt += horizontalSpeedAlt * deltaTime;
        posYAlt += verticalSpeedAlt * deltaTime;

        // Aggiorna la posizione della palla
        ballAlt.style.left = `${posXAlt - 10}px`;
        ballAlt.style.top = `${posYAlt - 10}px`;

        // Aggiorna gli indicatori di velocità e direzione
        updateIndicatorsAlt();

        // Se la palla esce dal cerchio, resettare la posizione al centro
        if (!isWithinCircleAlt(posXAlt, posYAlt)) {
            resetPositionAlt();
        }
    }

	requestAnimationFrame(updatePositionAlt);
	
}

// Gestisce gli eventi di pressione dei tasti
window.addEventListener('keydown', (event) => {
    if (movementStartedAlt) {
        return; // Ignora ulteriori input se la palla si sta già muovendo
    }

    const now = new Date().getTime();

    switch (event.key) {
        case 'ArrowRight':
            if (lastHorizontalPressAlt) {
                horizontalSpeedAlt = calculateSpeedAlt(now - lastHorizontalPressAlt);
                horizontalSetAlt = true;
				THorSecond = Date.now();
				document.getElementById("secondHorT").innerText = THorSecond;
            } else {
                THor = Date.now();	// THor calcolato alla prima pressione del tasto da parte dell'utente
				document.getElementById("firstHorT").innerText = THor;
            }
            lastHorizontalPressAlt = now;
            break;
        case 'ArrowLeft':
            if (lastHorizontalPressAlt) {
                horizontalSpeedAlt = -calculateSpeedAlt(now - lastHorizontalPressAlt);
                horizontalSetAlt = true;
				THorSecond = Date.now();
				document.getElementById("secondHorT").innerText = THorSecond;
            } else {
                THor = Date.now();	// THor calcolato alla prima pressione del tasto da parte dell'utente
				document.getElementById("firstHorT").innerText = THor;
            }
            lastHorizontalPressAlt = now;
            break;
        case 'ArrowUp':
            if (lastVerticalPressAlt) {
                verticalSpeedAlt = -calculateSpeedAlt(now - lastVerticalPressAlt);
                verticalSetAlt = true;
				TVerSecond = Date.now();
				document.getElementById("secondVerT").innerText = TVerSecond;
            } else {
                TVer = Date.now();	// TVer calcolato alla prima pressione del tasto da parte dell'utente
				document.getElementById("firstVerT").innerText = TVer;
            }
            lastVerticalPressAlt = now;
            break;
        case 'ArrowDown':
            if (lastVerticalPressAlt) {
                verticalSpeedAlt = calculateSpeedAlt(now - lastVerticalPressAlt);
                verticalSetAlt = true;
				TVerSecond = Date.now();
				document.getElementById("secondVerT").innerText = TVerSecond;
            } else {
                TVer = Date.now();	// TVer calcolato alla prima pressione del tasto da parte dell'utente
				document.getElementById("firstVerT").innerText = TVer;
            }
            lastVerticalPressAlt = now;
            break;
    }

    // Inizia il movimento solo se entrambe le componenti orizzontale e verticale sono impostate
    if (horizontalSetAlt && verticalSetAlt) {
        movementStartedAlt = true;
    }
});

requestAnimationFrame(updatePositionAlt);


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