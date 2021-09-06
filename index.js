const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const pause = require("./pause.js")
const getFilesRecursive = require("./get-files-recursive.js")
const getHash = require("./get-hash.js")

const target = path.resolve(
  process.argv.slice(2).filter(a => !a.startsWith("--"))[0]
)

const files = fs.lstatSync(target).isFile()
  ? [target]
  : getFilesRecursive(target)

const dict = {}
let index = 0
let isBusy = false

setInterval(async () => {
  if (isBusy) return
  isBusy = true

  const file = files[index]
  const newHash = await getHash(file)

  if (!dict[file]) {
    dict[file] = newHash
  } else {
    if (newHash !== dict[file]) {
      console.log(`${file} has changed!`)
    }

    dict[file] = newHash
  }

  index = (index + 1) % files.length
  isBusy = false
}, 0)
