module.exports = class FormData {
  data = {}

  append(key, value) {
    this.data[key] = value
  }

  entries() {
    const entries = []

    for (const key in this.data) {
      const value = this.data[key]
      const entry = [key, value]

      entries.push(entry)
    }

    return entries
  }
}
