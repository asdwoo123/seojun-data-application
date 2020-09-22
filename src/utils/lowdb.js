import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { range, clone } from 'lodash'

const adapter = new LocalStorage('db')
const db = low(adapter)

const databaseInfo = {
  url: 'mongodb://localhost:27017',
  dbName: 'seojunDB2'
}

const password = '123'

const project = []

const theme = {}

const log = []

db.defaults({
  databaseInfo,
  password,
  project,
  theme,
  log
}).write()
/*db.set('project', ['A/C', 'CSD', 'DSD'].map((s, ii) => ({
  productName: s,
  stations: range(1, 4).map(i => ({
    stationName: 'station' + i,
    url: `192.168.1.${ii}${i}:4840`,
    done: "ns=3;s=\"As\".\"DATA\".\"Done\"",
    result: "ns=3;s=\"As\".\"DATA\".\"Result\"",
    pcState: "ns=3;s=\"As\".\"DATA\".\"State_PC\"",
    scan: "ns=3;s=\"As\".\"DATA\".\"oDMC_toPC\"",
    dmc: [
      "ns=3;s=\"As\".\"DATA\".\"DMC\""
    ],
    data: range(1, 2).map(d => ({
      nodeId: `ns=1;s=light${d}`,
      dataName: 'signal' + d,
      monitor: true,
      save: true,
      standard: {
        maximum: 0,
        minimum: 3,
        same: 1
      }
    }))
  }))
}))).write()*/

export const setDB = (name, value) => {
  db.set(name, value).write()
}

export const getDB = name => clone(db.get(name).value())

export const addDB = (name, value) => {
  db.get(name).unshift(value).write()
}
