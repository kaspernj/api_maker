# ApiMaker

Generates Rails API endpoints and JavaScript API files for Webpack and more by inspecting your models and serializers.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "api_maker", git: "https://github.com/kaspernj/api_maker.git"
```

ApiMaker requires [Shakapacker](https://github.com/shakacode/shakapacker), so make sure you have that set up as well. It also uses an extension called [qs](https://www.npmjs.com/package/qs), that you should add to your packages, but that is probally already there by default.

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

If you want to use the table modules:
```ruby
gem "api_maker_table", git: "https://github.com/kaspernj/api_maker.git"
```

Run this command:
```bash
rails api_maker_table:install:migrations
```

Run the migrations
```bash
rails db:migrate
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

Make API maker able to listen for location changes by inserting this into your pack:
```js
import history from "shared/history"
import {callbacksHandler} from "on-location-changed/build/callbacks-handler"

callbacksHandler.connectReactRouterHistory(history)
```

Install the ERB loader for Webpack, and make sure it doesn't ignore the `node_modules` folder.

## Resources

ApiMaker will only create models, endpoints and serializers for ActiveRecord models that are defined as resources. So be sure to add resources under `app/api_maker/resources` for your models first. You can add some helper methods if you want to use in your resources like `current_user` and `signed_in_as_admin?`.
```ruby
class Resources::ApplicationResource < ApiMaker::BaseResource
  def current_user
    args&.dig(:current_user)
  end

  def signed_in_as_admin?
    current_user&.role == "admin"
  end
end
```

```ruby
class Resources::UserResources < Resources::ApplicationResource
  attributes :id, :email, :custom_attribute
  attributes :calculated_attribute, selected_by_default: false
  attributes :secret_attribute, if: :signed_in_as_admin?
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

If you want to be able to create and update models, then you should go into each resource and create a params method to define, which attributes can be written on each model like this:
```ruby
class Resources::TaskResource < ApiMaker::ModelController
  def permitted_params(arg)
    arg.params.require(:project).permit(:name)
  end
end
```

### I18n

Start by adding i18n-on-steroids to your project:
```bash
yarn add i18n-on-steroids
```

Create a I18n object you want to use throughout your project (app/javascript/i18n.js):
```js
import I18nOnSteroids from "i18n-on-steroids"

const i18n = new I18nOnSteroids()

i18n.setLocale("en")

export default i18n
```

You can import it globally through the provide plugin in Webpack and then use translations like this:
```js
i18n.t("js.some.key") //=> Key
```

### Routes

Configure JS routes in `config/js_routes.rb`:
```ruby
JsRoutes.setup do |config|
  config.camel_case = true
  config.url_links = true
end
```

Define route definitions that can be read by both Rails and JS like this in `app/javascript/route-definitions.json`:
```json
{
  "routes": [
    {"name": "new_session", "path": "/sessions/new", "component": "sessions/new"},
    {"name": "root", "path": "/", "component": "sessions/new"}
  ]
}
```

Define a file for `js-routes` in `app/javascript/js-routes.js.erb` that will automatically update if the routes or the definitions are changed:
```js
/* rails-erb-loader-dependencies ../config/routes.rb ./javascript/route-definitions.json */

const routes = {};

<%= JsRoutes.generate(namespace: "Namespace") %>
```

Install the route definitions in the Rails routes like this in `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  route_definitions = JSON.parse(File.read(Rails.root.join("app/javascript/nemoa/route-definitions.json")))
  ApiMaker::ResourceRouting.install_resource_routes(self, layout: "nemoa", route_definitions: route_definitions)
end
```

Define a routes file for your project (or multiple) in `app/javascript/routes.js`:
```js
import jsRoutes from "js-routes"
import Routes from "@kaspernj/api-maker/build/routes"
import routeDefinitions from "route-definitions.json"

const routes = new Routes({jsRoutes, routeDefinitions})

export default routes
```

You can use your Rails routes like this:
```js
import Routes from "routes"

Routes.userPath(user.id()) //=> /users/4
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
import {Task} from "models"

