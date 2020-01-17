# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_01_17_151857) do

  create_table "account_marked_tasks", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "task_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_marked_tasks_on_account_id"
    t.index ["task_id"], name: "index_account_marked_tasks_on_task_id"
  end

  create_table "accounts", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "customer_id"
    t.datetime "deleted_at"
    t.index ["customer_id"], name: "index_accounts_on_customer_id"
    t.index ["deleted_at"], name: "index_accounts_on_deleted_at"
  end

  create_table "activities", force: :cascade do |t|
    t.string "trackable_type"
    t.integer "trackable_id"
    t.string "owner_type"
    t.integer "owner_id"
    t.string "key"
    t.text "parameters"
    t.string "recipient_type"
    t.integer "recipient_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["owner_id", "owner_type"], name: "index_activities_on_owner_id_and_owner_type"
    t.index ["owner_type", "owner_id"], name: "index_activities_on_owner_type_and_owner_id"
    t.index ["recipient_id", "recipient_type"], name: "index_activities_on_recipient_id_and_recipient_type"
    t.index ["recipient_type", "recipient_id"], name: "index_activities_on_recipient_type_and_recipient_id"
    t.index ["trackable_id", "trackable_type"], name: "index_activities_on_trackable_id_and_trackable_type"
    t.index ["trackable_type", "trackable_id"], name: "index_activities_on_trackable_type_and_trackable_id"
  end

  create_table "customer_relationships", force: :cascade do |t|
    t.integer "child_id", null: false
    t.integer "parent_id", null: false
    t.string "relationship_type", null: false
    t.index ["child_id"], name: "index_customer_relationships_on_child_id"
    t.index ["parent_id"], name: "index_customer_relationships_on_parent_id"
  end

  create_table "customers", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "project_details", force: :cascade do |t|
    t.integer "project_id", null: false
    t.string "details"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.index ["deleted_at"], name: "index_project_details_on_deleted_at"
    t.index ["project_id"], name: "index_project_details_on_project_id", unique: true
  end

  create_table "project_secrets", force: :cascade do |t|
    t.integer "project_id", null: false
    t.string "key", null: false
    t.text "secret", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_secrets_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "account_id"
    t.integer "price_per_hour_cents"
    t.string "price_per_hour_currency"
    t.datetime "deleted_at"
    t.index ["account_id"], name: "index_projects_on_account_id"
    t.index ["deleted_at"], name: "index_projects_on_deleted_at"
  end

  create_table "tasks", force: :cascade do |t|
    t.string "name", null: false
    t.integer "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id"
    t.boolean "finished", default: false, null: false
    t.index ["project_id"], name: "index_tasks_on_project_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "user_roles", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "role", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_roles_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "birthday_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "account_marked_tasks", "accounts"
  add_foreign_key "account_marked_tasks", "tasks"
  add_foreign_key "customer_relationships", "customers", column: "child_id"
  add_foreign_key "customer_relationships", "customers", column: "parent_id"
  add_foreign_key "project_secrets", "projects"
  add_foreign_key "tasks", "projects"
  add_foreign_key "user_roles", "users"
end
