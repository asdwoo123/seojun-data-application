<template>
  <a-layout-content style="padding: 28px; background-color: #f0f2f5;">
    <div class="flex" style="margin-bottom: 24px; justify-content: flex-end;">
      <a-button type="primary" style="margin-right: 8px;" @click="importSettingFile">Import Settings</a-button>
      <a-button type="primary" style="margin-right: 8px;" @click="exportSettingFile">Export Settings</a-button>
      <a-button type="primary" style="margin-right: 8px;" @click="opcViewOpen">OPC viewer open</a-button>
      <a-button type="primary" style="margin-right: 8px;" @click="addProject">
        Add project
      </a-button>
      <a-popover trigger="click" placement="bottom">
        <template slot="content">
          <div class="flex">
            <a-input-password v-model="password" style="margin-right: 8px;"/>
            <a-button @click="saveProject">Save</a-button>
          </div>
        </template>
        <a-button type="primary" style="margin-right: 8px;">
          Save project
        </a-button>
      </a-popover>
      <a-button type="primary" style="margin-right: 8px;" @click="resetProject">
        Reset project
      </a-button>
      <a-popover trigger="click" placement="bottom">
        <template slot="content">
          <div class="flex">
            <a-input-password placeholder="Password" v-model="password" style="margin-right: 8px;"/>
            <a-input-password placeholder="Change password" v-model="changePassword" style="margin-right: 8px;"/>
            <a-button @click="handleChangePassword">Change</a-button>
          </div>
        </template>
        <a-button type="primary">
          Change password
        </a-button>
      </a-popover>
    </div>
    <a-row :gutter="16">
      <a-col :sm="12" :xl="8" :xxl="6" v-for="(product, index) in project" :key="index">
        <a-card class="con-box" style="margin-bottom: 16px;" :title="product.productName">
          <div slot="extra">
            <div class="flex">
              <a-button size="small" style="margin-right: 8px; margin-bottom: 8px;" @click="addStation(index)">
                Add station
              </a-button>
              <a-button size="small" @click="removeProject(index)">
                Remove project
              </a-button>
            </div>
            <div class="flex">
              <a-popover trigger="click">
                <template slot="content">
                  <div>
                    <a-input style="width: 120px; margin-right: 10px;" v-model="product.productName"/>
                  </div>
                </template>
                <a-button size="small" style="margin-right: 8px;">Rename</a-button>
              </a-popover>
              <a-dropdown-button size="small">
                {{ index + 1 }}st order
                <a-menu slot="overlay" @click="orderChange(index, $event)">
                  <a-menu-item v-for="(product, i) in project" :key="i">
                    {{ i + 1 }}st order
                  </a-menu-item>
                </a-menu>
              </a-dropdown-button>
            </div>
          </div>
          <Container @drop="stationDrop(index, $event)">
            <Draggable v-for="(station, ii) in product.stations" :key="ii" style="cursor: pointer; margin-bottom: 8px;">
              <div class="flex between draggable">
                <span>{{ station.stationName }}</span>
                <div>
                  <a-button style="margin-right: 8px;" @click="showStationDetail(index, ii)">
                    Detail
                  </a-button>
                  <a-button @click="removeStation(index, ii)">
                    Delete
                  </a-button>
                </div>
              </div>
            </Draggable>
          </Container>
        </a-card>
      </a-col>
    </a-row>

    <a-modal :visible="visible" style="top: 20px;" :width="1024" :closable="false" :maskClosable="false" @ok="saveStation"
             @cancel="modalClose">
      <template v-if="station">
        <div class="flex between">
          <div class="flex between" style="margin-bottom: 8px; width: 450px;">
            <a-tooltip placement="topLeft" :title="tooltips.stationName"><span style="flex: 1;">station name</span></a-tooltip>
            <a-input style="flex: 3;" v-model="station.stationName"/>
            <a-button type="primary" style="margin-left: 20px;" :loading="netLoading" @click="connectTest">Connect test</a-button>
          </div>
          <a-button type="primary" @click="addData(station)">Add data</a-button>
        </div>
        <a-row>
          <a-col :span="10"
                 v-for="[key] in Object.entries(station).filter(v => ['stationName', 'data'].every(k => k !== v[0]))"
                 :key="key">
            <div class="flex" style="margin-bottom: 8px;">
              <a-tooltip placement="topLeft" :title="tooltips[key]"><span style="width: 70px;">
              {{ key }}
            </span></a-tooltip>
              <a-input style="width: 250px;" v-model="station[key]"/>
            </div>
          </a-col>
        </a-row>

        <div>
          <div class="flex" v-for="(v, vi) in station.data" :key="vi" style="margin-bottom: 8px;">
            <a-col :span="10">
            <div class="flex">
              <span style="width: 70px;">Data name</span>
              <a-input style="width: 250px;" v-model="v.dataName"/>
            </div>
            </a-col>
            <a-col :span="14" class="flex">
            <div class="flex">
              <span style="width: 70px;">Node id</span>
              <a-input style="width: 250px;" v-model="v.nodeId"/>
            </div>
            <div class="flex center-v" style="margin-left: 10px; margin-right: 5px;">
              <a-checkbox v-model="v.monitor">
                Monitor
              </a-checkbox>
              <a-checkbox v-model="v.save">
                Save
              </a-checkbox>
            </div>
            <div>
              <a-button type="danger" shape="circle" icon="delete" @click="removeData(station, vi)"/>
            </div>
            </a-col>
          </div>
        </div>
      </template>
    </a-modal>
  </a-layout-content>
