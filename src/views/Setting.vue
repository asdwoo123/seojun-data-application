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
      <div class="setting-item">
        <div class="setting-label">
          Dark mode
        </div>
        <a-switch v-model="settings.darkMode" @change="modeOnChange"/>
      </div>
      <div class="setting-item">
        <div>
          <div class="setting-label">
            History auto save
          </div>
          <a-switch v-model="settings.autoSave" @change="autoSaveChange"/>
        </div>
        <div>
          <div class="setting-label">
            <div>
              {{ folderPath }}
            </div>
            <a-button @click="selectFolder">
              Folder select
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-layout-content>
</template>

<script>
import AutoLaunch from 'auto-launch'
import {getDB, setDB} from '@/utils/lowdb'
import {remote} from 'electron'

const {dialog} = remote

const autoLauncher = new AutoLaunch({
  name: 'SEOJUNENG-APPLICATION'
})

export default {
  name: "Setting",
  data: () => ({
    settings: {
      darkMode: false,
      autoLaunch: false,
      autoSave: false
    },
    folderPath: ''
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
    },
    autoSaveChange(checked) {
      this.$store.commit('changeAutoSave', checked)
      const settings = getDB('settings')
      setDB('settings', {
        ...settings,
        autoSave: checked
      })
    },
    selectFolder() {
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then(({filePaths}) => {
        if (filePaths.length > 0) {
          this.folderPath = filePaths[0]
          const settings = getDB('settings')
          setDB('settings', {
            ...settings,
            folderPath: this.folderPath
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="less">

</style>
