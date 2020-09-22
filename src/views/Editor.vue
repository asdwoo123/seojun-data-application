<template>
  <a-content style="padding: 24px; background-color: #f0f2f5;">
    <div class="flex" style="margin-bottom: 16px; justify-content: flex-end;">
      <a-button type="primary">
        Add project
      </a-button>
    </div>
  </a-content>
</template>

<script>
import { connectOPC, disconnect } from '@/utils/opcua'
import { clone } from 'lodash'
import {Container, Draggable} from 'vue-smooth-dnd'


export default {
  name: "Editor",
  methods: {
  }
}
</script>

<style scoped>

</style>
