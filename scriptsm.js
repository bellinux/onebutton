let pointSequence=usa2013.split("\n").slice(1);

const dot = document.getElementById('dot');
const target = document.getElementById('target');
const compStyles = window.getComputedStyle(dot);
let xMov=0;
let yMov=1;
let increment=0.1;
let speedFactor=6;

let pressedThreshold=300;
let eachAngle=30;
let prevAngle=0;
const now = Tone.now()
const startValue=220;


function angoloAFrequenza(angolo) {

        // Calcoliamo la variazione logaritmica per semitono
        var semitono = angolo / 180;

        // Frequenza di riferimento per La basso (220 Hz)
        var frequenzaDiRiferimento = 220;

        // Calcoliamo la frequenza in base alla variazione logaritmica
        var frequenza = frequenzaDiRiferimento * Math.pow(2, 2 * semitono);

        return frequenza;
   
}

function altezzaAFrequenza(altezza) {

        // Calcoliamo la variazione logaritmica per semitono

	altezza=Math.abs(altezza-(window.innerHeight-40))
        var semitono = altezza / (window.innerHeight-40);

        // Frequenza di riferimento per La basso (220 Hz)
        var frequenzaDiRiferimento = 220;

        // Calcoliamo la frequenza in base alla variazione logaritmica
        var frequenza = frequenzaDiRiferimento * Math.pow(2, 2 * semitono);

        return frequenza;
   
}

const osc = new Tone.Oscillator();//.toDestination();

let conditions=location.search.substr(1).split(",");
const sampler = new Tone.Sampler({
			urls: {
				A0: "A0.mp3",
				C1: "C1.mp3",
				"D#1": "Ds1.mp3",
				"F#1": "Fs1.mp3",
				A1: "A1.mp3",
				C2: "C2.mp3",
				"D#2": "Ds2.mp3",
				"F#2": "Fs2.mp3",
				A2: "A2.mp3",
				C3: "C3.mp3",
				"D#3": "Ds3.mp3",
				"F#3": "Fs3.mp3",
				A3: "A3.mp3",
				C4: "C4.mp3",
				"D#4": "Ds4.mp3",
				"F#4": "Fs4.mp3",
				A4: "A4.mp3",
				C5: "C5.mp3",
				"D#5": "Ds5.mp3",
				"F#5": "Fs5.mp3",
				A5: "A5.mp3",
				C6: "C6.mp3",
				"D#6": "Ds6.mp3",
				"F#6": "Fs6.mp3",
				A6: "A6.mp3",
				C7: "C7.mp3",
				"D#7": "Ds7.mp3",
				"F#7": "Fs7.mp3",
				A7: "A7.mp3",
				C8: "C8.mp3"
			},
			release: 1,
			onload: activateSound,
			baseUrl: "https://tonejs.github.io/audio/salamander/"
});

soundRtmBool=false;
function activateSound(){
	soundRtmBool=true;
}
//osc.frequency.value = startValue;

const panner = new Tone.Panner(0).toDestination();
const pianoPanner = new Tone.Panner(-1).toDestination();
var rtmDiff=600;

//sampler.connect(pianoPanner).triggerAttackRelease([464], 0.1);
var timeRtm=0;
var rotatingIncrement=0;
var bendUp=1;

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

var volumeIndex=0;

var rotationRtm=0;

function convertRange( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}

var prevEachxSecond = 0;
var hiding = false;
var totalCycleSeconds = 10;

