const users = require('./user')
const crypto = require('./crypto')
const tokenService = require('./token')

const authFailed = (email) =>
  Promise.reject({
    status: 401,
    code: 'UNAUTHENTICATED',
    message: email
      ? `Failed to authenticate user ${email}`
      : 'Failed to authenticate user',
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

  const { token: refreshToken, expiresAt: refreshTokenExpiration } =
    await tokenService.createRefreshToken(user.id)

  return {
    refreshToken,
    refreshTokenExpiration,
    accessToken: tokenService.sign({ id: user.id, role: user.role }),
  }
}

const isRefreshTokenValid = (refreshToken) =>
  refreshToken && refreshToken.valid && refreshToken.expiresAt >= Date.now()

const refreshToken = async (tokenValue) => {
  const refreshTokenObject = await tokenService.getRefreshToken(tokenValue)

  if (isRefreshTokenValid(refreshTokenObject)) {
    await tokenService.invalidateRefreshToken(tokenValue)

    const user = await users.findById(refreshTokenObject.user_id)

    const { token: refreshToken, expiresAt: refreshTokenExpiration } =
      await tokenService.createRefreshToken(user.id)

    return {
      refreshToken,
      refreshTokenExpiration,
      accessToken: tokenService.sign({ id: user.id, role: user.role }),
    }
  }
  return authFailed()
}

const logout = ({ refreshTokenValue, allDevices }) => {
  if (allDevices) {
    return tokenService.invalidateAllUserRefreshTokens(refreshTokenValue)
  }
  return tokenService.invalidateRefreshToken(refreshTokenValue)
}

module.exports = {
  authenticate,
  refreshToken,
  logout,
}
