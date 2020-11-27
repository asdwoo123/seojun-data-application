import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/ant-design-vue.js'
import '@/styles/index.less'
import 'vue2-event-calendar/dist/vue2-event-calendar.css'
import Calendar from 'vue2-event-calendar'

Vue.config.productionTip = false

Vue.component('Calendar', Calendar)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
