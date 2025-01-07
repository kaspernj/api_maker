admin_user = User.find_or_initialize_by(email: "admin@example.com")

if admin_user.new_record?
  admin_user.assign_attributes(
    admin: true,
    password: "password",
    password_confirmation: "password"
  )
end

admin_user.save! if admin_user.changed?

user = User.find_or_initialize_by(email: "user@example.com")

if user.new_record?
  user.assign_attributes(
    password: "password",
    password_confirmation: "password"
  )
end

user.save! if user.changed?

account = Account.find_or_create_by!(name: "Test account")
project = Project.find_or_create_by!(account:, name: "Test project")
Task.find_or_create_by!(name: "Test task", project:, user:)
