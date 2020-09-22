import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stationData: [],
    theme: {}
  },
  mutations: {
    insertRealTime(state, payload) {

      if (Array.isArray(payload) && payload.length === 0) {
        state.stationData = []
        return
      }

      const result = state.stationData.find(v => (v.productName === payload.productName) && (v.stationName === payload.stationName))
      if (result) {
        const index = state.stationData.indexOf(result)
        state.stationData[index] = {
          ...state.stationData[index],
          ...payload
        }
      } else {
        state.stationData.push(payload)
      }
    }
  }
})
