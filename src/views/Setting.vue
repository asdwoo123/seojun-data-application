<template>
  <a-layout-content style="padding: 28px;">
    <!--    <div class="flex" style="justify-content: flex-end; margin-bottom: 24px;">
          <a-button type="primary" style="margin-right: 8px;">Save settings</a-button>
          <a-button type="primary">Reset settings</a-button>
        </div>-->
    <div class="con-box">
      <div class="setting-item">
        <div class="setting-label">
          Auto launch
        </div>
        <a-switch v-model="settings.autoLaunch" @change="autoLaunchOnChange"/>
      </div>
      <div class="setting-item" :class="(darkMode) ? 'dark-item' : null">
        <div class="setting-label">
          Dark mode
        </div>
        <a-switch v-model="settings.darkMode" @change="modeOnChange"/>
      </div>
    </div>
  </a-layout-content>
</template>

<script>
import AutoLaunch from 'auto-launch'
import { getDB, setDB } from '@/utils/lowdb'

const autoLauncher = new AutoLaunch({
  name: 'SEOJUNENG-APPLICATION'
})

export default {
  name: "Setting",
  data: () => ({
    settings: {
      darkMode: false,
      autoLaunch: false
    }
  }),
  computed: {
    darkMode() {
      return this.$store.state.darkMode
    }
  },
  created() {
    autoLauncher.isEnabled().then(launch => {
      this.settings.autoLaunch = launch
    })

    this.settings.darkMode = this.$store.state.darkMode
  },
  methods: {
    autoLaunchOnChange(checked) {
      if (checked) {
        autoLauncher.enable()
      } else {
        autoLauncher.disable()
      }
    },
    modeOnChange(checked) {
      this.$store.commit('changeMode', checked)
      const settings = getDB('settings')
      setDB('settings', {
        ...settings,
        darkMode: checked
      })
    }
  }
}
</script>

<style scoped lang="less">

</style>
