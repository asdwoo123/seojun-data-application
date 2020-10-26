<template>
  <a-layout-content style="padding: 24px; background-color: #f0f2f5;">
    <div class="flex" style="margin-bottom: 16px; justify-content: flex-end;">
      <a-button type="primary" style="margin-right: 16px;" @click="addProject">
        Add project
      </a-button>
      <a-popover trigger="click" placement="bottom">
        <template slot="content">
          <div class="flex">
            <a-input-password v-model="password" style="margin-right: 8px;"/>
            <a-button @click="saveProject">Save</a-button>
          </div>
        </template>
        <a-button type="primary" style="margin-right: 16px;">
          Save
        </a-button>
      </a-popover>
      <a-button type="primary" style="margin-right: 16px;" @click="resetProject">
        Reset
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

    <a-modal :visible="visible" style="top: 20px;" :width="1024" :closable="false" @ok="saveStation"
             @cancel="modalClose">
      <template v-if="station">
        <div class="flex between">
          <div class="flex">
            <span style="width: 100px;">station name</span>
            <a-input v-model="station.stationName"/>
          </div>
          <a-button type="primary" @click="addData(station)">Add data</a-button>
        </div>
        <a-row>
          <a-col :span="10"
                 v-for="[key] in Object.entries(station).filter(v => ['stationName', 'data'].every(k => k !== v[0]))"
                 :key="key">
            <div class="flex" style="margin-bottom: 8px;">
              <span style="width: 70px;">
              {{ key }}
            </span>
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
import {connectOPC, disconnect} from '@/utils/opcua'
import {cloneDeep} from 'lodash'
import {Container, Draggable} from 'vue-smooth-dnd'
import {getDB, setDB} from '@/utils/lowdb'


export default {
  name: "Editor",
  data: () => ({
    project: [...getDB('project')],
    password: '',
    changePassword: '',
    station: null,
    visible: false,
    productIndex: 0,
    stationIndex: 0
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
      console.log(Array.isArray(getDB('project')))
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
        barcode: [],
        scan: '',
        done: '',
        result: '',
        pcState: '',
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
