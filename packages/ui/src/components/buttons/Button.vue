<script setup lang="ts">
const { type = 'button' } = defineProps<{
  type: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button flex-center w-10 h-5 rounded-md :type="type">
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
button {
  outline: none;
  border: none;
  background-image: linear-gradient(to right, #16a34a, #22c55e);
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
</style>
