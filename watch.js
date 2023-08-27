const { getFilesDeepSync } = require("@jrc03c/fs-extras")
const applyInclusionsAndExclusions = require("./apply-inclusions-and-exclusions.js")
const fs = require("node:fs")
const path = require("node:path")

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
    if (
      config.include instanceof RegExp ||
      typeof config.include === "string"
    ) {
      inclusions = [config.include]
    } else {
      inclusions = config.include
    }
  }

  if (config.exclude) {
    if (
      config.exclude instanceof RegExp ||
      typeof config.exclude === "string"
    ) {
      exclusions = [config.exclude]
    } else {
      exclusions = config.exclude
    }
  }

  if (inclusions && exclusions) {
    throw new Error(
      "Please only specify an `include` list *or* an `exclude` list (but not both)!",
    )
  }

  let files = fs.statSync(target).isFile() ? [target] : getFilesDeepSync(target)
  files = applyInclusionsAndExclusions(files, inclusions, exclusions)

  const dict = {}
  let index = 0
  let isBusy = false
  let first = true

  const interval = setInterval(async () => {
    if (isBusy) return
    isBusy = true

    const file = files[index]
    let newModificationTime

    try {
      newModificationTime = fs.statSync(file).mtimeMs

      if (!dict[file]) {
        dict[file] = newModificationTime
        if (!first) created(file)
      } else {
        if (newModificationTime !== dict[file]) modified(file)
        dict[file] = newModificationTime
      }
    } catch (e) {
      deleted(file)
    }

    index++

    if (index >= files.length) {
      first = false
      index = 0

      let newFiles = fs.statSync(target).isFile()
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