const task = new Task()
task.assignAttributes({name: "New task"})

try {
 await task.create()
 console.log(`Task was created with ID: ${task.id()}`)
} catch (error) {
  console.log("Task wasnt created")
}
```

### Finding an existing model

```js
const task = await Task.find(5)

console.log(`Task found: ${task.name()}`)
```

### Updating a model

```js
task.assignAttributes({name: "New name"})

try {
  await task.save()

  console.log(`Task was updated and name is now: ${task.name()}`)
} catch (error) {
  console.log("Task wasnt updated")
}
```

```js
try {
  await task.update({name: "New name"})

  console.log(`Task was updated and name is now: ${task.name()}`)
} catch (error) {
  console.log("Task wasnt updated")
}
```

### Deleting a model

```js
try {
  await task.destroy()

  console.log("Task was destroyed")
} catch (error) {
  console.log("Task wasnt destroyed")
}
```

### Preloading models

```js
const tasks = await Task.ransack().preload("project.customer").toArray()

for (const task of tasks) {
  console.log(`Project of task ${task.id()}: ${task.project().name()}`)
  console.log(`Customer of task ${task.id()}: ${task.project().customer().name()}`)
}
```

### Query models

API maker uses [Ransack](https://github.com/activerecord-hackery/ransack) to expose a huge amount of options to query data.

```js
const = tasks = await Task.ransack({name_cont: "something"}).toArray()

console.log(`Found: ${tasks.length} tasks`)
```

Distinct:
```js
const tasks = await Task.ransack({relationships_something_eq: "something"}).distinct().toArray()
```

### Selecting only specific attributes

```js
const tasks = await Task.ransack().select({Task: ["id", "name"]}).toArray()
```

### Sorting models

```js
Task.ransack({s: "id desc"})
```

### Attributes

Each attribute is defined as a method on each model. So if you have an attribute called `name` on the `Task`-model, then it be read by doing this: `task.name()`.

### Prop types validation

You can validate model types and loaded attributes like this:

```js
import ModelPropType from "@kaspernj/api-maker/build/model-prop-type"

class MyComponent extends React.Component {
  static propTypes = {
    task: ModelPropType.ofModel(Task).withLoadedAttributes(["id", "name", "updatedAt"]).isRequired
  }
}
```

Or if it isn't required:
```js
class MyComponent extends React.Component {
  static propTypes = {
    task: ModelPropType.ofModel(Task).withLoadedAttributes(["id", "name", "updatedAt"]).isNotRequired
  }
}
```

You can also validate loaded abilities like this:
```js
class MyComponent extends React.Component {
  static propTypes = {
    task: ModelPropType.ofModel(Task).withLoadedAbilities(["destroy", "edit"]).isNotRequired
  }
}
```

It is possible to validate on nested preloaded associations recursively as well:
```js
class MyComponent extends React.Component {
  static propTypes = {
    task: ModelPropType.ofModel(Task)
      .withLoadedAssociation("project")
        .withLoadedAttributes(["name"]) // Validates that the attribute 'name' is loaded on the association called 'project'
        .withLoadedAssociation("account")
          .withLoadedAttributes(["name"]) // Validates that the attribute 'name' is loaded on the association called 'account' through 'project'
          .previous()
        .previous()
      .isRequired
  }
}
```

### Relationships

#### Has many

A `has many` relationship will return a collection the queries the sub models.

```js
const tasks = await project.tasks().toArray()

console.log(`Project ${project.id()} has ${tasks.length} tasks`)

for(const key in tasks) {
  const task = tasks[key]
  console.log(`Task ${task.id()} is named: ${task.name()}`)
}
```

#### Belongs to

A `belongs to` relationship will return a promise that will get that model:

```js
const project = await task.project()

console.log(`Task ${task.id()} belongs to a project called: ${project.name()}`)
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
import Devise from "@kaspernj/api-maker/build/devise"

console.log(`The current user has this email: ${Devise.currentUser().email()}`)
```

## Events from the backend

### Custom events

Add the relevant access to your resource:

```ruby
class Resources::UserResource < ApplicationAbility
  def abilities
    can :event_new_message, User, id: 5
  end
