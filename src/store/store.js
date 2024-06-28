import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    toggleSidebarState: false,
    audios: null,
    mic:false,
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
