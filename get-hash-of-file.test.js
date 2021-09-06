const getHashOfFile = require("./get-hash-of-file.js")
const fs = require("fs")

test("tests that hashes of files are consistent", async () => {
  const hash1 = await getHashOfFile("./apply-inclusions-and-exclusions.js")
  const hash2 = await getHashOfFile("./apply-inclusions-and-exclusions.js")
  const hash3 = await getHashOfFile("./get-files-recursive.js")

  expect(hash1).toBe(hash2)
  expect(hash1).not.toBe(hash3)
})
