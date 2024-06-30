import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    toggleSidebarState: false,
    audios: null,
    mic: false,
     name: "John Doe",
  age: 30,
  gender: "Male",
  email: "john.doe@example.com",
  mentalHealthConcerns: "Anxiety and depression",
  diagnosedConditions: "Generalized Anxiety Disorder",
  pastTreatments: "Cognitive Behavioral Therapy",
  currentMedications: "Sertraline 50mg",
  symptomSeverityChanges: "Graph showing changes in symptom severity",
  notableImprovements: "Significant reduction in anxiety levels",
  keyPatterns: "Increased anxiety during stressful events",
  sleepPatterns: "Average 6 hours per night, difficulty falling asleep",
  dietInsights: "Balanced diet, occasional junk food",
  physicalActivity: "Moderate exercise 3 times a week",
  substanceUse: "No substance use reported",
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    updateMic(newVal) {
      this.mic = newVal;
    },
    updateAudio(newVal) {
      this.audios = newVal;
    },
      triggerRunFunction() {
      this.runFunction();
    },
  },
});
