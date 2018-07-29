# ApiMaker

Generates a Rails API endpoints, JavaScript API files for Webpack and more by inspecting your models and serializers.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "api_maker"
```

## Usage

```bash
rake api_maker:generate_models
```

### Creating a new model from JavaScript

```js
var task = new Task()
task.assignAttributes({name: "New task"})
task.create().then((created) => {
  if (created) {
    console.log("Task was created")
  } else {
    console.log("Task wasnt created")
  }
})
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
