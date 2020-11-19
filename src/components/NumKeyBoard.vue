<template>
  <a-popover  placement="rightBottom" v-model="visible" @show="handleOpenShow" trigger="click">
      <div class="con-box" slot="content"
           style="width: 300px; padding: 10px; background-color: #fff;">
        <div class="key-screen" @keyup="handleOnKeyUp">
          {{ value }}
        </div>
        <div class="flex">
        <div class="flex" style="flex-wrap: wrap;" >
          <div :key="n" v-for="n in [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '']"
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
            <div class="flex center key-box" @click="visible=false" style="height: 130px;">
              Enter
            </div>
          </div>
        </div>


<!--        <div class="flex column">



        </div>-->
      </div>

<!--  <a-button @click="visible=true" :style="{width: width || '184px', height: height || '32px'}" @keyup="handleOnKeyUp">
    {{ value }}
  </a-button>-->
    <slot></slot>
  </a-popover>
</template>

<script>
import {range} from 'lodash'

export default {
  name: "NumKeyBoard",
  props: ['type', 'value', 'width', 'height'],
  data: () => ({
    visible: false,
    reset: false
  }),
  computed: {
    numBlind() {
      return this.value.split('').map(() => '●').join('')
    },
    numNonBlind() {
      return this.value
    }
  },
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
      const key = e.key
      if (key === 'Enter') {
        this.visible = false
      } else if (key === 'Backspace') {
        this.handleKeyClick('←')
      } else if (range(10).some(n => n.toString() === key)) {
        this.handleKeyClick(key)
      }
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
  margin-bottom: 8px;
  font-size: 20px;
  padding: 15px 20px;
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
