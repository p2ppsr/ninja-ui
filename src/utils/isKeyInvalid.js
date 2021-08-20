import bsv from 'bsv'

const isKeyInvalid = key => {
  if (!key || key.length < 10) {
    return true
  }
  try {
    bsv.HDPrivateKey.fromString(key)
    return false
  } catch (e) {
    return true
  }
}

export default isKeyInvalid
