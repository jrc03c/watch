const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

function getHash(target) {
  const raw = fs.readFileSync(target, "utf8")
  return crypto.createHmac("sha256", raw).digest("hex")
}

const target = path.resolve(
  process.argv.slice(2).filter(a => !a.startsWith("--"))[0]
)

const isFile = fs.lstatSync(target).isFile()

if (isFile) {
  let lastHash = getHash(target)

  setInterval(() => {
    const newHash = getHash(target)

    if (newHash !== lastHash) {
      console.log(`"${target}" has changed!`)
    } else {
      console.log(`No changes in "${target}"...`)
    }

    lastHash = newHash
  }, 1000)
} else {
}