end
```

Send an event from Ruby:
```ruby
user = User.find(5)
user.api_maker_event("new_message", message: "Hello world")
```

Receive the event in JavaScript:
```js
const user = await User.find(5)
user.connect("new_message", args => {
  console.log(`New message: ${args.message}`)
})
```

Or you can receive the event in React:
```jsx
<EventConnection event="new_message" model={user} onCall={args => this.onNewMessage(args)} />
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
const user = await User.find(5)

let subscription = user.connectUpdated(args => {
  console.log(`Model was updated: ${args.model.id()}`)
})
```

Remember to unsubscrube again:
```js
subscription.unsubscribe()
```

You can also use a React component if you use React and dont want to keep track of when to unsubscribe:
```jsx
import useCreatedEvent from "@kaspernj/api-maker/build/use-created-event"
import useDestroyedEvent from "@kaspernj/api-maker/build/use-destroyed-event"
import useUpdatedEvent from "@kaspernj/api-maker/build/use-updated-event"
```

```js
useCreatedEvent(User, this.onUserCreated)
useDestroyedEvent(user, this.onUserDestroyed)
useUpdatedEvent(user, this.onUserUpdated)
```

```js
onUserCreated = (args) => {
  this.setState({user: args.model})
}

onUserDestroyed = (args) => {
  this.setState({user: args.model})
}

onUserUpdated = (args) => {
  this.setState({user: args.model})
}
```

You can also use this React component to show a models attribute with automatic updates:

```jsx
import UpdatedAttribute from "@kaspernj/api-maker/build/updated-attribute"
```

```jsx
<UpdatedAttribute model={user} attribute="email" />
```

You can also use the `EventConnection` React component so you don't need to keep track of your subscription and unsubscribe:
```jsx
import EventConnection from "@kaspernj/api-maker/build/event-connection"
```

```jsx
<EventConnection model={this.state.user} event="eventName" onCall={this.onEvent} />

onEvent = (data) => {
  console.log("Event was called", data)
}
```

### Loading abilities into the frontend from CanCan
```jsx
const tasks = await Task
  .ransack({name_cont: "something"})
  .abilities({
    Task: ["edit"]
  })
  .toArray()

const firstTask = tasks[0]

if (firstTask.can("edit")) {
  console.log(`User can edit task ${task.id()}`)
} else {
  console.log(`User cant edit task ${task.id()}`)
}
```

### Loading static abilities from CanCan

Getting the CanCan instance
```js
import { CanCan } from "api-maker"

const canCan = CanCan.current()
```

Loading a single ability
```js
await canCan.loadAbility("access", "admin")
```

Loading multiple static abilities for a model
```js
await canCan.loadAbilities([
  [Invoice, ["bookBookable", "creditCreditable"]]
])
```

### Resetting cached abilities in CanCan

To avoid doing queries for the same abilities in CanCan over an over they are cached. If some things change it can be necessary to reset those abilities.
```js
await canCan.resetAbilities()
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
  config.on_error do |command:, controller:, error:, response:|
    ExceptionNotifier.notify_exception(error, env: controller&.request&.env)
  end
end
```

# Use your own ability class

You can customise the ability object.

Configure API maker to use your own class:
```ruby
ApiMaker::Configuration.configure do |config|
  config.ability_class_name = "MyAbility"
end
```

Then add an ability:
```ruby
class MyAbility < ApiMaker::Ability
  def initialize(args)
    super
    your_custom_code
  end
end
```

## Development

Bundle all configurations.
```bash
bundle exec appraisal bundle
```

Run a spec with all configurations.
```bash
bundle exec appraisal rspec
```

Its kinda fucked up to run system specs, but this command should work from the ruby-gem directory:
```bash
rm -rf spec/dummy/public/packs/ && cd spec/dummy/ && bin/shakapacker && cd ../.. && xvfb-run bundle exec appraisal "rails 7" rspec spec/system/api_maker_table/api_maker_table_spec.rb
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
