<template>
  <a-layout style="height: 100%;">
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
    <a-layout-content style="padding: 24px;">
        <MonitorItem :data="stationData[current[0]]" />
    </a-layout-content>
  </a-layout>
</template>

<script>
import {getDB} from '@/utils/lowdb'
import {chain} from 'lodash'
import MonitorItem from "@/components/MonitorItem";

let productNames = getDB('project')

if (Array.isArray(productNames)) {
  productNames = productNames.map(p => p.productName)
}

export default {
  name: "Monitor",
  components: {MonitorItem},
  data: () => ({
    productNames,
    current: [0]
  }),
  computed: {
    stationData() {
      return chain(this.$store.state.stationData).groupBy('productName').toPairs().value()
    }
  }
}
</script>

<style scoped>

</style>
