<template>
  <div>
    <test-view class="audio-visualizer" @customEvent="ToggleMic()" />
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
              @click="ToggleMic()"
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
            @click="ToggleMic()"
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
import NavbarView from "../components/NavbarView.vue";
import MessageView from "../components/messageView.vue";
import TestView from "./TestView.vue";
import { useStore } from "../store/store";

//intializing store
const store = useStore();

// variables
const toggleState = ref(store.toggleSidebarState);

// speech Recognition variables
const isRecording = ref(false);
// const micActivity = ref(false);

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const sr = new Recognition();

onMounted(() => {
  const scrollDiv = document.querySelector(".message-container");
  console.log(scrollDiv.scrollIntoView);
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
  console.log('Running');
  if (isRecording.value) {
    sr.stop();
  } else {
    sr.start();
  }
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
          content:
            "I want you to act as a cognitive behavioural therapist. You are supposed to be the first one to initiate a conversation. You are supposed to do everything that a cognitive behavioural therapist would do to make your client feel better and motivated after the talk. I want you to keep your replies neat, limiting your replies strictly to a maximum of 100 words. Maintain a humble and sensitive tone towards the client and behave exactly like a cognitive behavioural therapist. Remember to not jump on to the solutions of their problems. First explore what exactly they are feeling about their problems. Motivate them to suggest solutions of their own problems as much as possible. If they aren't able to then ask if you should suggest some solution. If they say yes then only you should start providing solutions form your side. Provide emotional support to them doesn't matter what happens . Remember to never end the conversation from your side. If the clients gives a list of reasons for their mental disturbance then cater to them one by one but don't forget about even one of them. If they forget then it;s your responsibility to bring the reason up again but implicitly so that they elaborate upon it. Behave like an experienced cognitive behavioural therapist at all costs.",
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
    // adding to stack
    const fullResponse = completion.choices[0].message.content;
    chats.value.push({ role: "system", content: fullResponse });

    // Generate and play TTS audio for the full response
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

    // Assuming mp3.data is an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

    // Create an audio element and play the Blob
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    audio.play();
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
.audio-visuailizer {
  height: 100% !important;
}
</style>
