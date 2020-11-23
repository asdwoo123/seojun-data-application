<template>
  <a-layout style="height: 100%; background-color: #1a1b37;">
    <a-layout-sider style="width: 200px;">
      <a-menu v-model="current" v-if="productNames.length > 0" :default-selected-keys="[0]"
              theme="dark" style="height: 100%;">
        <template v-for="(productName, index) in productNames">
          <a-menu-item style="margin-top: 0;" :key="index">
            <span>{{ productName }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout-content style="padding: 28px;">
        <MonitorItem v-if="stationData.length > 0" :data="stationData" :productName="productNames[current[0]]" />
    </a-layout-content>
  </a-layout>
</template>

<script>
import {getDB} from '@/utils/lowdb'
import MonitorItem from "@/components/MonitorItem";
import bus from "@/utils/bus";


export default {
  name: "Monitor",
  components: {MonitorItem},
  data: () => ({
    productNames: [],
    current: [0]
  }),
  computed: {
    stationData() {
      return this.$store.state.stationData
    }
  },
  created() {
    this.productNames = getDB('project').map(p => p.productName)


    bus.$on('stationCheck', ({ productName, stationName }) => {
      this.$notification['warning']({
        message: '이전 공정의 작업이 완료되었는지 확인해주세요',
        description: `${productName} - ${stationName}`,
        placement: 'bottomRight',
        duration: 3
      })
    })
  }
}
</script>

<style scoped>

</style>
