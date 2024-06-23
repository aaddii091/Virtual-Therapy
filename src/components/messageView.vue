<template>
  <div :class="props.role === 'user' ? 'human' : 'ai'" v-if="props.role">
    <div class="message_container human">
      <h1>{{ props.message }}</h1>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["message", "role"]);
</script>

<style scoped>
* {
  background: var(--background1);
}
.human {
  display: flex;
  color: var(--text) !important;
  justify-content: end;
}

.ai div {
  /* color: rgb(125, 255, 240) !important;
   */
  color: var(--text);
  display: flex;
  justify-content: start;
}

.message_container {
  width: calc(100vw - 50rem);
  color: var(--text);
  border-radius: 25px;
  height: auto;
  vertical-align: middle;
  border-radius: 25px;
  background-color: var(--background);
  margin: 1rem;
  border-radius: 15px;
  min-height: 3rem;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 16px;
}
h1 {
  padding: 0.25rem 0.5rem;
  font-size: 1.25rem;
  font-weight: 400;
}
</style>
