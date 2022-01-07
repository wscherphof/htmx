'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/register', async function (request, reply) {
    return reply.view('users/register')
  })

  fastify.post('/', async function (request, reply) {
    const { email, password, password2 } = request.body
    if (password !== password2) {
      badRequest("passwords don't match")
    }
    if (!password.length) {
      badRequest("no password")
    }
    try {
      const hash = await fastify.bcrypt.hash('password')
      const users = fastify.mongo.db.collection('users')
      await users.insertOne({ email, password: hash })
    } catch (error) {
      if (error.code === 11000) {
        badRequest('email already taken')
      } else {
        throw error
      }
    }
    try {
      return await fastify.mailer.sendMail({
        to: email,
        subject: 'example',
        text: 'hello world !',
      })
    } catch (error) {
      throw error
    }
    function badRequest(message) {
      throw fastify.httpErrors.badRequest(message)
    }
  })
}
