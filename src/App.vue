<template>
  <div id="app">
    <MainLayout v-if="isConnect" />
  </div>
</template>

<script>
import MainLayout from "@/layouts/MainLayout";
import { mongodbConnect } from '@/utils/mongodb'
import { connectOPC } from '@/utils/opcua'
import bus from '@/utils/bus'

export default {
  name: 'app',
  components: {
    MainLayout
  },
  data: () => ({
    isConnect: true
  }),
  mounted() {
    bus.$on('mongodb', () => {
      this.isConnect = true
    })

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
