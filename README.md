# ApiMaker

Generates a Rails API endpoints, JavaScript API files for Webpack and more by inspecting your models and serializers.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "api_maker"
```

Make a file where you define access in `app/models/api_maker_ability.rb` containing something like this:
```ruby
class ApiMakerAbility
  include CanCan::Ability

  def initialize(controller:)
    user = controller.current_user
    
    if user
      can :manage, Project, user_id: user.id
      can :manage, Task, project: {user_id: user.id}
      can :manage, User, id: user.id
    end
  end
end
```

## Usage

```bash
rake api_maker:generate_models
```

### Creating a new model from JavaScript

```js
var task = new Task()
task.assignAttributes({name: "New task"})
task.create().then((status) => {
  if (status.success) {
    console.log("Task was created")
  } else {
    console.log("Task wasnt created")
  }
})
```

### Finding an existing model

```js
Task.find(5).then((task) => {
  console.log("Task found: " + task.name)
})
```

### Updating a model

```js
task.assignAttributes({name: "New name"})
task.save().then((status) => {
  if (status.success) {
    console.log("Task was updated")
  } else {
    console.log("Task wasnt updated")
  }
})
```

```js
task.update({name: "New name"}).then((status) => {
  if (status.success) {
    console.log("Task was updated")
  } else {
    console.log("Task wasnt updated")
  }
})
```

### Deleting a model

```js
task.destroy().then((status) => {
  if (status.success) {
    console.log("Task was destroyed")
  } else {
    console.log("Task wasnt destroyed")
  }
})
```

### Query models

```js
Task.ransack({name_cont: "something"}).then((tasks) => {
  console.log("Found: " + tasks.length + " tasks")
})
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
