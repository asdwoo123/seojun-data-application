import {getDB} from './lowdb'
import bus from '../utils/bus'
import {range, random} from 'lodash'
import {v4 as uuidv4} from 'uuid'

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

           /* const collection = db.collection('A/C')

            const productData = range(1, 1000001).map(n => (
                {
                    id: n,
                    productId: uuidv4(),
                    stations: [
                        {
                            stationName: 'station1',
                            data: [
                                ...range(1, 7).map(nn => ({
                                    dataName: 'iLVDT' + nn,
                                    dataValue: random(1, 100)
                                })),
                                ...range(1, 7).map(nn => ({
                                    dataName: 'iLoadcell' + nn,
                                    dataValue: random(1, 100)
                                })),
                            ]
                        },{
                            stationName: 'station2',
                            data: [
                                ...range(1, 6).map(nn => ({
                                    dataName: 'rAngle-' + nn,
                                    dataValue: random(1, 100)
                                })),
                                ...range(1, 6).map(nn => ({
                                    dataName: 'rTorque-' + nn,
                                    dataValue: random(1, 100)
                                })),
                            ]
                        }
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ))

            collection?.insertMany(productData)*/

            const project = getDB('project')[0]

            setInterval(() => {
                const productId = random(10000, 99999).toString();
                project.stations.forEach((s, si) => {
                    const { stationName, data } = s;
                    const dataV = data.map(d => ({ dataName: d.dataName, dataValue: random(1, 100) }))
                    saveStation({ productName: project.productName, stationName, productId, data: dataV })
                })
            }, 1000)

        }
    })
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
                if (!err) {
                    bus.$emit('historyUpdate', productName)
                    bus.$emit('MonitorUpdate', productName, stationName)
                }
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
                    bus.$emit('MonitorUpdate', {productName, stationName})
                    if (callback) callback()
                })
            })
        }
    })


}

