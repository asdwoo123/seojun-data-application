<template>
  <a-popver placement="bottom" v-model="visible" @show="handleOpenShow">
    <template slot="content">
      <div class="con-box"
           style="width: 300px; padding: 10px; background-color: #fff;">
        <div class="key-screen">
          {{ value }}
        </div>
        <div class="flex" style="flex-wrap: wrap;" @keyup="handleOnKeyUp">
          <div :key="n" v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0]"
               @click="handleKeyClick(n)" class="flex center key-box">
            {{ n }}
          </div>
          <div v-if="type === 'password'" class="flex center key-box"/>
          <div v-else class="flex center key-box"
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
    </template>
  <a-button slot="reference" @click="visible=true" style="position: absolute; top: 0; right: 0;" :style="{width: width || '184px', height: height || '32px'}">
    {{ value }}
  </a-button>
<!--    <slot></slot>-->
  </a-popver>
</template>

<script>
export default {
  name: "NumKeyBoard",
  props: ['type', 'value', 'width', 'height'],
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
        if (value === '' && this.type !== 'password') value = '0'
      } else if (n !== 'Enter' && n !== 'Clear' && n !== '') {
        const index = value.indexOf('.')
        if (n === '.' && index !== -1) return
        if (index !== -1 && value.length - 1 > index) return;

        value = (value === '0' && n !== '.') ? n + '' : value + n
      } else {
        value = (this.type !== 'password') ? '0' : ''
      }

      this.$emit('input', value)
    },
    handleOpenShow() {
      this.reset = true
    },
    handleOnKeyUp(e) {
      console.log(e)
    }
  }
}
</script>

<style scoped>
.key-screen {
  width: 270px;
  border: 1px solid #d2d2d2;
  height: 60px;
  margin-left: 5px;
  border-radius: 10px;
}
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
