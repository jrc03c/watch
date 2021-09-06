const fs = require("fs")
const crypto = require("crypto")

function getHash(target) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(target, "utf8", (error, raw) => {
        if (error) {
          reject(error)
        } else {
          resolve(crypto.createHmac("sha256", raw).digest("hex"))
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = getHash
