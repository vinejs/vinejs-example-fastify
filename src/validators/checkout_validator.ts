import vine from '@vinejs/vine'

export const checkoutValidator = vine.compile(
  vine
    .object({
      name: vine.string(),
      email: vine.string().email(),
      location: vine.object({
        type: vine.enum(['home', 'office', 'other']),
        address: vine.string(),
        pincode: vine.string().postalCode({ countryCode: ['US'] }),
        phone: vine.string().mobile({ locale: ['en-US'] }),
      }),
      payment: vine.object({
        card_number: vine.string().creditCard(),
      }),
    })
    .toCamelCase()
)
