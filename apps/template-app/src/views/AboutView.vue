<script setup lang="ts">
import { Button, Input } from '@repo/ui'
</script>

<template>
  <div class="about" flex-center>
    <h1>This is an about page</h1>
    <Button type="submit">Click me</Button>
    <Input />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
