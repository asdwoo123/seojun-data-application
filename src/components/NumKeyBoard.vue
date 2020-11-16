<template>
  <el-popver trigger="click" placement="bottom" width="280" v-model="visible" @show="handleOpenShow">
    <div slot="content" class="flex" style="position: absolute; width: 300px; padding: 10px; left: 0; top: 100px; background-color: #fff; flex-wrap: wrap;">
      <div :key="n" v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0]"
           @click="handleKeyClick(n)" class="flex center key-box">
        {{ n }}
      </div>
      <div class="flex center key-box" @click="visible=false">
        Enter
      </div>
    </div>
    <slot></slot>
  </el-popver>
</template>

<script>
export default {
  name: "NumKeyBoard",
  props: ['type', 'value'],
  data: () => ({
    visible: false,
    reset: false
  }),
  methods: {
    handleKeyClick(n) {
      let value = this.value.toString()
       if (this.reset) {
         value = (this.type !== 'password') ? '0' : ''
       }

       if (n === '←') {
         value = value.substr(0, value.length - 1)
       } /*else if ()*/
    },
    handleOpenShow() {
      this.reset = true
    }
  }
}
</script>

<style scoped>
.key-box {
  width: 82px;
  height: 82px;
  border: 1px solid #d2d2d2;
  border-radius: 10px;
  font-size: 20px;
  margin: 5px;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
