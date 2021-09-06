const applyInclusionsAndExclusions = require("./apply-inclusions-and-exclusions.js")

test("tests the application of inclusions", () => {
  const items = [
    "foo",
    "bar.txt",
    "123-456-7890",
    "hello@somewhere.com",
    "James Bond",
    "555-555-5555",
  ]

  const phones = /\d\d\d-\d\d\d-\d\d\d\d/g
  const yTrue = ["123-456-7890", "555-555-5555"]
  const yPred = applyInclusionsAndExclusions(items, [phones], null)
  expect(yPred).toStrictEqual(yTrue)
})

test("tests the application of exclusions", () => {
  const items = [
    "foo",
    "bar.txt",
    "123-456-7890",
    "hello@somewhere.com",
    "James Bond",
    "555-555-5555",
  ]

  const phones = /\d\d\d-\d\d\d-\d\d\d\d/g
  const yTrue = ["foo", "bar.txt", "hello@somewhere.com", "James Bond"]
  const yPred = applyInclusionsAndExclusions(items, null, [phones])
  expect(yPred).toStrictEqual(yTrue)
})
