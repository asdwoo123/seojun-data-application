import {getDB} from './lowdb'
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

const {url} = getDB('databaseInfo')

let db = null

export const mongodbConnect = (callback) => {
    MongoClient.connect(url, {
        useUnifiedTopology: true
    }, function (err, client) {
        if (err) {
            console.error(err)
        } else {
            db = client.db('seojunDB3')
            bus.$emit('mongodb', true)
            callback()

            const data = []

            range(1, 1001).forEach(() => {
                ['A/C', 'CSD', 'DSD'].forEach(pn => {
                    range(1, 4).forEach(nn => {
                        saveStation({productName: pn, stationName: `station${nn}`, productId: random(10000, 99999), data})
                    })
                })
            })
        }
    })
}

export const getMongoDB = () => db

export const getCollection = (collectionName) => {
    if (db) {
        return db.collection(collectionName)
    }
}

export const searchStation = async ({ productName, productIndex, stationIndex, productId }) => {
    if (!db) return

    const collection = db.collection(productName)

    try {
        const document = await collection.findOne({
            productId
        })

        if (document) {
            const project = getDB('project')[productIndex]
            const stations = project.stations.filter(s => {
                return project.stations.indexOf(s) < stationIndex
            })
            if (stations.length === 0) return true
            else return stations.map(s => s.stationName).every(sn => document.stations.some(s => s.stationName === sn))
        } else {
            return stationIndex === 0
        }

    } catch (e) {
        console.error(e)
    }
}

export const saveStation = async ({productName, stationName, productId, data}) => {
    if (!db) return
    data = data.filter(v => v.dataName && v.dataValue)

    const collection = db.collection(productName)

    try {
        const document = await collection.findOne({
            productId
        })

        if (document) {
            if (!document['stations']) return

            const stations = document['stations']
            const station = stations.find(s => s.stationName === stationName)
            if (station) {
                station.data = data
            } else {
                stations.push({stationName, data})
            }

            const updatedAt = new Date()

            await collection.updateOne({
                productId
            }, {
                $set: {
                    stations,
                    updatedAt
                }
            })
        } else {
            const result = await collection.find({}).sort({createdAt: -1}).limit(1)

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
                productId,
                stations: [{stationName, data}],
                createdAt,
                updatedAt
            })

        }

        bus.$emit('historyUpdate', productName)
    } catch (e) {
        console.error(e)
    }
}

