<template>
  <div v-if="projectData">
    <div class="flex">
      <div style="font-size: 1.3125rem; font-weight: 500; padding: 14px 0 25px 24px;">{{ productName }}</div>
      <a-alert v-if="projectData && !projectData[1].every(station => station.state)" style="height: 40px; margin-top: 7px; margin-left: 30px;"
               type="error" message="All machine must be connected"/>
    </div>
        <a-row v-if="projectData" type="flex" :gutter="16">
          <a-col :xs="24" :sm="12" :md="8" :lg="6" style="padding-bottom: 16px;" v-for="(station, index) in projectData[1]" :key="index">
            <a-card class="con-box" :title="station.stationName">
              <div slot="extra" :class="(station.state) ? 'led-green' : 'led-red'"></div>
              <p class="flex between" style="padding-bottom: 8px;">
                <span class="key-box">barcode</span>
                <span class="val-box">{{ station.productId }}</span>
              </p>
              <p v-for="(v, i) in station.data" :key="i" class="flex between" style="padding-bottom: 8px;">
                <span class="key-box">{{ v.dataName }}</span>
                <span class="val-box">{{ v.dataValue }}</span>
              </p>
            </a-card>
          </a-col>
        </a-row>
  </div>
</template>

<script>

import {chain} from "lodash";

export default {
  name: "MonitorItem",
  props: ['data', 'productName'],
  computed: {
    projectData() {
      return chain(this.$store.state.stationData).groupBy('productName').toPairs().value().find(p => p[0] === this.productName)
    }
  }
}
</script>

<style scoped>

.key-box {
  font-weight: 600;
}
.val-box {
  font-weight: 400;
  color: #000000;
}
</style>
