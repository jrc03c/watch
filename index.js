const fs = require("fs")
const path = require("path")
const getFilesRecursive = require("./get-files-recursive.js")
const getHash = require("./get-hash.js")

function watch(target, callback) {
  target = path.resolve(target)

  let files = fs.lstatSync(target).isFile()
    ? [target]
    : getFilesRecursive(target)

  const dict = {}
  let index = 0
  let isBusy = false
  let first = true

  const interval = setInterval(async () => {
    if (isBusy) return
    isBusy = true

    const file = files[index]
    let newHash

    try {
      newHash = await getHash(file)

      if (!dict[file]) {
        dict[file] = newHash
        if (!first) callback({ type: "creation", file })
      } else {
        if (newHash !== dict[file]) callback({ type: "modification", file })
        dict[file] = newHash
      }
    } catch (e) {
      callback({ type: "deletion", file })
    }

    index++

    if (index >= files.length) {
      first = false
      index = 0

      const newFiles = fs.lstatSync(target).isFile()
        ? [target]
        : getFilesRecursive(target)

      if (newFiles.length < files.length) {
        const deletedFiles = files.filter(f => newFiles.indexOf(f) < 0)

        deletedFiles.forEach(deletedFile => {
          callback({ type: "deletion", file: deletedFile })
        })
      }

      files = newFiles
    }

    isBusy = false
  }, 0)

  return {
    get files() {
      return files
    },

    stop() {
      clearInterval(interval)
    },
  }
}

module.exports = watch
