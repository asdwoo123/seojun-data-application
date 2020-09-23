<template>
<div class="con-box" style="padding: 24px 16px; background-color: white; overflow: scroll;">
  <a-table :bordered="true" :pagination="false" :loading="loading" :columns="columns" :data-source="dataSource" :row-selection="rowSelection()" />
  <div v-if="pageCount" style="float: right; margin-top: 15px;">
    <a-pagination show-quick-jumper :current="pageNumber" :default-current="1" :total="pageCount" @change="pageChange" />
  </div>
</div>
</template>

<script>
export default {
  name: "SaveDataTable",
  props: ['loading', 'columns', 'dataSource', 'pageCount', 'pageNumber', 'pageChange', 'rowSelection']
}
</script>

<style scoped>

</style>
