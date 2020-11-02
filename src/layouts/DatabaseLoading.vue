<template>
  <div style="height: 100%;" class="flex column center">
    <h3 style="font-size: 30px;">Connecting to the database {{ range(count).map(() => '.').join('') }}</h3>
  </div>
</template>

<script>
import { range } from 'lodash'

export default {
  name: "DatabaseLoading",
  data: () => ({
    range,
    count: 1
  }),
  mounted() {
    setInterval(() => {
      if (this.count < 3) {
        this.count ++
      } else {
        this.count = 1
      }
    }, 1000)
  }
}
</script>

<style scoped>

</style>
