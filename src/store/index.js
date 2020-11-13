import Vue from 'vue'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stationData: [],
    theme: {},
    confirmVisible: false,
    confirmMessage: '',
    stationNodes: []
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
        const stationData = cloneDeep(state.stationData)
        stationData[index] = {
          ...state.stationData[index],
          ...payload
        }

        state.stationData = stationData

      } else {
        state.stationData.push(payload)
      }
    },
    showConfirm(state, message) {
      state.confirmVisible = true
      state.confirmMessage = message
    },
    closeConfirm(state) {
      state.confirmVisible = false
    },
    insertStationNodes(state, payload) {
      console.log(payload)
      state.stationNodes = payload
    }
  }
})
