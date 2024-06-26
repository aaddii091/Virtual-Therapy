import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
toggleSidebarState: false,
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    updateRoomCode(newRoomCode) {
      this.roomCode = newRoomCode;
    },
      triggerRunFunction() {
      this.runFunction();
    },
  },
});
