class CreateComments < ActiveRecord::Migration[6.0]
  def change
    create_table :comments do |t|
      t.references :author, foreign_key: {to_table: :users}, null: false
      t.references :resource, polymorphic: true, null: false
      t.text :comment, null: false
      t.timestamps
    end
  end
end
