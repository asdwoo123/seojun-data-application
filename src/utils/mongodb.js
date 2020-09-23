import { getDB } from './lowdb'
import bus from '../utils/bus'
import { range, random } from 'lodash'

const Mongod = require('mongod')
const MongoClient = require('mongodb').MongoClient

const server = new Mongod(27017)
server.open((err) => {
  if (err) {
    console.log(err)
  }
})

const { url, dbName } = getDB('databaseInfo')

let db = null

export const mongodbConnect = () => {
  MongoClient.connect(url, {
    useUnifiedTopology: true
  }, function (err, client) {
    if (err) {
      console.error(err)
    } else {
      db = client.db('seojunDB')
      bus.$emit('mongodb', true)

      /*const p = ['A/C', 'CSD', 'DSD']
      const data = range(3).map(nnn => ({
        dataName: `data${nnn + 1}`,
        dataValue: nnn + 1
      }))

      range(1000).forEach((n) => {
        const productId = uid()
        const productName = p[random(0, 2)]
        range(3).forEach(nn => {
          const stationName = `station${nn}`

          saveStation({
            productName,
            stationName,
            productId,
            data
          })
        })
      })*/

    }
  })
}

export const getMongoDB = () => db

export const getCollection = (collectionName) => {
 if (db) {
  return db.collection(collectionName)
 }
}

export const saveStation = async ({ productName, stationName, productId, data }) => {

    if (!data?.every(v => v.dataName && v.dataValue)) return

    const collection = db.collection(productName)

    try {
      const document = await collection.findOne({
        stationName,
        productId
      })

      const updatedAt = new Date()

      if (document) {
        await collection.updateOne({
          stationName,
          productId
        }, {
          $set: {
            data,
            updatedAt
          }
        })
      } else {
        const result = await collection.find({}).sort({ createdAt: -1 }).limit(1)

        let id = 1
        const createdAt = new Date()
        const updatedAt = createdAt

        if (result?.length > 0) {
          id = result[0]?.id + 1
        } else {
          id = 1
        }
        await collection?.insertOne({
          id,
          stationName,
          productId,
          data,
          createdAt,
          updatedAt
        })

      }

      bus.$emit('historyUpdate', productName)
    } catch (e) {
      console.error(e)
    }
}

