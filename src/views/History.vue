<template>
  <a-layout-content style="padding: 24px;">
    <div class="flex between" style="margin-bottom: 20px;">
      <div class="row">
        <a-select :default-value="productNames[0]" style="width: 120px; margin-right: 10px;">
          <template v-for="(productName, index) in productNames">
            <a-select-option :key="index" :value="productName">
              {{ productName }}
            </a-select-option>
          </template>
        </a-select>
        <a-input style="width: 254px; margin-bottom: 15px; margin-right: 10px;"
                 placeholder="barcode search" v-model="barcode" />
        <a-range-picker style="margin-right: 10px;" />
        <a-button type="primary" style="margin-right: 10px;">Reset <a-icon type="sync" /></a-button>
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="0">Search data</a-menu-item>
            <a-menu-item key="1">All data</a-menu-item>
          </a-menu>
          <a-button type="primary" style="width: 140px; margin-right: 10px;">
            Export to CSV
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>
      <a-button type="danger" style="margin-right: 10px;">
        Delete
      </a-button>
    </div>
    <SaveDataTable />
  </a-layout-content>
</template>

<script>
import {getDB} from '@/utils/lowdb'
import SaveDataTable from "@/components/SaveDataTable";

const productNames = getDB('project').map(p => p.productName)

export default {
  name: "History",
  components: {SaveDataTable},
  data: () => ({
    productNames,
    barcode: '',
    period: []
  })
}
</script>

<style scoped>

</style>
