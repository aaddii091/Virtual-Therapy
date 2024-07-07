<template>
  <div id="dashboard">
    <test-view
      class="audio-visualizer"
      @customEvent="ToggleMic()"
      ref="startAudio"
    />
    <div class="containers" v-if="toggleState">
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
          <input
            type="text"
            v-model="inputText"
            :disabled="!responseCompleted ? true : false"
          />
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
          <PhCheckCircle
            :size="32"
            class="icons"
            @click="renderReport()"
            :class="chats.length > 4 ? '' : 'none'"
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
import "../assets/dashboard.css";
import { jsPDF } from "jspdf";
import generateReport from "../composable/generateReport";
import { computed } from "vue";

// initializing store
const store = useStore();

// variables
const userInfo = {
  name: store.name,
  age: store.age,
  email: store.email,
  gender: store.gender,
};
const toggleState = ref(store.toggleSidebarState);
const audioStream = ref(null);
const startAudio = ref(null);
const inputFreeze = ref(false);
const chats = ref([]);
const inputText = ref("");
const responseCompleted = computed(() => {
  return store.responseStatus;
});

console.log(chats.value.length);

// composable
const { report } = generateReport();

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

const renderReport = async () => {
  await generateAndPlayAudio(
    "Thank you for the session. We are currently generating a comprehensive report, which will soon be available for download."
  );

  const reportDetails = await report(chats.value, userInfo);
  console.log(reportDetails);
  const doc = new jsPDF();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Detailed Report", 20, 20);

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text("Generated on: " + new Date().toLocaleDateString(), 20, 30);

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Function to handle long text and prevent overflow
  const formatText = (text, maxLength = 60) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "...";
    }
    return text || "";
  };

  // User Profile Summary
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("1. User Profile Summary", 20, 45);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`• Name: ${store.name}`, 20, 55);
  doc.text(`• Age: ${store.age}`, 20, 65);
  doc.text(`• Gender: ${store.gender}`, 20, 75);
  doc.text(`• Email: ${formatText(store.email)}`, 20, 85);

  // Mental Health Overview
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("2. Mental Health Overview", 20, 100);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(
    `• Reason for Seeking Therapy: ${formatText(
      reportDetails.presentingProblem.reasonForSeekingTherapy
    )}`,
    20,
    110
  );
  doc.text(
    `• Current Issues and Symptoms: ${formatText(
      reportDetails.presentingProblem.currentIssuesAndSymptoms
    )}`,
    20,
    120
  );
  doc.text(
    `• Diagnosed Conditions: ${formatText(
      reportDetails.backgroundInformation.relevantMedicalAndPsychologicalHistory
    )}`,
    20,
    130
  );
  doc.text(
    `• Previous Therapy or Treatment: ${formatText(
      reportDetails.previousTherapyOrTreatment || "First Therapy Session"
    )}`,
    20,
    140
  );

  // Progress and Trends
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("3. Progress and Trends", 20, 155);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(
    `• Client's Mood and Behavior During Session: ${formatText(
      reportDetails.sessionSummary.clientsMoodAndBehaviorDuringSession
    )}`,
    20,
    165
  );
  doc.text(
    `• Key Insights and Observations: ${formatText(
      reportDetails.sessionSummary.keyInsightsAndObservations
    )}`,
    20,
    175
  );
  doc.text(
    `• Short-term Goals: ${formatText(
      reportDetails.therapeuticGoals.shortTermGoals
    )}`,
    20,
    185
  );
  doc.text(
    `• Long-term Goals: ${formatText(
      reportDetails.therapeuticGoals.longTermGoals
    )}`,
    20,
    195
  );

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "ZenGarden - Created by a Virtual Therapist",
    105,
    290,
    null,
    null,
    "center"
  );

  // Save the PDF
  doc.save("detailed_report.pdf");
};

const ToggleMic = () => {
  console.log("ToggleMic called");
  console.log("isRecording before:", isRecording.value);
  if (!responseCompleted.value) {
    sr.stop();
  } else {
    sr.start();
  }
  console.log("isRecording after:", isRecording.value);
};

const messageSent = () => {
  if (inputText.value !== "" && !inputFreeze.value) {
    store.updateResponseStatus(false);
    console.log(store.responseStatus, "RESPONSSSSSSSSE");
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
            "I want you to act as a cognitive behavioural therapist your name is zen and at first you will introduce yourself as a virtual therapist named zen you will not reply in more than 150 words , dont try to end the conversation and always try go keep the conversation going my asking questions",
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
    console.log(fullResponse);
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
    console.log(startAudio.value);
    startAudio.value.start();
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
</script>

<style scoped>
.search-bar,
.search-inner,
input,
.icons {
  background-color: #232d3f !important;
}
@import url("../assets/dashboard.css");
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
  width: -webkit-fill-available;
  height: 3rem;
  border-radius: 25px;
  margin: 1rem 0.75rem;
  background-color: var(--background);
}
.search-bar input {
  width: 100%;
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
.none {
  display: none;
}
</style>
