import {getDB} from './lowdb'
import bus from '../utils/bus'
import {range, random} from 'lodash'

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
            db = client.db('seojunDB4')
            bus.$emit('mongodb', true)
            callback()

            /*range(1, 1000).forEach(() => {
                ['A/C', 'CSD', 'DSD'].forEach(pn => {
                    const productId = random(10000, 99999).toString();
                    saveStation({productName: pn, stationName: `station1`, productId, data: getData()}, () => {
                        saveStation({productName: pn, stationName: `station2`, productId, data: getData()}, () => {
                            saveStation({productName: pn, stationName: `station3`, productId, data: getData()})
                        })
                    })
                })
            })*/

            /*setInterval(() => {
                const productId = random(10000, 99999).toString();
                saveStation({productName: 'A/C', stationName: `station1`, productId, data: getData()}, () => {
                    setTimeout(() => {
                        saveStation({productName: 'A/C', stationName: `station2`, productId, data: getData()}, () => {
                            setTimeout(() => {
                                saveStation({productName: 'A/C', stationName: `station3`, productId, data: getData()})
                            }, 3000)
                        }, 3000)
                    })
                })
            }, 9000)*/

        }
    })
}

function getData() {
    return range(1, 10).map(n => ({ dataName: `signal${n}`, dataValue: random(1, 100) }))
}

export const getMongoDB = () => db

export const getCollection = (collectionName) => {
    if (db) {
        return db.collection(collectionName)
    }
}

export const searchStation = async ({productName, productIndex, stationIndex, productId}) => {
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

export const saveStation = ({productName, stationName, productId, data}, callback) => {

    if (!db) return
    const collection = db.collection(productName)

    collection.findOne({
        productId
    }, {}, (err, document) => {
        if (err) return;
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


            collection?.updateOne({
                productId
            }, {
                $set: {
                    stations: stations,
                    updatedAt
                }
            }, null, err => {
                if (!err) bus.$emit('historyUpdate', productName)
                if (callback) callback()
            })


        } else {
            collection.find({}).sort({createdAt: -1}).limit(1).toArray((err, result) => {
                if (err) return;
                let id;
                const createdAt = new Date()
                const updatedAt = createdAt

                if (result?.length > 0) {
                    id = result[0]?.id + 1
                } else {
                    id = 1
                }

                collection?.insertOne({
                    id,
                    productId,
                    stations: [{stationName, data}],
                    createdAt,
                    updatedAt
                }, {}, () => {
                    bus.$emit('historyUpdate', productName)
                    if (callback) callback()
                })
            })
        }
    })




}

