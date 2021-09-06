function applyWhitelistsAndBlacklists(items, whitelist, blacklist) {
  if (whitelist) {
    return items.filter(f => {
      for (let i = 0; i < whitelist.length; i++) {
        if (f.match(whitelist[i])) {
          return true
        }
      }

      return false
    })
  }

  if (blacklist) {
    return items.filter(f => {
      for (let i = 0; i < blacklist.length; i++) {
        if (f.match(blacklist[i])) {
          return false
        }
      }

      return true
    })
  }

  return items
}

module.exports = applyWhitelistsAndBlacklists