function step(timestamp) {
    var currentSecondInCycle = parseInt(timestamp / 1000) % totalCycleSeconds;

    if (currentSecondInCycle != prevEachxSecond) {
        prevEachxSecond = currentSecondInCycle;

        if (currentSecondInCycle == 9) {
            hiding = false;
        } else {
            hiding = true;
        }

        // Console log per debug
        console.log("Hiding:", hiding);
    }
	

	if (speedFactor<diff){
		speedFactor+=Math.abs((Math.abs(speedFactor)-Math.abs(diff))/500);
	} else {
		speedFactor-=Math.abs((Math.abs(speedFactor)-Math.abs(diff))/5);
	}
	//console.log(speedFactor);
	
	let pLeft=(parseFloat(compStyles.getPropertyValue('left')) + (xMov/speedFactor));
	let pTop=(parseFloat(compStyles.getPropertyValue('top')) + (yMov/speedFactor));
	
	if (pLeft<10) {pLeft=10;  /* xMov=xMov*-1; increment+=3.14; */  };
	if (pTop<10) {pTop=10; /* yMov=yMov*-1; increment+=3.14; */ };
	
	if (pLeft>window.innerWidth-30) { pLeft=window.innerWidth-30; /*  xMov=xMov*-1; increment+=3.14; */ };
	if (pTop>window.innerHeight-30) { pTop=window.innerHeight-30; /*  yMov=yMov*-1; increment+=3.14; */ };
	
	
	if ((timestamp-timeRtm)>rtmDiff && soundRtmBool && rotating==false) {
		
		rtmPanner=((2/window.innerWidth)*pLeft)-1;
		//console.log("Altezza:", pTop-10);
		
		//rtmTone=Math.abs(pTop-window.innerHeight)+200;
		
		rtmTone=altezzaAFrequenza(pTop-10);
		
		console.log("PianoFreq: ", rtmTone);
		
		
		pianoPanner.pan.rampTo(rtmPanner, now);
		
		if (conditions[1]=="s"){
			sampler.connect(pianoPanner).triggerAttackRelease([rtmTone], 0.1, "+0", toneVolume[volumeIndex]/127);
		}
		
		if (volumeIndex==1){
			volumeIndex=0;
		} else {
			volumeIndex=1;
		};
		
		//console.log(rtmDiff);
		timeRtm=timestamp;
	}
	
	
	
	if (conditions[0]=="h" && hiding==true){
		dot.style.opacity=0;
	} else {
		dot.style.opacity=1;
	}
	
	dot.style.left = pLeft + "px";
	dot.style.top = pTop + "px";
	if (rotating){
		
		//rotatingIncrement+=0.001;
		
		//if (rotatingIncrement > 0.085){
		rotatingIncrement=(0.100/127)*afterTouch;
		
		//if (afterTouch>24) afterTouch=24;

		var pulseFreqMin=200;
		var pulseFreqMax=1200;

	
		
		
		var macConst=1.8;
		
		//}
		
		//console.log(rotatingIncrement);
		
		//if (contrary){
		increment+=rotatingIncrement*macConst*bendUp;
		//} else {
		//	increment-=rotatingIncrement;
		//}
		
		if (diff < 2){
			diff+=15;
		}
		
		
		//console.log(diff);
		
		//console.log(increment);
		//xMov=Math.sin(increment);
		//yMov=Math.cos(increment);
		
		yMov=Math.cos(increment);
		xMov=Math.sin(increment);
		
		var angle=parseInt((Math.atan2(yMov, xMov) * (180/Math.PI))) - 135;
		let angleChange=parseInt((angle-45)/eachAngle);
		//console.log("angle", angle);
		if (angleChange != prevAngle){
			//console.log("tick:",angle,eachAngle, angleChange)
			prevAngle=angleChange;
			if (conditions[2]=="h"){
				playPulse();
				if (smConn){
					smConn.send({ ev: 'v' });
				}
			}
		}

		
		
		dot.style.transform = "rotate("+angle+"deg)";
		
		var sonicAngle=Math.abs(parseInt((Math.atan2(xMov, yMov) * (180/Math.PI))));
		var sonicPanner=parseFloat((Math.atan(xMov, yMov) * (180/Math.PI)))/45;
		//console.log(sonicPanner);
		
		//if (sonicPanner>0) { sonicPanner=1; } else {sonicPanner=-1;}
		if (conditions[1]=="s"){
			panner.pan.rampTo(sonicPanner, now);
			osc.volume.rampTo(-10, 0.05);
			console.log("angle:", sonicAngle, "freq: ", angoloAFrequenza(sonicAngle))
			//osc.connect(panner).frequency.rampTo(parseInt(startValue+sonicAngle), now);
			osc.connect(panner).frequency.rampTo(parseInt(angoloAFrequenza(sonicAngle)), now);
		}
		
	} else {
		//osc.volume.rampTo(-Infinity, 0.05);
		rotatingIncrement=0;
	}
	window.requestAnimationFrame(step);
	
}


let intervals=[0,0];
let timeout;
let timeout2;
let allowed = true;
let rotating = false;
let diff=1;
let oldDiff=0.1;
let oldSpeedFactor;
let dateFirstUp=1000;
let contrary=false;
let contraryValueRtmDiff;
let contraryValyeDiff;
let contraryTrueCount=0;

window.requestAnimationFrame(step);
function triggerDown(e){
	
	if (event.repeat != undefined) {
		allowed = !event.repeat;
	}
	if (!allowed) return;
	allowed = false;
	downFunction(127);


}

function downFunction(volume){
	/*
	if (volume > 100){
		toneVolume.push(volume);
		toneVolume.shift();
	} */
	
	timeout=setTimeout(() => {

		rotating=true;
		oldDiff=diff;
		oldSpeedFactor=speedFactor;
		if (conditions[1]=="s"){
			osc.start();
		}

	}, pressedThreshold)
	
	
	
}

var rtmDiffArr=[0,0];
var diffArr=[0,0];

var preRtmDiff=0;
var preDiff=0;
var recording=false;
var hidingFalseInterval;

