'use strict'
const net = require('net')

// 直接内置解析函数，不依赖任何 service
function autoParse(data) {
  const str = data.toString().trim()
  if (str.startsWith('$GNRMC')) return parseNMEA(str)
  if (str.startsWith('A,')) return parseCustom(str)
  return null
}

function parseNMEA(str) {
  const arr = str.split(',')
  if (arr.length < 10 || arr[2] !== 'A') return null
  const latD = parseInt(arr[3].substring(0, 2))
  const latM = parseFloat(arr[3].substring(2))
  const lat = Number((latD + latM / 60).toFixed(6))

  const lngD = parseInt(arr[5].substring(0, 3))
  const lngM = parseFloat(arr[5].substring(3))
  const lng = Number((lngD + lngM / 60).toFixed(6))
  return { lat, lng, status: '有效' }
}

function parseCustom(str) {
  const arr = str.split(',')
  if (arr.length !== 5) return null
  return {
    status: arr[0] === 'A' ? '有效' : '无效',
    lng: parseFloat(arr[2]),
    lat: parseFloat(arr[4])
  }
}

module.exports = app => {
  app.tcpClients = new Map()

  const server = net.createServer(socket => {
    const clientKey = `${socket.remoteAddress}:${socket.remotePort}`
    app.tcpClients.set(clientKey, socket)
    app.logger.info('[TCP] 设备上线：' + clientKey)

    socket.on('data', data => {
      try {
        // ✅ 这里直接用内置解析，再也不依赖 service
    
        app.logger.info('[TCP] from [' + clientKey + '] 收到设备数据：' + data)
        const gpsInfo = autoParse(data)

        if (!gpsInfo) return

        app.logger.info('[GPS] ' + gpsInfo.lat + ' , ' + gpsInfo.lng)

        if (app.io && app.io.of('/')) {
          app.io.of('/').emit('gps', {
            clientKey,
            lat: gpsInfo.lat,
            lng: gpsInfo.lng,
            status: gpsInfo.status,
            time: new Date().toLocaleString()
          })
        }
      } catch (err) {
        app.logger.error('[GPS 解析错误]', err)
      }
    })

    socket.on('end', () => {
      app.tcpClients.delete(clientKey)
      app.logger.info('[TCP] 设备离线：' + clientKey)
    })

    socket.on('error', () => {
      app.tcpClients.delete(clientKey)
    })
  })

  server.listen(60000, '0.0.0.0')
  server.on('listening', () => {
    app.logger.info('==================================================')
    app.logger.info('✅ TCP 服务启动成功  端口：60000')
    app.logger.info('==================================================')
  })
}