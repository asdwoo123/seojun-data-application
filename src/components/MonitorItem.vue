<template>
  <div v-if="projectData">
    <div class="flex">
      <div style="font-size: 1.3125rem; font-weight: 500; padding: 14px 0 25px 24px;">{{ productName }}</div>
      <a-alert v-if="projectData && !projectData[1].every(station => station.state)"
               style="height: 40px; margin-top: 7px; margin-left: 30px;"
               type="error" message="All machine must be connected"/>
    </div>
    <a-row v-if="projectData" type="flex" :gutter="16">
      <a-col :xs="24" :sm="24" :md="12" :lg="6" style="padding-bottom: 16px;" v-for="(station, index) in projectData[1]"
             :key="index">
        <a-card class="con-box" :title="station.stationName">
          <div slot="extra" class="flex center-v">
            <a-button type="primary" style="margin-right: 20px;" @click="showStationHistory(productName, station.stationName)">
              History
            </a-button>
            <div :class="(station.state) ? 'led-green' : 'led-red'"></div>
          </div>
          <p class="flex between" style="padding-bottom: 8px;">
            <span class="key-box">barcode</span>
            <span class="val-box">{{ station.productId }}</span>
          </p>
          <p class="flex between" style="padding-bottom: 8px;">
            <span class="key-box">updatedAt</span>
            <span class="val-box">{{ station.updatedAt }}</span>
          </p>
          <p v-for="(v, i) in station.data" :key="i" class="flex between" style="padding-bottom: 8px;">
            <span class="key-box">{{ v.dataName }}</span>
            <span class="val-box">{{ v.dataValue }}</span>
          </p>
        </a-card>
      </a-col>
    </a-row>
    <a-modal :visible="visible" :width="1624" @cancel="modalClose">
      <div class="con-box" style="overflow: scroll;">
        <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered>
          <template v-for="column in columns.slice(3)">
            <span :key="column.key" :slot="column.dataIndex" slot-scope="text">{{ text + 1 }}</span>
<!--                        <div :key="column.key" style="text-align: center;" :class="selectColor(text, column.standard)">{{ text }}</div>
                        <a-table-column :key="column.key" :title="column.title" :data-index="column.dataIndex">
                          <template slot-scope="text">
                            <div v-if="columnIndex < 3" style="text-align: center;">{{ text }}</div>
                            <div v-else style="text-align: center;" :class="selectColor(text, column.standard)">{{ text }}</div>
                          </template>
                        </a-table-column>-->
          </template>
        </a-table>
        <div v-if="pageCount" style="float: right; margin-top: 15px;">
          <a-pagination show-quick-jumper :current="pageNumber" :default-current="1" :total="pageCount"
                        @change="pageChange"/>
        </div>
        <div style="clear: both;"/>
      </div>
      <template slot="footer">
        <div/>
      </template>
    </a-modal>
  </div>
</template>

<script>
import {chain} from "lodash";
import {upperFirst} from 'lodash';
import {getDB} from '@/utils/lowdb';
import {getCollection} from '@/utils/mongodb';
import moment from "moment";
import $ from 'jquery';
import bus from '@/utils/bus';


export default {
  name: "MonitorItem",
  props: ['data', 'productName'],
  data: () => ({
    columns: [],
    dataSource: [],
    pageCount: null,
    visible: false,
    pageNumber: 1,
    stationName: ''
  }),
  computed: {
    projectData() {
      return chain(this.$store.state.stationData).groupBy('productName').toPairs().value().find(p => p[0] === this.productName)
    }
  },
  mounted() {
    bus.$on('MonitorUpdate', ({productName, stationName}) => {
      if (this.visible) {
        this.loadDataSource(productName, stationName, null)
      }
    })
  },
  beforeDestroy() {
    bus.$off('MonitorUpdate')
  },
  updated() {
    $('.misData').parent().addClass('misData2')
    $('.yesData').parent().addClass('yesData2')
  },
  methods: {
    showStationHistory(productName, stationName) {
      const projects = getDB('project')
      const project = projects.find(p => p.productName === productName)
      const station = project.stations.find(s => s.stationName === stationName)

      this.columns = [
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
        {
          title: 'UpdatedAt',
          dataIndex: 'updatedAt',
          key: 'updatedAt'
        },
        ...station.data.filter(v => v.use).map(v => ({
          title: upperFirst(v.dataName),
          dataIndex: v.dataName,
          key: v.dataName,
          standard: v.standard
        }))
      ]

      this.loadDataSource(productName, stationName, null, () => {
        this.visible = true
        this.productName = productName
        this.stationName = stationName
      })
    },
    loadDataSource(productName, stationName, paging, callback) {
      const collection = getCollection(productName)

      if (!paging) {
        collection.find({}).count((err, pageCount) => {
          this.pageCount = pageCount
        });
        paging = 1;
      }

      collection.find({}).sort({createdAt: -1}).limit(30)
          .skip((paging - 1) * 30).toArray((err, completes) => {
        if (err) return
        if (completes.length > 0) {
          const dataSource = completes.map(complete => {
            const key = complete.id.toString() || '1'
            const productId = complete.productId || ''
            const createdAt = moment(complete.createdAt).format('YYYY-MM-DD h:mm:ss a');
            const updatedAt = moment(complete.updatedAt).format('YYYY-MM-DD h:mm:ss a');
            const station = complete['stations'].find(s => s.stationName === stationName);
            if (station) {
              const data = station.data.reduce((acc, one) => {
                let dataValue = one.dataValue

                if (typeof dataValue === 'boolean') {
                  dataValue = (dataValue) ? 'True' : 'False'
                }

                if (!Number.isInteger(dataValue)) {
                  dataValue = dataValue.toFixed(1)
                }

                return {...acc, [one.dataName]: dataValue}
              }, {});

              return {
                key,
                productId,
                createdAt,
                updatedAt,
                ...data
              }
            } else {
              return null
            }
          }).filter(v => v)
          this.dataSource = [...dataSource]
        } else {
          this.dataSource = []
        }

        if (callback) {
          callback()
        }
      })
    },
    pageChange(pageNumber) {
      this.pageNumber = pageNumber
      this.loadDataSource(this.productName, this.stationName, pageNumber)
    },
    modalClose() {
      this.visible = false
    },
    selectColor(value, standard) {
      if (!value || !standard) return ''

      const result = Object.entries(standard).filter(v => v[1] !== '')
          .every(v => {
            let r
            switch (v[0]) {
              case 'min':
                r = value >= v[1]
                break
              case 'max':
                r = value <= v[1];
                break
              case 'equal':
                if (['True', 'False'].some(i => value === i)) {
                  r = value === v[1]
                } else {
                  r = true;
                }
                break
              default:
                r = false
                break
            }

            return r
          })

      if (result) {
        return 'yesData'
      } else {
        return 'misData'
      }
    }
  }
}
</script>

<style scoped>

.key-box {
  font-weight: 600;
}

.val-box {
  font-weight: 400;
  color: #000000;
}
</style>
