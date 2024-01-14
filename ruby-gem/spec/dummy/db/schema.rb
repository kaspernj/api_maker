# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2024_01_14_113251) do
  create_table "account_marked_tasks", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "task_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["account_id"], name: "index_account_marked_tasks_on_account_id"
    t.index ["task_id"], name: "index_account_marked_tasks_on_task_id"
  end

  create_table "accounts", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "customer_id"
    t.datetime "deleted_at", precision: nil
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["owner_id", "owner_type"], name: "index_activities_on_owner_id_and_owner_type"
    t.index ["owner_type", "owner_id"], name: "index_activities_on_owner_type_and_owner_id"
    t.index ["recipient_id", "recipient_type"], name: "index_activities_on_recipient_id_and_recipient_type"
    t.index ["recipient_type", "recipient_id"], name: "index_activities_on_recipient_type_and_recipient_id"
    t.index ["trackable_id", "trackable_type"], name: "index_activities_on_trackable_id_and_trackable_type"
    t.index ["trackable_type", "trackable_id"], name: "index_activities_on_trackable_type_and_trackable_id"
  end

  create_table "comments", force: :cascade do |t|
    t.integer "author_id", null: false
    t.string "resource_type", null: false
    t.integer "resource_id", null: false
    t.text "comment", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_comments_on_author_id"
    t.index ["resource_type", "resource_id"], name: "index_comments_on_resource_type_and_resource_id"
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
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "project_detail_files", force: :cascade do |t|
    t.integer "project_detail_id", null: false
    t.string "filename", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_detail_id"], name: "index_project_detail_files_on_project_detail_id"
  end

  create_table "project_details", force: :cascade do |t|
    t.integer "project_id", null: false
    t.string "details"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.datetime "deleted_at", precision: nil
    t.index ["deleted_at"], name: "index_project_details_on_deleted_at"
    t.index ["project_id"], name: "index_project_details_on_project_id", unique: true
  end

  create_table "project_secrets", force: :cascade do |t|
    t.integer "project_id", null: false
    t.string "key", null: false
    t.text "secret", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["project_id"], name: "index_project_secrets_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "account_id"
    t.integer "price_per_hour_cents"
    t.string "price_per_hour_currency"
    t.datetime "deleted_at", precision: nil
    t.boolean "illegal", default: false, null: false
    t.boolean "public", default: false, null: false
    t.index ["account_id"], name: "index_projects_on_account_id"
    t.index ["deleted_at"], name: "index_projects_on_deleted_at"
  end

  create_table "table_searches", force: :cascade do |t|
    t.string "name", null: false
    t.text "query_params", null: false
    t.string "user_type"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_type", "user_id"], name: "index_table_searches_on_user"
  end

  create_table "table_setting_columns", force: :cascade do |t|
    t.integer "table_setting_id", null: false
    t.string "identifier", null: false
    t.string "attribute_name"
    t.text "path"
    t.string "sort_key"
    t.integer "position", null: false
    t.boolean "visible"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["identifier"], name: "index_table_setting_columns_on_identifier"
    t.index ["table_setting_id", "identifier"], name: "index_table_setting_columns_on_table_setting_id_and_identifier", unique: true
    t.index ["table_setting_id"], name: "index_table_setting_columns_on_table_setting_id"
  end

  create_table "table_settings", force: :cascade do |t|
    t.string "user_type", null: false
    t.integer "user_id", null: false
    t.string "identifier", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["identifier"], name: "index_table_settings_on_identifier"
    t.index ["user_id", "user_type", "identifier"], name: "index_table_settings_on_user_id_and_user_type_and_identifier", unique: true
    t.index ["user_type", "user_id"], name: "index_table_settings_on_user"
  end

  create_table "task_details", force: :cascade do |t|
    t.integer "task_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_task_details_on_task_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.string "name", null: false
    t.integer "project_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "user_id"
    t.boolean "finished", default: false, null: false
    t.string "state", default: "open", null: false
    t.integer "priority"
    t.string "support_email"
    t.index ["project_id"], name: "index_tasks_on_project_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "user_roles", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "role", null: false
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["user_id"], name: "index_user_roles_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at", precision: nil
    t.datetime "last_sign_in_at", precision: nil
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.date "birthday_at"
    t.boolean "admin", default: false, null: false
    t.string "first_name"
    t.string "last_name"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "account_marked_tasks", "accounts"
  add_foreign_key "account_marked_tasks", "tasks"
  add_foreign_key "accounts", "customers"
  add_foreign_key "comments", "users", column: "author_id"
  add_foreign_key "customer_relationships", "customers", column: "child_id"
  add_foreign_key "customer_relationships", "customers", column: "parent_id"
  add_foreign_key "project_detail_files", "project_details"
  add_foreign_key "project_details", "projects"
  add_foreign_key "project_secrets", "projects"
  add_foreign_key "projects", "accounts"
  add_foreign_key "table_setting_columns", "table_settings"
  add_foreign_key "task_details", "tasks"
  add_foreign_key "tasks", "projects"
  add_foreign_key "tasks", "users"
  add_foreign_key "user_roles", "users"
end
