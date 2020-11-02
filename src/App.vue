<template>
  <div id="app">
    <MainLayout v-if="isConnect" />
    <DatabaseLoading v-else />
  </div>
</template>

<script>
import MainLayout from "@/layouts/MainLayout";
import { mongodbConnect } from '@/utils/mongodb'
import { connectOPC } from '@/utils/opcua'
import bus from '@/utils/bus'
import DatabaseLoading from "@/layouts/DatabaseLoading";

export default {
  name: 'app',
  components: {
    DatabaseLoading,
    MainLayout
  },
  data: () => ({
    isConnect: false
  }),
  mounted() {
    bus.$on('mongodb', () => {
      this.isConnect = true
    })

    mongodbConnect(connectOPC)
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
