<template>
  <div>
    <div class="container">
      <div class="message-container no-scroll-display">
        <div class="messages" v-for="data in chats" :key="data.id">
          <MessageView :message="data.content" :role="data.role" />
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
  </div>
</template>

<script setup>
// imports
import OpenAI from "openai";
import { onMounted, ref } from "vue";
import NavbarView from "../components/NavbarView.vue";
import MessageView from "../components/messageView.vue";

// variables

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
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text, // Use the passed text here
    });

    // Assuming mp3.data is an ArrayBuffer
    const arrayBuffer = await mp3.arrayBuffer();

    // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

    // Create an audio element and play the Blob
    const audio = new Audio(URL.createObjectURL(blob));
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
</style>
