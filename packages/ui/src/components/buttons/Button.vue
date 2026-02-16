<script setup lang="ts">
const { type = 'button' } = defineProps<{
  type: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button rounded-md flex-center h-8 w-20 border="1 solid green" :type="type">
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
