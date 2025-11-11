// sevu EMDR – script.js (PWA-Version mit Tannenzapfen-Stimulus)
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("stage"),
        dotWrap = document.getElementById("dotWrapper"),
        dot = document.getElementById("dot"),
        startBtn = document.getElementById("startStop"),
        menu = document.getElementById("menu"),
        menuBtn = document.getElementById("menuBtn"),
        speedRange = document.getElementById("speedRange"),
        speedLabel = document.getElementById("speedLabel"),
        durationSelect = document.getElementById("durationSelect"),
        setsInput = document.getElementById("setsInput"),
        pauseInput = document.getElementById("pauseInput"),
        timerDisplay = document.getElementById("timer"),
        evalModal = document.getElementById("eval"),
        continueBtn = document.getElementById("continueBtn"),
        heartbeat = document.getElementById("heartbeat");

  // === Audio-Setup ===
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const actx = new AudioCtx();
  const src = actx.createMediaElementSource(heartbeat);
  const pan = actx.createStereoPanner();
  src.connect(pan).connect(actx.destination);

  // === Variablen ===
  let running = false,
      bpm = 60,
      dur = 45,
      sets = 8,
      pause = 8,
      setCount = 0,
      pos = 0,
      dir = 1,
      lastT = null,
      anim = null,
      cdInt = null;

  // === Timeranzeige ===
  const fmt = s => ("0" + s).slice(-2);
  const updTimer = s => (timerDisplay.textContent = `${fmt(s)} s`);

  // === Countdown ===
  function countdown(sec, cb) {
    clearInterval(cdInt);
    updTimer(sec);
    cdInt = setInterval(() => {
      sec--;
      updTimer(sec);
      if (sec <= 0) {
        clearInterval(cdInt);
        cb && cb();
      }
    }, 1000);
  }

  // === Ton abspielen (synchron zum Richtungswechsel) ===
  function playBeat() {
    heartbeat.currentTime = 0;
    heartbeat.play().catch(() => {});
    if (navigator.vibrate) navigator.vibrate(40);
    pan.pan.value = dir;
  }

  // === Haupt-Animations-Loop ===
  function step(t) {
    if (!running) return;
    if (!lastT) lastT = t;
    const dt = (t - lastT) / 1000;
    lastT = t;

    const cycle = 2 / (bpm / 60);
    pos += dir * (dt * 2 / cycle);

    if (pos >= 1) {
      pos = 1;
      dir = -1;
      playBeat();
    } else if (pos <= 0) {
      pos = 0;
      dir = 1;
      playBeat();
    }

    const travel = stage.clientWidth - dot.clientWidth - 40;
    dotWrap.style.transform = `translate(${20 + pos * travel}px,-50%) rotate(${dir > 0 ? 5 : -5}deg)`;
    dot.style.transform = `translate(-50%,0) scale(${1 + 0.02 * Math.sin(t / 300)})`;
    anim = requestAnimationFrame(step);
  }

  // === Sitzungssteuerung ===
  function startSet() {
    running = true;
    lastT = null;
    actx.resume();
    countdown(dur, endSet);
    anim = requestAnimationFrame(step);
  }

  function endSet() {
    running = false;
    cancelAnimationFrame(anim);
    showEval();
  }

  function startPause() {
    countdown(pause, () => {
      setCount++;
      if (setCount < sets) startSet();
      else stopSession();
    });
  }

  function startSession() {
    if (actx.state === "suspended") actx.resume();
    setCount = 0;
    startSet();
    startBtn.textContent = "Stop";
  }

  function stopSession() {
    running = false;
    cancelAnimationFrame(anim);
    clearInterval(cdInt);
    startBtn.textContent = "Start";
  }

  // === UI ===
  function showEval() {
    evalModal.classList.remove("hidden");
  }

  function hideEval() {
    evalModal.classList.add("hidden");
    startPause();
  }

  startBtn.onclick = () => (running ? stopSession() : startSession());
  continueBtn.onclick = hideEval;

  menuBtn.onclick = () => menu.classList.toggle("hidden");
  document.addEventListener("click", e => {
    if (
      !menu.contains(e.target) &&
      !menuBtn.contains(e.target) &&
      !menu.classList.contains("hidden")
    )
      menu.classList.add("hidden");
  });

  speedRange.oninput = () => {
    bpm = Math.max(60, parseInt(speedRange.value));
    speedLabel.textContent = bpm;
  };
  durationSelect.onchange = () => (dur = parseInt(durationSelect.value));
  setsInput.onchange = () => (sets = parseInt(setsInput.value));
  pauseInput.onchange = () => (pause = parseInt(pauseInput.value));
});
