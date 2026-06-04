<script setup lang="ts">
import { Input, Button } from '@repo/ui'
</script>

<template>
  <div p-8>
    <h1
      text-2xl
      font-bold
    >
      About
    </h1>
    <div>
      <Input placeholder="Enter your name" />
      <Button type="button">
        Submit
      </Button>
    </div>
  </div>
</template>
