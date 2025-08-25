<script setup lang="ts">
import { Button, ContrastButton, DangerButton } from '@shared/ui/volt'
</script>

<template>
  <section class="min-h-screen items-center">
    <h1 class="text-4xl bg-center self-center text-center">This is an about page</h1>
    <div class="card flex justify-center flex-wrap gap-4">
      <Button label="Primary" variant="text" />
    </div>
    <div class="card flex justify-center flex-wrap gap-4">
      <Button label="Primary" variant="text" />
      <ContrastButton label="Contrast" variant="text" />
      <DangerButton label="Danger" variant="text" />
    </div>
  </section>
</template>
