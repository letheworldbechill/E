document.addEventListener('DOMContentLoaded',()=>{

const stage=document.getElementById('stage'),dotWrap=document.getElementById('dotWrapper'),dot=document.getElementById('dot');
const splash=document.getElementById('splash'),startBtn=document.getElementById('startStop');
const menu=document.getElementById('menu'),menuBtn=document.getElementById('menuBtn');
const speedRange=document.getElementById('speedRange'),speedLabel=document.getElementById('speedLabel');
const durationSelect=document.getElementById('durationSelect'),setsInput=document.getElementById('setsInput'),pauseInput=document.getElementById('pauseInput');
const timerDisplay=document.getElementById('timer'),evalModal=document.getElementById('eval'),continueBtn=document.getElementById('continueBtn');
const heartbeat=document.getElementById('heartbeat');

setTimeout(()=>splash.classList.add('fade'),1500);setTimeout(()=>splash.remove(),2600);

let running=false,pos=0,dir=1,lastT=null,anim=null,beatInt=null;
let bpm=60,dur=45,sets=8,pause=8,setCount=0;

const AudioCtx=window.AudioContext||window.webkitAudioContext;const actx=new AudioCtx();
const src=actx.createMediaElementSource(heartbeat);const pan=actx.createStereoPanner();
src.connect(pan).connect(actx.destination);

const fmt=s=>('0'+s).slice(-2);const updTimer=s=>timerDisplay.textContent=`${fmt(s)} s`;

function playBeat(){heartbeat.currentTime=0;heartbeat.play().catch(()=>{});if(navigator.vibrate)navigator.vibrate(40);pan.pan.value=dir;}
function startBeats(){clearInterval(beatInt);playBeat();beatInt=setInterval(playBeat,60000/bpm);}
function stopBeats(){clearInterval(beatInt);heartbeat.pause();heartbeat.currentTime=0;}

let cdInt=null;
function countdown(sec,cb){clearInterval(cdInt);updTimer(sec);cdInt=setInterval(()=>{sec--;updTimer(sec);if(sec<=0){clearInterval(cdInt);cb&&cb();}},1000);}

function step(t){if(!running)return;if(!lastT)lastT=t;const dt=(t-lastT)/1000;lastT=t;
const cyc=2/(bpm/60);pos+=dir*dt*2/cyc;if(pos>=1){pos=1;dir=-1}else if(pos<=0){pos=0;dir=1}
const travel=stage.clientWidth-dot.clientWidth-40;dotWrap.style.transform=`translate(${20+pos*travel}px,-50%)`;
anim=requestAnimationFrame(step);}

function startSet(){running=true;lastT=null;startBeats();countdown(dur,endSet);anim=requestAnimationFrame(step);}
function endSet(){stopBeats();running=false;cancelAnimationFrame(anim);showEval();}
function startPause(){countdown(pause,()=>{setCount++;if(setCount<sets)startSet();else stopSession();});}

function showEval(){evalModal.classList.remove('hidden');}
function hideEval(){evalModal.classList.add('hidden');startPause();}

function startSession(){if(actx.state==='suspended')actx.resume();setCount=0;startSet();startBtn.textContent='Stop';}
function stopSession(){running=false;cancelAnimationFrame(anim);stopBeats();clearInterval(cdInt);startBtn.textContent='Start';}

startBtn.onclick=()=>running||beatInt?stopSession():startSession();
continueBtn.onclick=hideEval;
menuBtn.onclick=()=>menu.classList.toggle('hidden');
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!menuBtn.contains(e.target)&&!menu.classList.contains('hidden'))menu.classList.add('hidden');});

speedRange.oninput=()=>{bpm=Math.max(60,parseInt(speedRange.value));speedLabel.textContent=bpm;if(running)startBeats();};
durationSelect.onchange=()=>dur=parseInt(durationSelect.value);
setsInput.onchange=()=>sets=parseInt(setsInput.value);
pauseInput.onchange=()=>pause=parseInt(pauseInput.value);

});