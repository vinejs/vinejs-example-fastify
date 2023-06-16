import type { FastifyInstance } from 'fastify'
import { checkoutValidator } from './validators/checkout_validator.js'

export function routes(server: FastifyInstance) {
  server.post('/checkout_as_guest', async (request) => {
    const payload = await checkoutValidator.validate(request.body)
    return {
      validated: payload,
      original: request.body,
    }
  })
}
