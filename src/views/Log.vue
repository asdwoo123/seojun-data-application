<template>
  <a-layout-content style="padding: 28px;">
    <div class="flex" style="justify-content: flex-end; margin-bottom: 20px;">
      <!--      <a-popover trigger="click" placement="bottom">
              <template slot="content">
                <div class="flex">
                  <a-input-password v-model="password" style="margin-right: 10px;"/>
                  <a-button @click="deleteLogAll">Delete All</a-button>
                </div>
              </template>-->
      <a-button type="danger" @click="passwordVisible=true">
        Delete All
      </a-button>
      <!--      </a-popover>-->
    </div>
    <a-table :columns="column" :data-source="dataSource" :pagination="{ pageSize: 10 }"/>
    <a-modal :visible="passwordVisible" @cancel="passwordVisible=false" title="Please enter a password">
      <a-form @submit="deleteLogAll">
        <div class="label">
          Password
        </div>
        <NumKeyBoard v-model="password" type="password">
          <a-input-password v-model="password"/>
        </NumKeyBoard>
        <a-button type="primary" html-type="submit" style="width: 100%; margin-top: 20px;">
          Delete all
        </a-button>
      </a-form>
    </a-modal>
  </a-layout-content>
</template>

<script>
import {getDB, deleteAllDB} from '@/utils/lowdb'
import moment from 'moment'
import bus from '../utils/bus'
import NumKeyBoard from "@/components/NumKeyBoard";

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
  components: {NumKeyBoard},
  data: () => ({
    column,
    dataSource: [],
    pageSize: 30,
    password: '',
    passwordVisible: false
  }),
  computed: {
    darkMode() {
      return this.$store.state.darkMode
    }
  },
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
        this.password = ''
        this.passwordVisible = false
        this.$message.success('All logs have been deleted')
      } else {
        this.$message.error('Passwords do not match')
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

<style scoped lang="less">
.label {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 15px;
}

.layout {
  background-color: #f0f2f5;
}

.dark-layout {
  background-color: #252b3f;
}
</style>
