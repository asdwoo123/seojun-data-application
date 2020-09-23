<template>
  <div>
    <div class="flex">
      <div style="font-size: 1.3125rem; font-weight: 500; padding: 14px 0 25px 24px;">{{ data[0] }}</div>
      <a-alert v-if="data[1].every(station => station.state)" style="height: 40px; margin-top: 7px; margin-left: 30px;"
               type="error" message="All machine must be connected"/>
    </div>
    <a-row type="flex" :gutter="16">
      <a-col :lg="6" :md="12" style="padding-bottom: 16px;" v-for="(station, index) in data[1]" :key="index">
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
export default {
  name: "MonitorItem",
  props: ['data']
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
