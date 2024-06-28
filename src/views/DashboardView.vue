<template>
  <div>
    <test-view
      class="audio-visualizer"
      @customEvent="ToggleMic()"
      ref="startAudio"
    />
    <div class="container" v-if="toggleState">
      <div class="message-container no-scroll-display">
        <div class="messages" v-for="data in chats" :key="data.id">
          <!-- <MessageView :message="data.content" :role="data.role" /> -->
        </div>
      </div>
      <form @submit.prevent="messageSent()">
        <div class="search-bar">
          <div class="search-inner">
            <input type="text" v-model="inputText" />
            <ph-microphone
              :size="32"
              class="icons"
              @click="ToggleMic"
              :class="isRecording === true ? 'active' : 'dis'"
            />
            <ph-arrow-circle-right
              :size="32"
              class="icons tick"
              @click="messageSent()"
              @keypress.enter="messageSent()"
            />
          </div>
        </div>
      </form>
    </div>
    <form @submit.prevent="messageSent()" v-if="!toggleState">
      <div class="search-bar">
        <div class="search-inner">
          <input type="text" v-model="inputText" />
          <ph-microphone
            :size="32"
            class="icons"
            @click="ToggleMic"
            :class="isRecording === true ? 'active' : 'dis'"
          />
          <ph-arrow-circle-right
            :size="32"
            class="icons tick"
            @click="messageSent()"
            @keypress.enter="messageSent()"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
// imports
import OpenAI from "openai";
import { onMounted, ref } from "vue";
import TestView from "./TestView.vue";
import { useStore } from "../store/store";

// initializing store
const store = useStore();

// variables
const toggleState = ref(store.toggleSidebarState);
const audioStream = ref(null);
const startAudio = ref(null);

// speech Recognition variables
const isRecording = ref(false);
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const sr = new Recognition();

onMounted(() => {
  sr.continuous = false;
  sr.interimResults = true;

  sr.onstart = () => {
    console.log("SR Started");
    isRecording.value = true;
  };

  sr.onend = () => {
    console.log("SR Stopped");
    isRecording.value = false;
    messageSent();
  };

  sr.onresult = (evt) => {
    for (let i = 0; i < evt.results.length; i++) {
      const result = evt.results[i];
      if (result.isFinal) CheckForCommand(result);
    }

    const t = Array.from(evt.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    inputText.value = t;
  };
});

const ToggleMic = () => {
  console.log("ToggleMic called");
  console.log("isRecording before:", isRecording.value);
  if (isRecording.value) {
    sr.stop();
  } else {
    sr.start();
  }
  console.log("isRecording after:", isRecording.value);
};

const inputFreeze = ref(false);
const chats = ref([]);
const inputText = ref("");

const messageSent = () => {
  if (inputText.value !== "" && !inputFreeze.value) {
    fetchResponse(inputText.value);
    chats.value.push({ role: "user", content: inputText.value });
    inputText.value = "";
    console.log(chats.value);
  }
};

const responses = ref("");

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const fetchResponse = async (input) => {
  console.log(chats.value);
  inputFreeze.value = true;
  try {
    const completion = await openai.chat.completions.create({
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "I want you to act as a cognitive behavioural therapist...",
        },
        ...chats.value,
        {
          role: "user",
          content: input,
        },
      ],
      model: "gpt-3.5-turbo",
      stream: false,
    });

    inputFreeze.value = false;
    const fullResponse = completion.choices[0].message.content;
    chats.value.push({ role: "system", content: fullResponse });

    await generateAndPlayAudio(fullResponse);
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
  }
};

const generateAndPlayAudio = async (text) => {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    audioStream.value = new Audio(audio.src);
     store.updateAudio(audioStream);
    store.updateMic(true);
    console.log( startAudio.value);
    startAudio.value.start()
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
</script>

<style scoped>
.messages {
  background-color: rgba(240, 248, 255, 0);
}
.message-container {
  height: calc(100vh - 12rem);
  overflow-x: hidden;
  overflow-y: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: 1px;
  background-color: rgba(245, 222, 179, 0);
}
.no-scroll-display {
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
}
.no-scroll-display::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
.container {
  position: relative;
}

.search-inner {
  display: flex;
  position: absolute;
  bottom: 0px;
  width: calc(100vw - 4rem);
  height: 3rem;
  border-radius: 25px;
  margin: 1rem 0.75rem;
  background-color: var(--background);
}
.search-bar input {
  width: calc(100vw - 2rem);
  height: 3rem;
  border: 0px;
  border-radius: 25px;
  color: var(--text);
  caret-color: var(--text);
  padding: 0px 1rem;
}
.search-bar input[type="text"] {
  font-size: 1.5rem;
}
.search-bar input[type="text"]:focus {
  outline: none !important;
}
.icons {
  margin: 7px 10px 0px 0px;
  border-radius: 25px;
}
.active {
  margin: 7px 10px 0px 0px;
  border-radius: 25px;
  filter: invert(100%);
}
@media (min-width: 1280px) {
  .container {
    max-width: -webkit-fill-available;
  }
}
.audio-visualizer {
  height: 100% !important;
}
</style>
