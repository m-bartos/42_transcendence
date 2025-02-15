// import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from "fastify";
// import fastifyWebsocket from '@fastify/websocket'
// import fp from 'fastify-plugin'

// const ws_plugin: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
//     // Register the websocket plugin
//     fastify.decorate('ws_connections', new Set<any>())

//     // Register the websocket plugin
//     await fastify.register(fastifyWebsocket)

//     // Start periodic message sender - is this as it should be in fastify??? or is it just typescript?
//     fastify.decorate('broadcastInterval', setInterval(() => {
//         fastify.ws_connections.forEach(client => {
//             // Check if connection is still open before sending
//             if (client.readyState === client.OPEN) {
//                 client.send('Hello')
//             }
//         })
//     }, 1000)) // Send every 1000ms (1 second)

//     // Clean up on plugin close
//     fastify.addHook('onClose', (instance, done) => {
//         clearInterval(fastify.broadcastInterval)
//         fastify.ws_connections.clear()
//         done()
//     })

//     fastify.get('/ws', {
//         websocket: true
//     }, function wsHandler(connection, request: FastifyRequest) {
//         fastify.ws_connections.add(connection)

//         // Handle incoming messages
//         connection.on('message', msg => {
//             const message = msg.toString()
//             fastify.ws_connections.forEach(client => {
//                 client.send('Server received: ' + message)
//             })
//         })

//         // Handle client disconnect
//         connection.on('close', () => {
//             console.log('Client disconnected')
//         })
//     })
// }

// export default fp(ws_plugin)