import { test } from '@japa/runner'
import { server } from '../../app.js'

function getBaseUrl() {
  const address = server.addresses().find((address) => address.family === 'IPv4')
  if (!address) {
    throw new Error('Cannot find server address')
  }

  return `http://${address.address}:${address.port}`
}

test.group('Checkout | Validate personal details', () => {
  test('fail when personal details are missing', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({})

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'name',
        message: 'The name field must be defined',
        rule: 'required',
      },
      {
        field: 'email',
        message: 'The email field must be defined',
        rule: 'required',
      },
    ])
  })

  test('fail when email is invalid', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({
      name: 'Mr. Foo',
      email: 'foo',
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'email',
        message: 'The email field must be a valid email address',
        rule: 'email',
      },
    ])
  })
})

test.group('Checkout | Validate address', () => {
  test('fail when delivery location is missing', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({
      name: 'Mr. Foo',
      email: 'foo@bar.com',
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'location',
        message: 'The location field must be defined',
        rule: 'required',
      },
    ])
  })

  test('fail when location type is invalid', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({
      name: 'Mr. Foo',
      email: 'foo@bar.com',
      location: {
        type: 'building',
      },
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'location.type',
        message: 'The selected type is invalid',
        rule: 'enum',
        meta: {
          choices: ['home', 'office', 'other'],
        },
      },
    ])
  })

  test('fail when location pincode is invalid', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({
      name: 'Mr. Foo',
      email: 'foo@bar.com',
      location: {
        type: 'home',
        address: '418, 11th Street, East coast',
        pincode: 'foobar',
      },
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'location.pincode',
        message: 'The pincode field must be a valid postal code',
        rule: 'postalCode',
        meta: {
          countryCodes: ['US'],
        },
      },
    ])
  })
})

test.group('Checkout | Validate payment', () => {
  test('fail when payment information is missing', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({
      name: 'Mr. Foo',
      email: 'foo@bar.com',
      location: {
        type: 'home',
        address: '418, 11th Street, East coast',
        pincode: '51411',
        phone: '8903345656',
      },
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'payment',
        message: 'The payment field must be defined',
        rule: 'required',
      },
    ])
  })

  test('fail when credit card number is invalid', async ({ client }) => {
    const response = await client.post(`${getBaseUrl()}/checkout_as_guest`).json({
      name: 'Mr. Foo',
      email: 'foo@bar.com',
      location: {
        type: 'home',
        address: '418, 11th Street, East coast',
        pincode: '51411',
        phone: '8903345656',
      },
      payment: {
        card_number: '1291939292',
      },
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        field: 'payment.card_number',
        message: 'The card_number field must be a valid credit card number',
        rule: 'creditCard',
      },
    ])
  })
})
