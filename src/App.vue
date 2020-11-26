<template>
  <div id="app">
    <MainLayout v-if="isConnect" :class="(darkMode) ? 'dark-mode' : null" />
    <DatabaseLoading v-else />
  </div>
</template>

<script>
import MainLayout from "@/layouts/MainLayout";
import { mongodbConnect } from '@/utils/mongodb';
import { connectOPC } from '@/utils/opcua';
import bus from '@/utils/bus';
import DatabaseLoading from "@/layouts/DatabaseLoading";
import { getDB } from '@/utils/lowdb';

export default {
  name: 'app',
  components: {
    DatabaseLoading,
    MainLayout
  },
  data: () => ({
    isConnect: false
  }),
  computed: {
    darkMode() {
      return this.$store.state.darkMode
    }
  },
  mounted() {
    bus.$on('mongodb', () => {
      this.isConnect = true
    })

    mongodbConnect(connectOPC)
    const settings = getDB('settings')
    const darkMode = settings['darkMode']
    if (darkMode) {
      this.$store.commit('changeMode', true)
    }
  }
}
</script>

<style>
#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #353c4e;
  height: 100%;
}
</style>
