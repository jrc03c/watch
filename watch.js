const fs = require("fs")
const path = require("path")
const { getFilesDeepSync } = require("@jrc03c/fs-extras")
const getHashOfFile = require("./get-hash-of-file.js")
const applyInclusionsAndExclusions = require("./apply-inclusions-and-exclusions.js")

function watch(config) {
  if (typeof config.target !== "string") {
    throw new Error("You must provide a `target` file or directory to watch!")
  }

  const doNothing = () => {}
  const target = path.resolve(config.target)
  const created = config.created || doNothing
  const modified = config.modified || doNothing
  const deleted = config.deleted || doNothing
  const scansPerSecond = config.scanRate || 999999
  let inclusions, exclusions

  if (config.include) {
    if (config.include instanceof RegExp) {
      inclusions = [config.include]
    } else {
      inclusions = config.include
    }
  }

  if (config.exclude) {
    if (config.exclude instanceof RegExp || typeof config === "string") {
      exclusions = [config.exclude]
    } else {
      exclusions = config.exclude
    }
  }

  if (inclusions && exclusions) {
    throw new Error(
      "Please only specify an `include` list *or* an `exclude` list (but not both)!"
    )
  }

  let files = fs.lstatSync(target).isFile()
    ? [target]
    : getFilesDeepSync(target)
  files = applyInclusionsAndExclusions(files, inclusions, exclusions)

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
      newHash = await getHashOfFile(file)

      if (!dict[file]) {
        dict[file] = newHash
        if (!first) created(file)
      } else {
        if (newHash !== dict[file]) modified(file)
        dict[file] = newHash
      }
    } catch (e) {
      deleted(file)
    }

    index++

    if (index >= files.length) {
      first = false
      index = 0

      let newFiles = fs.lstatSync(target).isFile()
        ? [target]
        : getFilesDeepSync(target)
      newFiles = applyInclusionsAndExclusions(newFiles, inclusions, exclusions)

      if (newFiles.length < files.length) {
        const deletedFiles = files.filter(f => newFiles.indexOf(f) < 0)

        deletedFiles.forEach(deletedFile => {
          deleted(deletedFile)
        })
      }

      files = newFiles
    }

    isBusy = false
  }, 1000 / scansPerSecond)

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
