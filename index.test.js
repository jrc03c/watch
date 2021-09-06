const fs = require("fs")
const exec = require("child_process").exec
const path = require("path")
const watch = require("./index.js")

Array.prototype.random = function () {
  const self = this
  return self[parseInt(Math.random() * self.length)]
}

String.prototype.random = function () {
  const self = this
  return self[parseInt(Math.random() * self.length)]
}

function makeKey(n) {
  const alpha = "abcdefghijklmnopqrstuvwxyz"
  let out = ""
  for (let i = 0; i < n; i++) out += alpha.random()
  return out
}

function pause(ms) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, ms)
    } catch (e) {
      reject(e)
    }
  })
}

const root = path.resolve(makeKey(8))
const directories = [root]
const files = []

beforeAll(() => {
  fs.mkdirSync(root)

  for (let i = 0; i < 10; i++) {
    const dir = directories.random()
    const name = makeKey(8)

    if (Math.random() < 0.5) {
      // create a file
      files.push(dir + "/" + name)
      fs.writeFileSync(dir + "/" + name, makeKey(256), "utf8")
    } else {
      // create a directory
      directories.push(dir + "/" + name)
      fs.mkdirSync(dir + "/" + name)
    }
  }
})

afterAll(() => {
  // exec(`rm -rf ${root}`)
})

test("tests that watchers call callbacks", async () => {
  const dir = directories.random()
  const newFileTrue = dir + "/" + makeKey(8)
  const modifiedFileTrue = files.random()
  const deletedFileTrue = files.random()
  let newFilePred, modifiedFilePred, deletedFilePred

  const watcher = watch({
    target: root,

    created(file) {
      newFilePred = file
    },

    modified(file) {
      modifiedFilePred = file
    },

    deleted(file) {
      deletedFilePred = file
    },
  })

  fs.writeFileSync(newFileTrue, makeKey(256), "utf8")
  while (!newFilePred) await pause(10)
  expect(newFilePred).toBe(newFileTrue)

  fs.writeFileSync(modifiedFileTrue, makeKey(256), "utf8")
  while (!modifiedFilePred) await pause(10)
  expect(modifiedFilePred).toBe(modifiedFileTrue)

  exec(`rm -rf ${deletedFileTrue}`)
  while (!deletedFilePred) await pause(10)
  expect(deletedFilePred).toBe(deletedFileTrue)

  watcher.stop()
})
