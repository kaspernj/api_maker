# Fetching Object

## Usage

```js
import fetchingObject from "fetching-object"

const person = {
  firstName: "Kasper"
  lastName: "Stöckel"
}

const personWithFetching = fetchingObject(person)

person.firstName // "Kasper"
person.middleName // PropertyNotFoundError(`Property not found: ${prop}`)
person.lastName // "Stöckel
```

```js
const shared = {
  {person: person1}
}

const personWithFetching = fetchingObject(() => shared.person)

person.firstName // "Kasper"
person.middleName // PropertyNotFoundError(`Property not found: ${prop}`)

shared.person = {firstName: "Christina", lastName: "Stöckel"}
person.middleName // PropertyNotFoundError(`Property not found: ${prop}`)

person.firstName // "Christina"
```
