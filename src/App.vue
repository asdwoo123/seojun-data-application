<template>
  <div id="app">
    <MainLayout />
  </div>
</template>

<script>
import MainLayout from "@/layouts/MainLayout";
import { mongodbConnect } from '@/utils/mongodb'
import { connectOPC } from '@/utils/opcua'

export default {
  name: 'app',
  components: {
    MainLayout
  },
  mounted() {
    mongodbConnect()
    connectOPC()
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
</style>
