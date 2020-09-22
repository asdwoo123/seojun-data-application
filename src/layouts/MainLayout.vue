<template>
  <a-layout style="height: 100%;">
    <a-layout-header>
      <div style="float: left; width: 240px;"><img width="100" src="../assets/seojuneng-logo.png" alt="logo"></div>
      <a-menu @click="onModeChange" style="display: inline-block; line-height: 64px;" v-model="current" mode="horizontal">
        <template v-for="rn in routeNames">
        <a-menu-item :key="rn">
          {{ rn }}
        </a-menu-item>
        </template>
      </a-menu>
    </a-layout-header>
      <router-view />
  </a-layout>
</template>

<script>
import router from "@/router";
import routes from '@/router/routes'

const routeNames = routes.map(r => r.name)

export default {
  name: "MainLayout",
  router,
  data: () => ({
    current: [routeNames[0]],
    routeNames
  }),
  methods: {
    onModeChange({ key }) {
      if (this.$route.path === `/${key.toLowerCase()}`) return
      this.$router.push(`/${key.toLowerCase()}`)
    }
  }
}
</script>

<style scoped>

</style>
