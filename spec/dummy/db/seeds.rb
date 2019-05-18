user = User.find_or_initialize_by(email: "user@example.com")

if user.new_record?
  user.assign_attributes(
    password: "password",
    password_confirmation: "password"
  )
end

user.save! if user.changed?

account = Account.find_or_create_by!(name: "Test account")
project = Project.find_or_create_by!(account: account, name: "Test project")
task = Task.find_or_create_by!(name: "Test task", project: project, user: user)
