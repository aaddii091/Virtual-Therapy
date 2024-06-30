import { defineStore } from "pinia";

export const useStore = defineStore("store", {
  state: () => ({
    toggleSidebarState: false,
    audios: null,
    mic: false,
    name: "Aditya Saxena",
    age: 21,
    gender: "Male",
    email:'aaddii091@gmail.com'
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