function triggerUp(e){
	
	//console.log(e);
	if (e.key=="r" && recording==false)	{
		iterateLines();
		recording=true;
		target.style.display="block";

		hidingFalseInterval = setInterval(function () {hiding = false}, 10);
		setTimeout(function () {clearInterval(hidingFalseInterval)}, 10000);
		
		
	}

	upFunction(127);


	
}

var toneVolume=[127,127];

function upFunction(){
	
	dateFirstUp=Date.now();
	clearTimeout(timeout);

		
	preRtmDiff=rtmDiff;
	preDiff=diff;
		
	if (rotating==false){
		intervals.push(Date.now());
		intervals.shift();
		
		//toneVolume.push(volume);
		//toneVolume.shift();
		
		if (intervals[0] != 0){
			//console.log(intervals);
				
			rtmDiff = (intervals[1]-intervals[0]);
			
			if (rtmDiff<250) rtmDiff = 250;
			
			diff = rtmDiff/300;
				

			//console.log(speedFactor);

		}
	} else {
		diff=oldDiff;
		//console.log("set old speed factor")
	}
		
	allowed = true;
	rotating = false;
	
	osc.volume.rampTo(-Infinity, 0.05);
	setTimeout(() => {
	  osc.stop();
	}, 100);

	
}

let pointIndex=0;
let coordinates="timestamp;ghostX;ghostY;x;y;hideShow;userInteraction;timestamp\n";
let speedTargetMS=272;
//speedTargetMS=30;
function iterateLines(){
	setTimeout(function(){ 
	
		let pointLine=pointSequence[pointIndex].split(",");
		var leftMargin=0;
		if (conditions[3]=="1"){
			//invert X
			leftMargin=window.innerWidth*0.05;
			pointLine[3]=Math.abs(pointLine[3]-2561);
		}
		var topMargin=0;
		if (conditions[4]=="1"){
			//invert Y
			pointLine[4]=Math.abs(pointLine[4]-1198);
			topMargin=window.innerHeight*0.05;
		}

		var xScale=2681/(window.innerWidth-30);
		var yScale=1278/(window.innerHeight-30);
		
		if (pointIndex==1){
			target.classList.add("transition");
			dot.style.left = 4+leftMargin+(pointLine[3]/xScale) + "px";
			dot.style.top = 4+topMargin+(pointLine[4]/yScale) + "px";
		}

		
		
		pointIndex++;
		console.log(pointIndex, pointLine);
		
		target.style.left = 4+leftMargin+(pointLine[3]/xScale) + "px";
		target.style.top = 4+topMargin+(pointLine[4]/yScale) + "px";
		
		
		
		if (pointIndex<pointSequence.length){
			iterateLines();
			coordinates+=Date.now()+";"+parseInt(getOffset(target).left)+";"+parseInt(getOffset(target).top)+";"+parseInt(getOffset(dot).left)+";"+parseInt(getOffset(dot).top)+";"+hiding+";"+interactionUser+";"+Date.now()+"\n";
		
		
		} else {
			download_csv();
			
			console.log(coordinates);
			
			
			alert("End");
			location.reload();
			
		}
		
	}, speedTargetMS);
}
//iterateLines();


function download_csv() {
  var textToSave = coordinates;
  var hiddenElement = document.createElement('a');

  hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
  hiddenElement.target = '_blank';
  hiddenElement.download = conditions.reverse().join("+")+"_"+Date.now()+'.csv';
  hiddenElement.click();
}



document.addEventListener("keydown", triggerDown);

document.addEventListener("keyup", triggerUp);









navigator.requestMIDIAccess().then((access) => {
	onMIDISuccess(access);
});

inputList=document.getElementById('input');
logEventsMidi=document.getElementById('eventsMidi');
document.getElementById('lastMidiEv').style.display="none";
inputDevices=[];
function onMIDISuccess(midiAccess) {
	var i=0;
    for (var input of midiAccess.inputs.values()) {
        
		console.log(input);
		inputDevices.push(input);
		inputList.innerHTML=inputList.innerHTML+'<option value="'+i+'">'+input.name+'</option>'
		i++;
    }
}
var currentTime=Date.now();
inputList.addEventListener('input', function (event) {
	inputDevices[inputList.value].onmidimessage = getMIDIMessage;
	document.getElementById('lastMidiEv').style.display="block";
	document.getElementById('midiSelection').style.display="none";
	
});

document.getElementById('close').addEventListener('click', function (event) {
	document.getElementById('lastMidiEv').style.display="none";
	document.getElementById('midiSelection').style.display="none";
	document.getElementById('open').style.display="block";
	
});

document.getElementById('open').addEventListener('click', function (event) {
	document.getElementById('lastMidiEv').style.display="block";
	document.getElementById('midiSelection').style.display="none";
	document.getElementById('open').style.display="none";
	
});

