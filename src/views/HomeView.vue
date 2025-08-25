<script setup lang="ts">
import { Button } from '@shared/ui/volt'
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-xl font-medium">Inicio</h2>
    <p class="text-muted">Bienvenido.</p>
    <div class="flex flex-wrap gap-4 justify-center">
      <Button icon="pi pi-home" aria-label="Save" />
      <Button label="Profile" icon="pi pi-user" />
      <Button label="Save" icon="pi pi-check" iconPos="right" />
    </div>
  </section>
</template>
