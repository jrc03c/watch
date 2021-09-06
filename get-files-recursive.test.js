const getFilesRecursive = require("./get-files-recursive.js")
const exec = require("child_process").exec
const path = require("path")
const fs = require("fs")
const dir = path.resolve("delete-me")

function sort(arr) {
  const out = arr.slice()
  out.sort()
  return out
}

beforeAll(() => {
  fs.mkdirSync(dir)
  fs.mkdirSync(dir + "/a")
  fs.mkdirSync(dir + "/b")
  fs.mkdirSync(dir + "/b/c")
  fs.mkdirSync(dir + "/d")
  fs.mkdirSync(dir + "/d/e")
  fs.mkdirSync(dir + "/d/e/f")
  fs.writeFileSync(dir + "/a/one.txt", Math.random().toString(), "utf8")
  fs.writeFileSync(dir + "/b/two.txt", Math.random().toString(), "utf8")
  fs.writeFileSync(dir + "/b/c/three.txt", Math.random().toString(), "utf8")
  fs.writeFileSync(dir + "/d/four.txt", Math.random().toString(), "utf8")
  fs.writeFileSync(dir + "/d/e/five.txt", Math.random().toString(), "utf8")
  fs.writeFileSync(dir + "/d/e/f/six.txt", Math.random().toString(), "utf8")
})

afterAll(() => {
  exec(`rm -rf ${dir}`)
})

test("tests that nested files are retrieved", () => {
  const filesTrue = sort([
    dir + "/a/one.txt",
    dir + "/b/two.txt",
    dir + "/b/c/three.txt",
    dir + "/d/four.txt",
    dir + "/d/e/five.txt",
    dir + "/d/e/f/six.txt",
  ])

  const filesPred = sort(getFilesRecursive(dir))
  expect(filesPred).toStrictEqual(filesTrue)
})
