# incorporator

Yet another merger for JS.

## Usage

### Merge two objects.

```js
import {incorporate} from "incorporator"

const data1 = {
  people: ["Kasper"],
  type: "nicePeople"
}

const data2 = {
  people: ["Christina"],
  mode: "lovelyPeople"
}

const merged = incorporate(data1, data2)

console.log(merged)
```

```js
{
  people: ["Kasper", "Christina"],
  type: "nicePeople",
  mode: "lovelyPeople"
}
```

### Replace array values

```js
import Incorporator from "incorporator"

const data1 = {
  people: ["Kasper"],
  type: "nicePeople"
}

const data2 = {
  people: ["Christina"],
  mode: "lovelyPeople"
}

const mergedObject = {}
const incorporator = new Incorporator({objects: [mergedObject, data1, data2]})

incorporator.replaceArrayIfExists(true)
incorporator.merge()

console.log(mergedOjbect)
```

```js
{
  people: ["Christina"],
  type: "nicePeople",
  mode: "lovelyPeople"
}
```
