<script src="../../../async-test/app.js"></script>
<template>
  <a-layout-content style="padding: 24px;">
    <div class="flex between" style="margin-bottom: 20px;">
      <div class="row">
        <a-select :default-value="defaultProductName" style="width: 120px; margin-right: 10px;" @change="optionChange">
          <template v-for="(productName, index) in productNames">
            <a-select-option :key="index" :value="productName">
              {{ productName }}
            </a-select-option>
          </template>
        </a-select>
        <a-input style="width: 254px; margin-bottom: 15px; margin-right: 10px;"
                 placeholder="barcode search" :value="search" @change="searchInput"/>
        <a-range-picker style="margin-right: 10px;" :value="period" @change="daySearch"/>
        <a-button type="primary" style="margin-right: 10px;" @click="reset">Reset
          <a-icon type="sync"/>
        </a-button>
        <a-dropdown>
          <a-menu slot="overlay" @click="exportDataSource">
            <a-menu-item key="0">Search data</a-menu-item>
            <a-menu-item key="1">All data</a-menu-item>
          </a-menu>
          <a-button type="primary" style="width: 140px; margin-right: 10px;">
            Export to CSV
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>
      </div>
      <a-popover trigger="click" placement="bottom">
        <template slot="content">
          <div class="flex">
            <a-input-password v-model="password" style="margin-right: 8px;"/>
            <a-button @click="deleteRowSelected">Delete</a-button>
          </div>
        </template>
        <a-button type="danger" style="margin-right: 10px;">
          Delete
        </a-button>
      </a-popover>
    </div>
    <SaveDataTable :columns="columns" :dataSource="dataSource" :loading="loading" :pageCount="pageCount"
                   :pageNumber="pageNumber" :pageChange="pageChange" :rowSelection="rowSelection"/>
  </a-layout-content>
</template>

<script>
import moment from 'moment'
import {upperFirst} from 'lodash'
import {remote} from 'electron'
import fs from 'fs'
import stringify from 'csv-stringify'
import {getDB} from '@/utils/lowdb'
import {getCollection} from '@/utils/mongodb'
import SaveDataTable from "@/components/SaveDataTable";
import bus from '@/utils/bus'


const {dialog} = remote

