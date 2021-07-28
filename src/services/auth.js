const users = require('./user')
const crypto = require('./crypto')
const token = require('./token')

const authFailed = email => Promise.reject({
  status: 401,
  code: 'UNAUTHENTICATED',
  message: `Failed to authenticate user ${email}`,
})

const authenticate = async ({ email, password }) => {
  const user = await users.findByEmail(email)
  if (!user) {
    return authFailed(email)
  }
  const isMatch = await crypto.compare(password, user.password)
  if (!isMatch) {
    return authFailed(email)
  }
  return token.sign({ id: user.id, role: user.role })
}

module.exports = {
  authenticate,
}