const isKeyInvalid = key => {
  if (!key || key.length !== 64) {
    return true
  }
  try {
    const buf = Buffer.from(key, 'hex')
    return (buf.byteLength !== 32)
  } catch (e) {
    return true
  }
}

export default isKeyInvalid
