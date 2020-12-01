<template>
  <a-layout style="min-height: 100%;">
    <a-layout-header>
      <div style="float: left; width: 240px;"><img width="100" src="../assets/seojuneng-logo.png" alt="logo"></div>
      <a-menu @click="onModeChange" style="display: inline-block; line-height: 64px;" v-model="current" mode="horizontal">
        <template v-for="rn in routeNames">
        <a-menu-item :key="rn">
          {{ rn }}
        </a-menu-item>
        </template>
      </a-menu>

    </a-layout-header>
      <router-view />
  </a-layout>
</template>

<script>
import router from "@/router";
import routes from '@/router/routes';
import { ipcRenderer } from 'electron';
import moment from "moment";
import path from "path";
import fs from "fs";
import stringify from 'csv-stringify';
import {getCollection} from "@/utils/mongodb";
import {getDB} from "@/utils/lowdb";

const routeNames = routes.map(r => r.name)

const project = getDB('project')
const productNames = project.map(p => p.productName)

export default {
  name: "MainLayout",
  router,
  data: () => ({
    current: [routeNames[0]],
    routeNames,
    num: '0'
  }),
  mounted() {
    if (this.$route.name) {
      this.current = [this.$route.name]
    } else {
      this.$router.push('/monitor')
    }

    ipcRenderer.on('route', (event, message) => {
      if (this.$route.name !== message) {
        this.$router.push(`/${message.toLowerCase()}`)
        setTimeout(() => this.current = [this.$route.name], 500)
      }
    })

    const {autoSave, folderPath} = getDB('settings')

    if (autoSave) {
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')

      productNames.forEach(productName => {
        const folPath = path.join(folderPath, productName)
        if (!fs.existsSync(folPath)) {
          fs.mkdirSync(folPath)
        }

        const collection = getCollection(productName)
        const pn = productName.replace(/\//gi, '')

        fs.readdir(folPath, (err, fileList) => {
          if (err) return;
          const res = fileList.some(file => file === yesterday)
          if (!res) {
            const query = {
              createdAt: {
                '$gte': moment(yesterday),
                '$lt': moment(yesterday)
              }
            }
            let saveData = [];
            let columns = {};

            collection.find(query).sort({createdAt: -1}).toArray((err, completes) => {
              if (err) return
              if (completes.length === 0) return
              saveData = completes.map((complete) => {
                const barcode = complete.productId;
                const createdAt = moment(complete.createdAt).format('YYYY-MM-DD h:mm:ss a');
                const updatedAt = moment(complete.updatedAt).format('YYYY-MM-DD h:mm:ss a');
                const com = (complete['station'] || complete['stations']).map((station) => station.data.reduce((acc, one) =>
                {
                  if (typeof one.dataValue === 'boolean') {
                    one.dataValue = (one.dataValue) ? 'True' : 'False'
                  }

                  return {...acc, [one.dataName + '-' + (station.stationName)]: one.dataValue}
                }, {}));
                const data = com.reduce((acc, one) => ({...acc, ...one}), {});
                return {
                  barcode,
                  createdAt,
                  updatedAt,
                  ...data
                }
              })

              const keys = Object.keys(saveData[0]);
              keys.forEach(k => {
                columns = {
                  ...columns,
                  [k]: k
                };
              });

              const values = saveData.map(v => Object.values(v))
              stringify(values, {header: true, columns}, (err, output) => {
                if (!err) {
                  fs.writeFile(filePath, output, (err) => {
                    if (err) {this.$message.success('Saved successfully');
                      this.$message.error('Save failed');
                    } else {

                    }
                  });
                }
              });
            })
          }
        })
      })

      /*fs.readdir(folderPath,(err, filelist) => {
        if (err) return;
        const res = filelist.some(file => file === yesterday)
        if (!res) {

        }
      })*/
    }
  },
  methods: {
    onModeChange({ key }) {
      if (this.$route.path === `/${key.toLowerCase()}`) return
      this.$router.push(`/${key.toLowerCase()}`)
    }
  }
}
</script>

<style scoped>

</style>
