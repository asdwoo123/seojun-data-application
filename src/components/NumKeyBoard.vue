<template>
  <el-popver trigger="click" placement="bottom" width="280" v-model="visible" @show="handleOpenShow">
    <div slot="content" style="position: absolute; width: 300px; padding: 10px; left: 0; top: 100px; background-color: #fff;">
      <div class="flex" style="flex-wrap: wrap;">
        <div :key="n" v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0]"
             @click="handleKeyClick(n)" class="flex center key-box">
          {{ n }}
        </div>
        <div class="flex center key-box"
             @click="handleKeyClick('.')">
          .
        </div>
      </div>
      <div class="flex column">
        <div @click="handleKeyClick('←')"
             class="flex center key-box">
          ←
        </div>
        <div class="flex center key-box" @click="handleKeyClick('Clear')">
          Clear
        </div>
        <div class="flex center key-box" @click="visible=false">
          Enter
        </div>
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
       } /*else if (n === 'Clear') {

       } else (n !== 'Enter' && n !== 'Clear') {
         const index = value.indexOf('.')
         if (n === '.' && index !== -1) return
         if (index !== -1 && value.length - 1 > index) return;

         value = (value === '0' && n !== '.') ? n + '' : value + n
       }
*/
      this.$emit('input', value)
    },
    handleOpenShow() {
      this.reset = true
    }
  }
}
</script>

<style scoped>
.key-box {
  width: 60px;
  height: 60px;
  border: 1px solid #d2d2d2;
  border-radius: 10px;
  font-size: 20px;
  margin: 5px;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
