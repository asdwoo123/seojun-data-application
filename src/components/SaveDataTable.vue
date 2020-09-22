<template>
<div class="con-box" style="padding: 24px 16px; background-color: white; overflow: scroll;">
  <a-table :bordered="true" :pagination="false" :loading="loading">

  </a-table>
</div>
</template>

<script>
export default {
  name: "SaveDataTable",
  props: ['loading']
}
</script>

<style scoped>

</style>
