<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores'

const store = useAppStore()

onMounted(() => {
  store.initTheme()
})
</script>
