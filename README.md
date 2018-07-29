# ApiMaker

Generates Rails API endpoints and JavaScript API files for Webpack and more by inspecting your models and serializers.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "api_maker"
```

ApiMaker requires [Webpacker](https://github.com/rails/webpacker), so make sure you have that set up as well. I also uses an extension called [qs](https://www.npmjs.com/package/qs), that you should add to your packages, but that is probally already there by default.

ApiMaker makes use of [CanCanCan](https://github.com/CanCanCommunity/cancancan) to keep track of, what models a given user should have access to. Make a file where you define access in `app/models/api_maker_ability.rb` containing something like this:
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

ApiMaker will only create models and endpoints for ActiveRecord models that has serializers. So be sure to add [ActiveModelSerializers](https://github.com/rails-api/active_model_serializers) for your models first.

ApiMaker uses that to keep track of, what data and relationships you want exposed through the API.

Its now time to generate models and controllers like this:
```bash
rake api_maker:generate_models
```

If you want to be able to create and update models, then you should go into each generated controller and create a params method to define, which attributes can be written on each model like this:
```ruby
class ApiMaker::ProjectsController < ApiMaker::ModelController
private

  def project_params
    params.require(:project).permit(:name)
  end
end
```

## Usage

### Creating a new model from JavaScript

```js
import Task from "ApiMaker/Models/Task"

var task = new Task()
task.assignAttributes({name: "New task"})
task.create().then((status) => {
  if (status.success) {
    console.log("Task was created with ID: " + task.id())
  } else {
    console.log("Task wasnt created")
  }
})
```

### Finding an existing model

```js
Task.find(5).then((task) => {
  console.log("Task found: " + task.name())
})
```

### Updating a model

```js
task.assignAttributes({name: "New name"})
task.save().then((status) => {
  if (status.success) {
    console.log("Task was updated and name is now: " + task.name())
  } else {
    console.log("Task wasnt updated")
  }
})
```

```js
task.update({name: "New name"}).then((status) => {
  if (status.success) {
    console.log("Task was updated and name is now: " + task.name())
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

ApiModels uses [Ransack](https://github.com/activerecord-hackery/ransack) to expose a huge amount of options to query data.

```js
Task.ransack({name_cont: "something"}).toArray().then((tasks) => {
  console.log("Found: " + tasks.length + " tasks")
})
```

### Attributes

Each attribute is defined as a method on each model. So if you have an attribute called `name` on the `Task`-model, then it be read by doing this: `task.name()`.

### Relationships

#### Has many

A `has many` relationship will return a collection the queries the sub models.

```js
project.tasks().toArray().then((tasks) => {
  console.log("Project " + project.id() + " has " + tasks.length + " tasks")
  
  for(var key in tasks) {
    var task = tasks[key]
    console.log("Task " + task.id() + " is named: " + task.name())
  }
})
```

#### Belongs to

A `belongs to` relationship will return a promise that will get that model:

```js
task.project().then((project) => {
  console.log("Task " + task.id() + " belongs to a project called: " + project.name())
})
```

#### Has one

A `has one` relationship will also return a promise that will get that model like a `belongs to` relationship.

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
