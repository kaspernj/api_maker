# ApiMaker

Generates Rails API endpoints and JavaScript API files for Webpack and more by inspecting your models and serializers.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "api_maker"
```

ApiMaker requires [Webpacker](https://github.com/rails/webpacker), so make sure you have that set up as well. It also uses an extension called [qs](https://www.npmjs.com/package/qs), that you should add to your packages, but that is probally already there by default.

ApiMaker makes use of [CanCanCan](https://github.com/CanCanCommunity/cancancan) to keep track of what models a given user should have access to. Each resource defines its own abilities under `app/api_maker/resources/user_resource` like this:
```ruby
class Resources::UserResource < Resources::ApplicationResource
  def abilities
    can :update, User if current_user&.admin?
    can :update, User, id: current_user&.id if current_user.present?
    can :read, User
  end
end
```

Add an `api_maker_args` method to your application controller. This controls what arguments will be passed to the CanCan ability and the serializers:
```ruby
class ApplicationController
private

  def api_maker_args
    @api_maker_args ||= {current_user: current_user}
  end
end
```

Insert this mount into `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  mount ApiMaker::Engine => "/api_maker"
end
```

ApiMaker will only create models, endpoints and serializers for ActiveRecord models that are defined as resources. So be sure to add resources under `app/api_maker/resources` for your models first.
```ruby
class Resources::ApplicationResource < ApiMaker::BaseResource
end
```

```ruby
class Resources::UserResources < Resources::ApplicationResource
  attributes :id, :email, :custom_attribute
  collection_commands :count_users
  member_commands :calculate_age
  relationships :account, :tasks

  def custom_attribute
    "Hello world! Current user is: #{args.fetch(:current_user).email}"
  end
end
```

You should also create an application command here: `app/api_maker/commands/application_command` with content like this:
```ruby
class Commands::ApplicationCommand < ApiMaker::BaseCommand
end
```

Add this to your application model:
```ruby
class ApplicationRecord < ActiveRecord::Base
  include ApiMaker::ModelExtensions
end
```

ApiMaker uses that to keep track of what attributes, relationships and commands you want exposed through the API.

Its now time to generate everything like this:
```bash
rake api_maker:generate_models
```

If you want to be able to create and update models, then you should go into each resource and create a params method to define, which attributes can be written on each model like this:
```ruby
class Resources::TaskResource < ApiMaker::ModelController
  def permitted_params(arg)
    arg.params.require(:project).permit(:name)
  end
end
```

### I18n

In order to use the built in text support, you need to add `i18n-js` to your project.

Start by adding to your Gemfile:
```ruby
gem "i18n-js"
```

Then add `config/i18n-js.yml`:
```yml
translations:
  - file: "app/assets/javascripts/i18n/translations.js"
    only: ["*.activerecord.attributes.*", "*.activerecord.models.*", "*.date.*", "*.js.*", "*.number.currency.*", "*.time.*"]
```

Then add this to `app/assets/javascript/application.js.erb`:
```js
//= require i18n
//= require i18n/translations

var locale = document.querySelector("html").getAttribute("lang")
I18n.locale = locale

<% if Rails.env.development? || Rails.env.test? %>
  I18n.missingTranslation = function(key) {
    console.error(`No translation for: ${key}`)
    return `translation missing: ${key}`
  }
<% end %>
```

Add this to the `<html>`-tag:
```html
<html lang="<%= I18n.locale %>">
```

Add this to `config/application.rb` to ease development:
```ruby
config.middleware.use I18n::JS::Middleware
```

### ActionCable

Your `connection.rb` should look something like this:
```rb
class ApplicationCable::Connection < ActionCable::Connection::Base
  identified_by :current_user

  def connect
    self.current_user = find_verified_user
  end

private

  def find_verified_user
    verified_user = User.find_by(id: cookies.signed["user.id"])

    if verified_user && cookies.signed["user.expires_at"] > Time.zone.now
      verified_user
    else
      reject_unauthorized_connection
    end
  end
end
```

Your `channel.rb` should look something like this:
```rb
class ApplicationCable::Channel < ActionCable::Channel::Base
private # rubocop:disable Layout/IndentationWidth

  def current_ability
    @current_ability ||= ApiMakerAbility.for_user(current_user)
  end

  def current_user
    @current_user ||= env["warden"].user
  end
end
```

## Usage

### Creating a new model from JavaScript

```js
import Task from "api-maker/models/task"

