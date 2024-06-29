<template>
  <canvas ref="canvas" @startAudio="start()"></canvas>
  <button @click="start">Start</button>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  defineProps,
} from "vue";
import { useStore } from "../store/store";

const props = defineProps({
  audioStream: {
    type: Object,
    required: true,
  },
});

const store = useStore();
const test = computed(() => {
  return store.audios;
});

const emit = defineEmits(["customEvent"]);

console.log(store.audios);
if (store.mic) {
  start();
  store.updateMic(false);
}

const canvas = ref(null);
const WIDTH = 1000;
const HEIGHT = 700;
let context;
let analyser;
let freqs;
let ctx = ref(null);

const opts = {
  smoothing: 0.6,
  fft: 8,
  minDecibels: -70,
  scale: 0.2,
  glow: 10,
  color1: [203, 36, 128],
  color2: [41, 200, 192],
  color3: [24, 137, 218],
  fillOpacity: 0.6,
  lineWidth: 1,
  blend: "screen",
  shift: 50,
  width: 60,
  amp: 1,
};

const shuffle = [1, 3, 0, 4, 2];

function onStream(audio) {
  const input = context.createMediaElementSource(audio);
  input.connect(analyser);
  analyser.connect(context.destination);
  requestAnimationFrame(visualize);
  audio.play();
}

function range(i) {
  return Array.from(Array(i).keys());
}

function freq(channel, i) {
  const band = 2 * channel + shuffle[i] * 6;
  return freqs[band];
}

function scale(i) {
  const x = Math.abs(2 - i);
  const s = 3 - x;
  return (s / 3) * opts.amp;
}

function path(channel) {
  const color = opts[`color${channel + 1}`].map(Math.floor);
  ctx.value.fillStyle = `rgba(${color}, ${opts.fillOpacity})`;
  ctx.value.strokeStyle = ctx.value.shadowColor = `rgb(${color})`;
  ctx.value.lineWidth = opts.lineWidth;
  ctx.value.shadowBlur = opts.glow;
  ctx.value.globalCompositeOperation = opts.blend;

  const m = HEIGHT / 2;
  const offset = (WIDTH - 15 * opts.width) / 2;
  const x = range(15).map(
    (i) => offset + channel * opts.shift + i * opts.width
  );
  const y = range(5).map((i) => Math.max(0, m - scale(i) * freq(channel, i)));
  const h = 2 * m;

  ctx.value.beginPath();
  ctx.value.moveTo(0, m);
  ctx.value.lineTo(x[0], m);
  ctx.value.bezierCurveTo(x[1], m, x[1], y[0], x[2], y[0]);
  ctx.value.bezierCurveTo(x[3], y[0], x[3], y[1], x[4], y[1]);
  ctx.value.bezierCurveTo(x[5], y[1], x[5], y[2], x[6], y[2]);
  ctx.value.bezierCurveTo(x[7], y[2], x[7], y[3], x[8], y[3]);
  ctx.value.bezierCurveTo(x[9], y[3], x[9], y[4], x[10], y[4]);
  ctx.value.bezierCurveTo(x[11], y[4], x[11], m, x[12], m);
  ctx.value.lineTo(1000, m + 1);
  ctx.value.lineTo(x[12], m - 1);
  ctx.value.bezierCurveTo(x[11], m, x[11], h - y[4], x[10], h - y[4]);
  ctx.value.bezierCurveTo(x[9], h - y[4], x[9], h - y[3], x[8], h - y[3]);
  ctx.value.bezierCurveTo(x[7], h - y[3], x[7], h - y[2], x[6], h - y[2]);
  ctx.value.bezierCurveTo(x[5], h - y[2], x[5], h - y[1], x[4], h - y[1]);
  ctx.value.bezierCurveTo(x[3], h - y[1], x[3], h - y[0], x[2], h - y[0]);
  ctx.value.bezierCurveTo(x[1], h - y[0], x[1], m, x[0], m);
  ctx.value.lineTo(0, m);
  ctx.value.fill();
  ctx.value.stroke();
}

function visualize() {
  analyser.smoothingTimeConstant = opts.smoothing;
  analyser.fftSize = Math.pow(2, opts.fft);
  analyser.minDecibels = opts.minDecibels;
  analyser.maxDecibels = 0;
  analyser.getByteFrequencyData(freqs);

  canvas.value.width = WIDTH;
  canvas.value.height = HEIGHT;
  path(0);
  path(1);
  path(2);
  requestAnimationFrame(visualize);
}

function start() {
  emit("customEvent");
  context = new AudioContext();
  analyser = context.createAnalyser();
  freqs = new Uint8Array(analyser.frequencyBinCount);
  if (document.querySelector("button")) {
    document.querySelector("button").remove();
  }
  onStream(store.audios);
}

onMounted(() => {
  ctx.value = canvas.value.getContext("2d");
});

onBeforeUnmount(() => {
  if (context && context.state !== "closed") {
    context.close();
  }
});

defineExpose({ start });
</script>

<style scoped>
body {
  background: radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat
    fixed 0 0;
  margin: 0;
}
h1 {
  color: #fff;
  font: 10vh/1.2 sans-serif;
}
canvas {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 400px;
}
button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-size: 2vw;
  border-radius: 9em;
  padding: 0.5em 1.5em;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.5s;
}
button:hover {
  transition: all 0.5s;
  padding: 0.65em 1.75em;
  box-shadow: rgba(255, 255, 255, 0.2) 0px 7px 29px 0px;
}
</style>
