<template>
  <a-layout-content style="padding: 28px;">
    <div class="flex" style="justify-content: flex-end; margin-bottom: 20px;">
      <a-popover trigger="click" placement="bottom">
        <template slot="content">
          <div class="flex">
            <a-input-password v-model="password" style="margin-right: 10px;"/>
            <a-button @click="deleteLogAll">Delete All</a-button>
          </div>
        </template>
        <a-button type="danger">
          Delete All
        </a-button>
      </a-popover>
    </div>
    <a-table :columns="column" :data-source="dataSource" :pagination="{ pageSize: 10 }"/>
    <a-modal :visible="passwordVisible" @cancel="passwordVisible=false" title="Please enter a password">
      <a-form @submit="deleteLogAll">
        <div class="label">
          Password
        </div>
      </a-form>
    </a-modal>
  </a-layout-content>
</template>

<script>
import {getDB, deleteAllDB} from '@/utils/lowdb'
import moment from 'moment'
import bus from '../utils/bus'

const column = [
  {
    title: 'Station',
    dataIndex: 'stationName',
    key: 'stationName'
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time'
  },
  {
    title: 'Ip',
    dataIndex: 'ip',
    key: 'ip'
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message'
  }
]

export default {
  name: "Log",
  data: () => ({
    column,
    dataSource: [],
    pageSize: 30,
    password: '',
    passwordVisible: false
  }),
  methods: {
    loadDataSource() {
      const dataSource = getDB('log').sort((a, b) => new Date(b.time) - new Date(a.time)).map((v, i) => {
        v.key = i.toString();
        v.time = moment(v.time).format('YYYY-MM-DD h:mm:ss a');
        return v;
      });

      this.dataSource = dataSource
    },
    deleteLogAll() {
      if (this.password === getDB('password')) {
        deleteAllDB('log')
        this.loadDataSource()
      }
    }
  },
  mounted() {
    this.loadDataSource()
    bus.$on('logUpdate', () => this.loadDataSource())
  },
  beforeDestroy() {
    bus.$off('logUpdate')
  }
}
</script>

<style scoped>
.label {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 15px;
}
</style>