var task = new Task()
task.assignAttributes({name: "New task"})
task.create().then(status => {
  if (status.success) {
    console.log(`Task was created with ID: ${task.id()}`)
  } else {
    console.log("Task wasnt created")
  }
})
```

### Finding an existing model

```js
Task.find(5).then(task => {
  console.log(`Task found: ${task.name()}`)
})
```

### Updating a model

```js
task.assignAttributes({name: "New name"})
task.save().then(status => {
  if (status.success) {
    console.log(`Task was updated and name is now: ${task.name()}`)
  } else {
    console.log("Task wasnt updated")
  }
})
```

```js
task.update({name: "New name"}).then(status => {
  if (status.success) {
    console.log(`Task was updated and name is now: ${task.name()}`)
  } else {
    console.log("Task wasnt updated")
  }
})
```

### Deleting a model

```js
task.destroy().then(status => {
  if (status.success) {
    console.log("Task was destroyed")
  } else {
    console.log("Task wasnt destroyed")
  }
})
```

### Preloading models

```js
Task.ransack().preload("project.customer").toArray().then(tasks => {
  for(var task of tasks) {
    console.log(`Project of task ${task.id()}: ${task.project().name()}`)
    console.log(`Customer of task ${task.id()}: ${task.project().customer().name()}`)
  }
})
```

### Query models

ApiModels uses [Ransack](https://github.com/activerecord-hackery/ransack) to expose a huge amount of options to query data.

```js
Task.ransack({name_cont: "something"}).toArray().then(tasks => {
  console.log(`Found: ${tasks.length} tasks`)
})
```

Distinct:
```js
var tasks = await Task.ransack({relationships_something_eq: "something"}).distinct().toArray()
```

### Selecting only specific attributes

```js
Task.ransack().select({Task: ["id", "name"]}).toArray().then(tasks => this.setState({tasks}))
```

### Sorting models

```js
Task.ransack({s: "id desc"})
```

### Attributes

Each attribute is defined as a method on each model. So if you have an attribute called `name` on the `Task`-model, then it be read by doing this: `task.name()`.

### Relationships

#### Has many

A `has many` relationship will return a collection the queries the sub models.

```js
project.tasks().toArray().then(tasks => {
  console.log(`Project ${project.id()} has ${tasks.length} tasks`)

  for(var key in tasks) {
    var task = tasks[key]
    console.log(`Task ${task.id()} is named: ${task.name()}`)
  }
})
```

#### Belongs to

A `belongs to` relationship will return a promise that will get that model:

```js
task.project().then(project => {
  console.log(`Task ${task.id()} belongs to a project called: ${project.name()}`)
})
```

#### Has one

A `has one` relationship will also return a promise that will get that model like a `belongs to` relationship.

#### Getting the current user

First include this in your layout, so JS can know which user is signed in:
```erb
<body>
  <%= render "/api_maker/data" %>
```

Then you can do like this in JS:
```js
import Devise from "api-maker/devise"

Devise.currentUser().then(user => {
  console.log(`The current user has this email: ${user.email()}`)
})
```

## Events from the backend

### Custom events

Add the relevant access to your abilities:

```ruby
class ApiMakerAbility < ApplicationAbility
  def initialize(args:)
    can :event_new_message, User, id: 5
  end
end
```

```ruby
user = User.find(5)
user.api_maker_event("new_message", message: "Hello world")
```

```js
User.find(5).then(user => {
  user.connect("new_message", args => {
    console.log(`New message: ${args.message}`)
  })
})
```

### Update models

Add this to your abilities:
```ruby
class ApiMakerAbility < ApplicationAbility
  def initialize(args:)
    can [:create_events, :destroy_events, :update_events], User, id: 5
  end
end
```

Add this to the model you want to broadcast updates:
```ruby
class User < ApplicationRecord
  api_maker_broadcast_creates
  api_maker_broadcast_destroys
  api_maker_broadcast_updates
end
```

```js
User.find(5).then(user => {
  let subscription = user.connectUpdated(args => {
    console.log(`Model was updated: ${args.model.id()}`)
  })
})
```

Remember to unsubscrube again:
```js
subscription.unsubscribe()
```

You can also use a React component if you use React and dont want to keep track of when to unsubscribe:
```jsx
import EventUpdated from "api-maker/event-created"
import EventUpdated from "api-maker/event-destroyed"
import EventUpdated from "api-maker/event-updated"
```

```jsx
<EventCreated modelClass={User} onCreated={(args) => this.onUserCreated(args)} />
<EventDestroyed model={user} onDestroyed={(args) => this.onUserDestroyed(args)} />
<EventUpdated model={user} onUpdated={(args) => this.onUserUpdated(args)} />
```

```jsx
onUserCreated(args) {
  this.setState({user: args.model})
}

onUserDestroyed(args) {
  this.setState({user: args.model})
}

onUserUpdated(args) {
  this.setState({user: args.model})
}
```

You can also use this React component to show a models attribute with automatic updates:

```jsx
import UpdatedAttribute from "api-maker/updated-attribute"
```

```jsx
<UpdatedAttribute model={user} attribute="email" />
```

You can also use the `EventConnection` React component so you don't need to keep track of your subscription and unsubscribe:
```jsx
import EventConnection from "api-maker/event-connection"
```

```jsx
<EventConnection model={this.state.user} event="eventName" onCall={(data) => this.onEvent(data)} />
```

## Serializing

### Conditional attributes

This will only include the email for users, if the current user signed in is an admin.

```ruby
class Resources::UserResource < Resources::ApplicationResource
  attributes :id
  attributes :email, if: :signed_in_as_admin?

private

  def signed_in_as_admin?
    args[:current_user]&.admin?
  end
end
```


## Reporting errors

Add an intializer with something like this:

```ruby
ApiMaker::Configuration.configure do |config|
  config.on_error do |controller:, error:|
    ExceptionNotifier.notify_exception(error, env: controller&.request&.env)
  end
end
```


## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
