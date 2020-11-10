<template>
  <a-modal :visible="visible" @ok="passwordCheck" @cancel="handleCancel">
    <div>
      <h3>비밀번호를 입력해 주세요</h3>
      <a-input-password v-model="password"/>
    </div>
  </a-modal>
</template>

<script>
import {getDB} from '@/utils/lowdb'

export default {
  name: "PasswordCheck",
  props: ['visible', 'checkComplete', 'handleCancel'],
  data: () => ({
    password: ''
  }),
  methods: {
    passwordCheck() {
      if (this.password === getDB('password')) {
        this.checkComplete()
      }
    }
  }
}
</script>

<style scoped>

</style>
