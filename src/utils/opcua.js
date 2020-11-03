import {OPCUAClient, ClientSubscription, ClientMonitoredItem, AttributeIds, DataType} from 'node-opcua'
import store from '@/store'
import {getDB, addDB} from '@/utils/lowdb'
import bus from '../utils/bus'
import {searchStation, saveStation} from '@/utils/mongodb'
import path from 'path'
import {remote} from 'electron'

const {app} = remote

let clients = []
let sessions = []

const options = {
    certificateFile: path.join(app.getAppPath(), 'assets/client_selfsigned_cert_2048.pem'),
    privateKeyFile: path.join(app.getAppPath(), 'assets/private_key.pem'),
    endpoint_must_exist: false
}

export const testingOPC = (url, callback) => {
    const opcUrl = `opc.tcp://${url}`
    const client = OPCUAClient.create(options)
    client.connect(opcUrl).then(() => {
        console.log('connect!')
        client.disconnect().then(() => {
            callback(true)
        })
    }).catch(() => {
        callback(false)
    })
}


export const connectOPC = () => {
    const project = getDB('project')
    store.commit('insertRealTime', [])
    project.forEach((product, productIndex) => {
        const productName = product.productName

        if (!productName || !Array.isArray(product.stations)) return
        product.stations.forEach(async (station, stationIndex) => {

            const checkStationProperty = ['stationName', 'url', 'barcode', 'pcState', 'scan', 'pass', 'notPass', 'done', 'result', 'data']

            if (checkStationProperty.some(p => !station[p])) return
            const stationName = station.stationName
            if (!Array.isArray(station.data)) return
            store.commit('insertRealTime', {
                productName,
                productId: '',
                stationName,
                state: false,
                data: [
                    ...station.data.filter(v => v.dataName && v.nodeId).filter(v => v.monitor).map(
                        v => ({
                            dataName: v.dataName,
                            dataValue: ''
                        })
                    )
                ]
            })

            const url = `opc.tcp://${station.url}`

            const client = OPCUAClient.create(options)

            await client.connect(url)
            clients.push(client)


            const session = await client.createSession(null)

            const res = await session.readVariableValue("ns=iNOK_DMC_forPC")
            console.log(res.value)

            const subscription = await ClientSubscription.create(session, {
                requestedPublishingInterval: 500,
                publishingEnabled: true,
                priority: 10
            })

            let isLive = true
            let currentState = false

            subscription.on('started', () => {
                (function checkConnectOPC() {
                    let state = false

                    const nodesToWrite = [{
                        nodeId: station.pcState,
                        attributedId: AttributeIds.Value,
                        value: {
                            value: {
                                dataType: DataType.Boolean,
                                value: isLive
                            }
                        }
                    }]

                    session.write(nodesToWrite).then(() => {
                        isLive = !isLive
                        state = true
                    })

                    setTimeout(() => {
                        if (state !== currentState) {
                            currentState = state
                            store.commit('insertRealTime', {
                                productName,
                                stationName,
                                state
                            })


                            const logLevel = (state) ? 'success' : 'error'
                            const message = (state) ? 'Connected to equipment' : 'The connection to the equipment has been lost'

                            addDB('log', {
                                logLevel,
                                stationName,
                                ip: station.url || '',
                                message,
                                time: new Date()
                            })

                            bus.$emit('logUpdate', true)
                        }

                        checkConnectOPC()
                    }, 500)
                }())

            })

            opcUASubscribe(subscription, station.scan, async () => {
                const productId = await dmcFormat(session, station.barcode)
                const isPass = searchStation({
                    productName,
                    productIndex,
                    stationIndex,
                    productId
                })

                console.log(productId)

                let nodeId = 'notPass'

                if (isPass) {
                    nodeId = 'pass'
                }

                const nodesToWrite = [{
                    nodeId: station[nodeId],
                    attributedId: AttributeIds.Value,
                    value: {
                        value: {
                            dataType: DataType.Boolean,
                            value: true
                        }
                    }
                }]

                session.write(nodesToWrite).then(() => {
                    setTimeout(() => {
                        nodesToWrite[0].value.value.value = false
                        session.write(nodesToWrite)
                    }, 500)
                })
            })

            opcUASubscribe(subscription, station.done, async () => {
                const productId = await dmcFormat(session, station.dmc)
                const result = (await session.readVariableValue(station.result)).value.value
                if (!productId || !result) return

                const stationData = await Promise.all(
                    station.data.map(async node => {
                        const {nodeId, dataName} = node
                        if (!(nodeId && dataName)) return

                        const dataValue = (await session.readVariableValue(nodeId)).value.value
                        return {dataName, dataValue: (Array.isArray(dataValue)) ? dataValue[1] : dataValue}
                    })
                )

                const [monitorFilter, saveFilter] = ['monitor', 'save'].map(n => station.data.filter(v => v[n]).map(v => v.dataName))

                store.commit('insertRealTime', {
                    productName,
                    stationName,
                    productId,
                    state: true,
                    data: [
                        ...stationData.filter(d => monitorFilter.some(n => d.dataName === n))
                    ]
                })

                await saveStation({
                    productName,
                    stationName,
                    productId,
                    data: [
                        ...stationData.filter(d => saveFilter.some(n => d.dataName === n))
                    ]
                })

                bus.$emit('historyUpdate', true)
            })

        })
    })
}

export const disconnect = async (callback) => {
    await Promise.all(sessions.map(session => session.close()))
    await Promise.all(clients.map(client => client.disconnect()))

    sessions = []
    clients = []
    callback()
}

async function dmcFormat(session, dmc) {
    if (Array.isArray(dmc) && dmc.length > 0) {
        const productPro = Promise.all(
            dmc.map(async (barcode) => {
                return (await session.readVariableValue(barcode)).value.value
            })
        )
        return (await productPro).join('')
    } else {
        console.log((await session.readVariableValue(dmc)).value)
        return (await session.readVariableValue(dmc)).value.value
    }
}

function opcUASubscribe(subscription, nodeId, callback) {
    const itemToMonitor = {
        nodeId: `${nodeId}`,
        attribute: AttributeIds.Value
    }

    const parameters = {
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 500
    }

    const monitoredItem = ClientMonitoredItem.create(
        subscription,
        itemToMonitor,
        parameters
    )

    monitoredItem.on('changed', async (dataValue) => {
        if (store.state.stationData.every(v => v.state)) {
            const data = dataValue.value.value
            if (data) callback(data)
        }
    })
}
