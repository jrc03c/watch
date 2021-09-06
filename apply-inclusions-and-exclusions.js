function applyInclusionsAndExclusions(items, inclusions, exclusions) {
  if (inclusions) {
    return items.filter(f => {
      for (let i = 0; i < inclusions.length; i++) {
        if (f.match(inclusions[i])) {
          return true
        }
      }

      return false
    })
  }

  if (exclusions) {
    return items.filter(f => {
      for (let i = 0; i < exclusions.length; i++) {
        if (f.match(exclusions[i])) {
          return false
        }
      }

      return true
    })
  }

  return items
}

module.exports = applyInclusionsAndExclusions
