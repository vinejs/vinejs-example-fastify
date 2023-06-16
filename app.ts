import fastify from 'fastify'
import { routes } from './src/routes.js'
import { errors } from '@vinejs/vine'
const server = fastify({ logger: true })

server.setErrorHandler(function (error, _, reply) {
  if (error instanceof errors.E_VALIDATION_ERROR) {
    reply.status(error.status).send(error.messages)
  } else {
    reply.send(error)
  }
})

routes(server)
export { server }
