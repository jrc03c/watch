# Introduction

**watch.js** is yet another file system watcher for Node.

# Installation

```bash
npm install --save https://github.com/jrc03c/watch.js
```

# Usage

```js
const watch = require("@jrc03c/watch")

const watcher = watch({
  target: "some/directory/or/file",

  // set the number of files to scan per second
  scanRate: 1000,

  created(file) {
    console.log("CREATED:", file)
  },

  modified(file) {
    console.log("MODIFIED:", file)
  },

  deleted(file) {
    console.log("DELETED:", file)
  },

  // watch ONLY *.txt files
  include: /\.txt/g,

  // watch all files EXCEPT *.png and *.jpg files
  exclude: [/\.png/g, /\.jpg/g],

  // NOTE: The `include` and `exclude` properties can be defined as
  // regexes or arrays of regexes. However, you can't use both at
  // the same time. You can use neither, or ONLY `include`, or
  // ONLY `exclude`!
})

// when finished watching:
// watcher.stop()

// or get the list of files being watched:
// console.log(watcher.files)
```

# Caveats

At the moment, `watch` doesn't directly notice the creation or deletion of _directories_; it only notices when _files_ have been added or deleted. So, if you make a new directory, `watch` won't notice until you add files to that directory. Similarly, if you delete a directory, `watch` will only notice that the files in that directory have been deleted, not that the directory itself was deleted.

Also, if the target you intend to watch (via `watch(target)`) completely disappears or doesn't exist in the first place, an error will be thrown instead of a deletion event. This happens whether the target is supposed to be a file or a directory.

Finally, I haven't tested all possible edge cases. It could be that `watch` will crash when it encounters certain kinds of files or extremely large files. Please let me know if you run into problems!

# How it works

I haven't really researched this, but it seems like a few of the popular file system watchers I've seen for Node rely on [`inotify`](https://en.wikipedia.org/wiki/Inotify) or similar. In other words, those other libraries work by creating a watcher for each file in a directory tree using `inotify`, which can eat up lots of system resources when the directory is large. In fact, in some cases, users have to manually increase their `inotify` watcher limit when the default number has been exceeded, usually by doing something like:

```bash
sudo sysctl fs.inotify.max_user_watches=SOME_LARGE_NUMBER
```

This library works differently. When you ask it to watch a directory, it gets the list of all files in the directory (and subdirectories) and continuously loops over them, asking each time: "Has the hash of this file changed since the last time I saw it?" If the hash _has_ changed, then a modification event is emitted. If a new file appears in the directory, then a creation event is emitted; and if a file disappears from the directory, then a deletion event is emitted.

So, this library decreases the number of watchers down to 1 but increases the time it takes to be notified of a file system change. As you can imagine, with large directories, it takes a longer time to loop over all of the files to detect changes. For example, imagine that you had a directory containing 1,000 files nested at various levels of depth. Using other libraries, 1,000 watchers would have to be created to monitor those files. In this library, only a single watcher is created, and it continuously loops over the 1,000 files and checks for changes. That doesn't mean this library is necessarily any better than the others (though it might be worse); it only means that it chooses a different strategy for spending system resources.
