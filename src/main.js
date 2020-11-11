import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/ant-design-vue.js'
import '@/styles/index.less'
import AutoLaunch from 'auto-launch'

const autoLauncher = new AutoLaunch({
  name: 'seojuneng-application'
})

autoLauncher.isEnabled()
    .then((isEnabled) => {
      if (!isEnabled) autoLauncher.enable()
    })

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
