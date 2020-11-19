<template>
  <a-modal :visible="visible" :title="(change) ? 'Change password' : 'Save project'">

    <template slot="footer">
      <div/>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: "PasswordModal",
  props: ['visible', 'change'],
  data: () => ({
    password: '',
    changePassword: '',
    formLayout: 'vertical',
    form: this.$form.createForm(this, { name: 'pwd' })
  }),
  methods: {
    handleSubmit(e) {
      e.preventDefault()

    }
  }
}
</script>

<style scoped>

</style>
