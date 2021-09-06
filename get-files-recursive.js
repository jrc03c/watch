const fs = require("fs")
const path = require("path")

function getFilesRecursive(dir) {
  dir = path.resolve(dir)

  if (fs.lstatSync(dir).isFile()) {
    throw new Error("`dir` must be a directory!")
  }

  const children = fs.readdirSync(dir)
  let out = []

  children.forEach(child => {
    if (fs.lstatSync(dir + "/" + child).isFile()) {
      out.push(dir + "/" + child)
    } else {
      out = out.concat(getFilesRecursive(dir + "/" + child))
    }
  })

  return out
}

module.exports = getFilesRecursive
