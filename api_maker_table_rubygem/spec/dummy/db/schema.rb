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

ActiveRecord::Schema[7.0].define(version: 2022_06_01_093751) do
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
    t.string "user_id", limit: 36, null: false
    t.string "identifier", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["identifier"], name: "index_table_settings_on_identifier"
    t.index ["user_id", "user_type", "identifier"], name: "index_table_settings_on_user_id_and_user_type_and_identifier", unique: true
    t.index ["user_type", "user_id"], name: "index_table_settings_on_user"
  end

  add_foreign_key "table_setting_columns", "table_settings"
end