var afterTouch=100;
var eventLines=Array.from({length: 45}, () => "");
var midiNote=70;
var midiNote2=72;
var upEnabled=false;
function getMIDIMessage(midiMessage) {
	
	//logEventsMidi.innerHTML='<br>'+(midiMessage.data.toString()+logEventsMidi.innerHTML).substring(0, 1000);
	
	console.log(midiMessage.data);
	
	if (midiMessage.data[0]==225){
		console.log("pitchBend", midiMessage.data[2], Date.now()-currentTime)
		if (midiMessage.data[2]>65) {
			afterTouch=(midiMessage.data[2] - 65)/2.5;
			bendUp=-1;
			
		} else {
			afterTouch=(65 - midiMessage.data[2])/2.5;
			bendUp=1;
			
		}
		
	//} else if (midiMessage.data[0]==208){
		//console.log("aftertouch", midiMessage.data[1], Date.now()-currentTime)
		//afterTouch=midiMessage.data[1];
		
		//eventLines.push('<br>'+'<span style="background: #ff0;">'+midiMessage.data.toString()+'</span>');
	} else if ((midiMessage.data[1]==midiNote || midiMessage.data[1]==midiNote2) && midiMessage.data[0]==145 && midiMessage.data[2]>0){
		//if (midiMessage.data[2] > 100){
			downFunction(midiMessage.data[2]);
			eventLines.push('<br>'+'<span style="background: #ff0;">'+midiMessage.data.toString()+'</span>');
			upEnabled=true;
		//}
	//} else if (midiMessage.data[1]==midiNote && midiMessage.data[0]==145 && midiMessage.data[2]==0){
	//		eventLines.push('<br>'+'<span style="background: #ff0;">'+midiMessage.data.toString()+'</span>');
	//		upFunction();
	} else if ((midiMessage.data[1]==midiNote || midiMessage.data[1]==midiNote2) && midiMessage.data[0]==129){
		//if (upEnabled) {
			eventLines.push('<br>'+'<span style="background: #ff0;">'+midiMessage.data.toString()+'</span>');
			upFunction();
			upEnabled=false;
		//}
	} else {
			eventLines.push('<br>'+'<span>'+midiMessage.data.toString()+'</span>');
	}
	eventLines.shift();
	
	let eventString='';
	eventLines.slice().reverse().forEach((txt) => {
	  eventString=eventString+txt;

	});
	logEventsMidi.innerHTML=eventString;

}


var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
audioCtx.destination.channelCount = audioCtx.destination.maxChannelCount;
var channels = audioCtx.destination.channelCount;
console.log(channels)
var frameCount = audioCtx.sampleRate * 0.5;
var myArrayBuffer = audioCtx.createBuffer(audioCtx.destination.channelCount, frameCount, audioCtx.sampleRate);

const pulse = 'pulse.mp3';

window.fetch(pulse)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
		myArrayBuffer.copyToChannel(audioBuffer.getChannelData(0), 2)
		myArrayBuffer.copyToChannel(audioBuffer.getChannelData(1), 3)
});
   
   
pulseVolume=10;
function playPulse(){
	if (conditions[1]=="s"){
		var source = audioCtx.createBufferSource();
		source.buffer = myArrayBuffer;
		
		var gainNode = audioCtx.createGain()
		gainNode.gain.value = pulseVolume/10; 
		gainNode.connect(audioCtx.destination)
		
		
		source.connect(gainNode);
		source.start();
	}
}





const peer = new Peer("onebutton-sm-ab-com"); // Inizializza PeerJS

peer.on('open', (id) => {
     console.log('ID del ricevitore:', id);
});
var interactionUser=0;
var smConn;
peer.on('connection', (conn) => {
	smConn=conn;
    conn.on('data', (data) => {
        if (data.ev === 'p') {
            console.log('Evento di pressione.');
			interactionUser++;
			downFunction(100);
			eventLines.push('<br>'+'<span style="background: #ff0;">Press</span>');
			upEnabled=true;
			afterTouch=0;
        } else if (data.ev === 'm') {
            console.log('Evento di movimento:', data.deltaX);	
			afterTouch=0;
			if (data.deltaX!=0) {
				interactionUser++;
				afterTouch=(data.deltaX*1.4)*-1;
				

				if (afterTouch>7) afterTouch=7;
				if (afterTouch<-7) afterTouch=-7;
					console.log("valore aftertouch", afterTouch);
				
			}
			//conn.send({ ev: 'v' });
        } else if (data.ev === 'r') {
            console.log('Evento di rilascio.');
			eventLines.push('<br>'+'<span style="background: #ff0;">Release</span>');
			upFunction();
			interactionUser++;
			upEnabled=false
        }
    });
});
