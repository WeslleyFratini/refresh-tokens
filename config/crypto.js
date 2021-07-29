module.exports = {
  hashSaltRounds: 10,
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY,
  },
  refreshToken: {
    duration: 1000 * 60 * 60 * 24 * 6,
  },
}
