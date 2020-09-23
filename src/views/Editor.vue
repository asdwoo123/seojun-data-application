<template>
  <a-layout-content style="padding: 24px; background-color: #f0f2f5;">
    <div class="flex" style="margin-bottom: 16px; justify-content: flex-end;">
      <a-button type="primary" style="margin-right: 16px;" @click="addProject">
        Add project
      </a-button>
      <a-button type="primary" style="margin-right: 16px;">
        Save
      </a-button>
      <a-button type="primary" style="margin-right: 16px;">
        Reset
      </a-button>
      <a-button type="primary">
        Change password
      </a-button>
    </div>
    <a-row :gutter="16">
      <a-col :sm="12" :xl="8" :xxl="6" v-for="(product, index) in project" :key="index">
        <a-card class="con-box" style="margin-bottom: 16px;" :title="product.productName">
          <div slot="extra">
            <div class="flex">
              <a-button size="small" style="margin-right: 8px; margin-bottom: 8px;">
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
                    <a-input style="width: 120px; margin-right: 10px;" v-model="product.productName" />
                  </div>
                </template>
              <a-button size="small" style="margin-right: 8px;">Rename</a-button>
              </a-popover>
              <a-dropdown-button size="small">
                {{ index + 1 }}st order
                <a-menu slot="overlay">
                    <a-menu-item v-for="(product, i) in project" :key="i">
                      {{ i + 1 }}st order
                    </a-menu-item>
                </a-menu>
              </a-dropdown-button>
            </div>
          </div>
          <Container>
            <Draggable v-for="(station, ii) in product.stations" :key="ii" style="cursor: pointer; margin-bottom: 8px;">
              <div class="flex between draggable">
                <span>{{ station.stationName }}</span>
                <div>
                  <a-button style="margin-right: 8px;">
                    Detail
                  </a-button>
                  <a-button>
                    Delete
                  </a-button>
                </div>
              </div>
            </Draggable>
          </Container>
        </a-card>
      </a-col>
    </a-row>
  </a-layout-content>
</template>

<script>
import {connectOPC, disconnect} from '@/utils/opcua'
import {clone} from 'lodash'
import {Container, Draggable} from 'vue-smooth-dnd'
import {getDB} from '@/utils/lowdb'


export default {
  name: "Editor",
  data: () => ({
    project: getDB('project'),
    password: '',
    changePassword: '',
    station: {}
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
    saveStation(pi, si) {

    },
    orderChange() {

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
