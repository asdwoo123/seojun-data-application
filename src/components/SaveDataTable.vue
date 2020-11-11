<template>
  <div class="con-box" style="padding: 24px 16px; background-color: white; overflow: scroll;">
    <a-table :customRow="handleRow" :bordered="true" :pagination="false" :loading="loading"
             :data-source="dataSource" :row-selection="rowSelection()">
      <template v-for="(column, columnIndex) in columns">
        <a-table-column v-if="columnIndex < 2" :key="column.key" :title="column.title" :data-index="column.dataIndex">
          <template slot-scope="text">
            <div style="text-align: center; padding: 16px;">{{ text }}</div>
          </template>
        </a-table-column>
        <a-table-column-group :key="columnIndex" v-else>
          <span style="white-space: nowrap;" slot="title">
            {{ column.title }}
          </span>
          <a-table-column v-for="(dc, dcIndex) in column.children" :key="dc.key" :data-index="dc.dataIndex">
            <div style="cursor: pointer;" slot="title">
              <!--조건 에디터-->
              <a-popover trigger="click" @click="initStandard(columnIndex - 2, dcIndex)">
                <template slot="content">
                  <div class="flex column">
                    <a-input :key="n" style="width: 200px; margin-bottom: 10px;" :addonBefore="upperFirst(n)"
                             v-model="standard[n]" v-for="n in ['minimum', 'maximum']"/>
                    <a-button @click="standardSave(columnIndex - 2, dcIndex)" type="primary">
                      Save
                    </a-button>
                  </div>
                </template>
                <span>{{ dc.title }}</span>
              </a-popover>
            </div>
            <template slot-scope="text">
              <div style="text-align: center; padding: 16px;" :class="selectColor(text, dc.standard)">{{ text }}</div>
            </template>
          </a-table-column>
        </a-table-column-group>
      </template>
    </a-table>
    <div v-if="pageCount" style="float: right; margin-top: 15px;">
      <a-pagination show-quick-jumper :current="pageNumber" :default-current="1" :total="pageCount"
                    @change="pageChange"/>
    </div>
    <a-modal :width="1024" :visible="visible" @cancel="modalClose">
      <template slot="footer">
        <div/>
      </template>
      <a-descriptions style="margin-top: 30px;" v-if="stationData" bordered>
        <a-descriptions-item label="Project name">
          {{ productName }}
        </a-descriptions-item>
        <a-descriptions-item label="Barcode">
          {{ stationData.productId }}
        </a-descriptions-item>
        <a-descriptions-item label="CreatedAt">
          {{ moment(stationData.createdAt).format('YYYY-MM-DD h:mm:ss a') }}
        </a-descriptions-item>
        <a-descriptions-item label="UpdatedAt">
          {{ moment(stationData.updatedAt).format('YYYY-MM-DD h:mm:ss a') }}
        </a-descriptions-item>
        <a-descriptions-item :key="index" v-for="(station, index) in stationData.stations" :label="station.stationName"
                             :span="3">
          <p class="flex between" :key="data.dataName" v-for="data in station.data">
            <span>{{ data.dataName }}</span>
            <span>{{ data.dataValue }}</span>
          </p>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script>
import moment from "moment";
import {upperFirst, cloneDeep} from 'lodash';
import {setDB} from '@/utils/lowdb';

export default {
  name: "SaveDataTable",
  props: ['loading', 'columns', 'dataSource', 'pageCount', 'pageNumber', 'pageChange', 'rowSelection', 'completes', 'productName', 'project', 'option', 'loadColumns'],
  data: () => ({
    visible: false,
    stationData: null,
    moment,
    upperFirst,
    standard: {
      maximum: 0,
      minimum: 0,
      same: 0
    }
  }),
  methods: {
    handleRow(record, index) {
      return {
        on: {
          click: () => {
            this.stationData = this.completes[index]
            if (this.stationData) {
              this.visible = true
            }
          }
        }
      }
    },
    modalClose() {
      this.visible = false
    },
    initStandard(stationIndex, dataIndex) {
      this.standard = cloneDeep(this.project[this.option].stations[stationIndex].data[dataIndex].standard)
    },
    standardSave(stationIndex, dataIndex) {
      this.project[this.option].stations[stationIndex].data[dataIndex].standard = this.standard
      setDB('project', this.project)
      this.loadColumns()
      this.$message.success('Standard save')
    },
    selectColor(value, standard) {
      if (!value) return ''

      const result = Object.entries(standard).filter(v => v[1] !== '')
      .every(v => {
        let r
        switch (v[0]) {
          case 'minimum':
            r = value >= v[1]
                break
          case 'maximum':
            r = value <= v[1];
            break
          case 'same':
            r = true;
            break
          default:
            r = false
                break
        }

        return r
      })

      if (result) {
        return ''
      } else {
        return 'misData'
      }
    }
  }
}
</script>

<style scoped>
.misData {
  background-color: #f6ccd1;
  color: #e26777;
}
</style>
