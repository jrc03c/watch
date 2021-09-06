const fs = require("fs")
const crypto = require("crypto")

function getHashOfFile(target) {
  return new Promise((resolve, reject) => {
    try {
      const raw = fs.readFileSync(target, "utf8")
      resolve(crypto.createHmac("sha256", raw).digest("hex"))
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = getHashOfFile
