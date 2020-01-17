class CreateCustomerRelationships < ActiveRecord::Migration[6.0]
  def change
    create_table :customer_relationships do |t|
      t.references :child, foreign_key: {to_table: :customers}, null: false
      t.references :parent, foreign_key: {to_table: :customers}, null: false
      t.string :relationship_type, null: false
    end
  end
end