</template>

<script>
import {connectOPC, disconnect, testingOPC} from '@/utils/opcua'
import {cloneDeep} from 'lodash'
import {Container, Draggable} from 'vue-smooth-dnd'
import {getDB, setDB} from '@/utils/lowdb'
import { spawn } from 'child_process'
import fs from 'fs'
import { remote } from 'electron'

const { dialog } = remote


export default {
  name: "Editor",
  data: () => ({
    project: [...getDB('project')],
    password: '',
    changePassword: '',
    station: null,
    visible: false,
    visible2: false,
    netLoading: false,
    productIndex: 0,
    stationIndex: 0,
    tooltips: {
      stationName: '스테이션 식별자',
      url: 'PLC 아이피 주소 예)192.168.0.1:4840',
      barcode: '바코드 값 노드',
      pcState: 'PC에서 PLC로 지속적으로 보내는 생존신호 노드',
      scan: '바코드스캐너에 바코드 값이 입력될때 true 값이 되는 노드',
      pass: '이전 공정이 모두 완료 되었을때 PLC에서 펄스신호로 받을 노드',
      notPass: '이전 공정이 완료가 안되었을때 PLC에서 펄스신호로 받을 노드',
      done: '생산이 완료되었을때 PC로 보내는 완료신호 노드',
      result: '제품의 합/불 여부'
    }
  }),
  components: {
    Container, Draggable
  },
  methods: {
    addProject() {
      const newProject = {
        productName: 'Untitled',
        stations: []
      }
      this.project = [...this.project, newProject]
    },
    removeProject(index) {
      this.project.splice(index, 1)
      this.$forceUpdate()
    },
    resetProject() {
      this.project = getDB('project')
    },
    saveStation() {
      this.project[this.productIndex].stations[this.stationIndex] = this.station
      this.visible = false
    },
    removeStation(productIndex, stationIndex) {
      this.project[productIndex].stations.splice(stationIndex, 1)
      this.$forceUpdate()
    },
    modalClose() {
      this.station = cloneDeep(this.project[this.productIndex].stations[this.stationIndex])
      this.visible = false
    },
    orderChange(removedIndex, e) {
      const addedIndex = parseInt(e.key)
      const [removed] = this.project.splice(removedIndex, 1)
      this.project.splice(addedIndex, 0, removed)
      this.$forceUpdate()
    },
    showStationDetail(productIndex, stationIndex) {
      this.productIndex = productIndex
      this.stationIndex = stationIndex
      this.station = cloneDeep(this.project[productIndex].stations[stationIndex])
      this.visible = true
    },
    addData(station) {
      station.data.push({dataName: '', nodeId: '', monitor: true, save: true})
    },
    removeData(station, dataIndex) {
      station.data.splice(dataIndex, 1)
    },
    stationDrop(productIndex, e) {
      const {removedIndex, addedIndex} = e
      const [removed] = this.project[productIndex].stations.splice(removedIndex, 1)
      this.project[productIndex].stations.splice(addedIndex, 0, removed)
      this.$forceUpdate()
    },
    saveProject() {
      if (this.password === getDB('password')) {

        const result = this.project.some(({productName}, index) => {
          return this.project.some((project, projectIndex) => {
            if (index === projectIndex) return false;
            return productName === project.productName
          })
        })

        if (result) {
          this.$message.error('중복되는 프로젝트명이 있습니다');
          return;
        }

        setDB('project', this.project)
        this.password = ''
        setTimeout(() => {
          disconnect(connectOPC)
        }, 100)
      }
    },
    addStation(projectIndex) {
      this.project[projectIndex].stations.push({
        stationName: 'Untitled',
        url: '',
        barcode: [],
        pcState: '',
        scan: '',
        pass: '',
        notPass: '',
        done: '',
        result: '',
        data: []
      })
    },
    handleChangePassword() {
      if (this.password === getDB('password')) {
        if (this.changePassword !== '') {
          setDB('password', this.changePassword)
          this.password = ''
          this.changePassword = ''
        }
      }
    },
    connectTest() {
      this.netLoading = true
      setTimeout(() => {
        this.netLoading = false
      }, 5000)

      testingOPC(this.station.url, (result) => {
        this.netLoading = false

        if (result) {
          this.$message.success('connect')
        } else {
          this.$message.error('not connect')
        }
      })
    },
    opcViewOpen() {
      spawn('opcua-client')
    },

    async importSettingFile() {
      const {filePaths} = await dialog.showOpenDialog(null)
      const data = JSON.parse(fs.readFileSync(filePaths[0]))
      this.project = data.projects
    },
    async exportSettingFile() {
      if (this.project.length === 0) return

      const options = {
        defaultPath: '/settings.json'
      }

      try {
        const {filePath} = await dialog.showSaveDialog(null, options)
        fs.writeFileSync(filePath, JSON.stringify({projects: this.project}), 'utf8')
        this.$message.success('Export successfully');
      } catch {
        this.$message.error('Export failed');
      }
    }
  }
}
</script>

<style scoped>
.draggable {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding: 5px;
  background: #ffffff;
}

</style>
