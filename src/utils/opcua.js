import { OPCUAClient, ClientSubscription, ClientMonitoredItem, AttributeIds, DataType } from 'node-opcua'
import store from '@/store'
import { getDB, addDB } from '@/utils/lowdb'
import bus from '../utils/bus'
import { saveStation } from '@/utils/mongodb'
import path from 'path'
import { remote } from 'electron'

const { app } = remote

const project = getDB('project')

let clients = []

export const connectOPC = () => {
  store.commit('insertRealTime', [])
  project.forEach((product, productIndex) => {
    const productName = product.productName

    if (!productName || !Array.isArray(product.stations)) return

    product.stations.forEach(async (station, stationIndex) => {
      const stationName = station.stationName

      if (!station.url || !stationName || !Array.isArray(station.data)) return
      store.commit('insertRealTime', {
        productName,
        productId: '',
        stationName,
        state: false,
        data: [
          ...station.data.filter(v => v.dataName && v.nodeId).map(
            v => ({
              dataName: v.dataName,
              dataValue: ''
            })
          )
        ]
      })

      const url = `opc.tcp://${station.url}`
      const options = {
        certificateFile: path.join(app.getAppPath(), 'assets/client_selfsigned_cert_2048.pem'),
        privateKeyFile: path.join(app.getAppPath(), 'assets/private_key.pem'),
        endpoint_must_exist: false
      }

      const client = OPCUAClient.create(options)
      await client.connect(url)
      clients.push(client)

      const session = await client.createSession(null)

      const subscription = await ClientSubscription.create(session, {
        requestedPublishingInterval: 500,
        publishingEnabled: true,
        priority: 10
      })

      let isLive = true
      let state = false
      let currentState = false
      subscription.on('started', () => {
        setInterval(async () => {
          state = false

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

              bus.$emit('logUpdate', true)


              const logLevel = (state) ? 'success' : 'error'
              const message = (state) ? 'Connected to equipment' : 'The connection to the equipment has been lost'

              addDB('log', {
                logLevel,
                stationName,
                ip: station.url || '',
                message,
                time: new Date()
              })
            }
          }, 500)

        }, 1500)
      })

      opcUASubscribe(subscription, station.done, async () => {
        const productId = await dmcFormat(session, station.dmc)
        const result = (await session.readVariableValue(station.result)).value.value
        if ((!productId && result)) return

        const stationData = await Promise.all(
          station.data.map(async node => {
            const { nodeId, dataName } = node
            if (!(nodeId && dataName)) return

            const dataValue = (await session.readVariableValue(nodeId)).value.value
            return { dataName, dataValue: (Array.isArray(dataValue)) ? dataValue[1] : dataValue }
          })
        )

        saveStation({
          productName,
          stationName,
          productId,
          data: [
            ...stationData
          ]
        })
      })

    })
  })
}

export const disconnect = (callback) => {
  clients.forEach(async client => {
    await client.disconnect()
    clients = []
    callback()
  })
}

async function dmcFormat(session, dmc) {
  if (Array.isArray(dmc) && dmc.length > 0) {
    const productPro = Promise.all(
      dmc.map(async (barcode) => {
        return (await session.readVariableValue(barcode)).value.value
      })
    )

    return (await productPro).join('')
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
    if (store().state.stationData.every(v => v.state)) {
      const data = dataValue.value.value
      if (data) callback(data)
    }
  })
}