export default {
  name: "History",
  components: {SaveDataTable},
  data: () => ({
    productNames: [],
    defaultProductName: '',
    option: 0,
    search: '',
    period: [],
    loading: true,
    columns: [],
    dataSource: [],
    dateString: [],
    visible: false,
    modalData: null,
    pageCount: null,
    pageNumber: 1,
    collections: [],
    selectedRowKeys: [],
    password: '',
    popupVisible: false
  }),
  created() {
    this.productNames = getDB('project').map(p => p.productName)
    this.defaultProductName = this.productNames[0]
    this.collections = this.productNames.map(n => getCollection(n))
  },
  mounted() {
    this.loadColumns()
    this.loadDataSource()

    bus.$on('historyUpdate', () => {
      this.loadDataSource()
    })
  },
  methods: {
    optionChange(option) {
      this.option = this.productNames.indexOf(option)
      this.loadColumns()
      this.loadDataSource()
      this.pageNumber = 1
    },
    searchInput(e) {
      const value = e.target.value
      this.search = value
      this.loadDataSource()
    },
    daySearch(date, dateString) {
      this.period = date
      this.dateString = dateString
      this.loadDataSource()
    },
    reset() {
      this.search = ''
      this.period = []
      this.dateString = []
      this.loadDataSource()
    },
    rowSelection() {
      return {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        }
      }
    },
    deleteRowSelected() {
      if (this.password === getDB('password')) {
        this.selectedRowKeys.forEach(id => {
          this.collections[this.option].deleteOne({'id': id}, (err) => {
            if (err) return
            this.loadData()
          })
        });
      }
    },
    loadColumns() {
      if (this.productNames.length === 0) return

      const columns = [
        {
          title: 'Barcode',
          dataIndex: 'productId',
          key: 'productId'
        },
        {
          title: 'CreatedAt',
          dataIndex: 'createdAt',
          key: 'createdAt'
        },
        ...getDB('project')[this.option].stations.map(station => ({
          title: upperFirst(station.stationName),
          children: station.data.map(v => ({
            title: upperFirst(v.dataName),
            dataIndex: v.dataName,
            key: v.dataName
          }))
        }))
      ]
      this.columns = [...columns]
    },
    loadDataSource(paging) {
      if (this.collections.length === 0) return
      const collection = this.collections[this.option]
      const query = {}

      if (this.search !== '') query.productId = {'$regex': this.search};
      if (this.dateString.length > 0) query.createdAt = {
        '$gte': moment(this.dateString[0]).toDate(),
        '$lt': moment(this.dateString[1]).toDate()
      };
      if (!paging) {
        collection.find(query).count((err, pageCount) => {
          this.pageCount = pageCount
        });
        paging = 1;
      }

      collection.find(query).sort({createdAt: -1}).limit(10)
          .skip((paging - 1) * 10).toArray((err, completes) => {
        if (err) return

        if (completes.length > 0) {
          this.completes = completes
          const dataSource = completes.map(complete => {
            const key = complete.id.toString()
            const productId = complete.productId
            const createdAt = moment(complete.createdAt).format('YYYY-MM-DD h:mm:ss a');
            const com = (complete['station'] || complete['stations']).map((station, index) => station.data.reduce((acc, one) => (
                {...acc, [one.dataName + '-' + (index + 1)]: one.dataValue}
            ), {}));
            const data = com.reduce((acc, one) => ({...acc, ...one}), {});
            return {
              key,
              productId,
              createdAt,
              ...data
            }
          })

          this.dataSource = [...dataSource]
        }
        this.loading = false
      })
    },
    pageChange(pageNumber) {
      this.pageNumber = pageNumber
      this.loadDataSource(pageNumber)
    },
    exportDataSource({key}) {
      const options = {
        defaultPath: '/data.csv',
      };
      let saveData
      let columns = {};
      const query = {}
      dialog.showSaveDialog(null, options)
          .then(({filePath}) => {
            if (key === '0') {
              if (this.search !== '') query.productId = {'$regex': this.search}
              if (this.period.length > 0) query.createdAt = {
                '$gte': this.period[0].toDate(),
                '$lt': this.period[1].toDate()
              };
            }
            this.collections[this.option].find(query).sort({createdAt: -1}).toArray((err, completes) => {
              if (!err) {
                if (completes.length > 0) {
                  saveData = completes.map((complete) => {
                    const productId = complete.productId;
                    const createdAt = moment(complete.createdAt).format('YYYY-MM-DD h:mm:ss a');
                    const com = (complete['station'] || complete['stations']).map((station) => station.data.reduce((acc, one) => (
                        {...acc, [one.dataName + '-' + (station.stationName)]: one.dataValue}
                    ), {}));
                    const data = com.reduce((acc, one) => ({...acc, ...one}), {});
                    return {
                      productId,
                      createdAt,
                      ...data
                    }
                  });

                  const keys = Object.keys(saveData[0]);
                  keys.forEach(k => {
                    columns = {
                      ...columns,
                      [k]: k
                    };
                  });

                  const values = saveData.map(v => Object.values(v));
                  stringify(values, {header: true, columns}, (err, output) => {
                    if (!err) {
                      fs.writeFile(filePath, output, function (err) {
                        if (err) {
                          this.$notification.open({message: 'Save failed', duration: 1.5});
                        } else {
                          this.$notification.open({message: 'Saved successfully', duration: 1.5});
                        }
                      });
                    }
                  });
                }
              }
            })
          })
    }
  }
}
</script>

<style scoped>

</style>
