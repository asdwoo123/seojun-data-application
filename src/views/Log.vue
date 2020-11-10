<template>
  <a-layout-content style="padding: 28px;">
    <a-table :columns="column" :data-source="dataSource" :pagination="{ pageSize: 30 }" />
  </a-layout-content>
</template>

<script>
import { getDB } from '@/utils/lowdb'
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
    pageSize: 30
  }),
  methods: {
    loadDataSource() {
      const dataSource = getDB('log').sort((a, b) => new Date(b.time) - new Date(a.time)).map((v, i) => {
        v.key = i.toString();
        v.time = moment(v.time).format('YYYY-MM-DD h:mm:ss a');
        return v;
      });

      this.dataSource = dataSource
    }
  },
  mounted() {
    this.loadDataSource()
    bus.$on('logUpdate', () => this.loadDataSource())
  }
}
</script>

<style scoped>

</style>
