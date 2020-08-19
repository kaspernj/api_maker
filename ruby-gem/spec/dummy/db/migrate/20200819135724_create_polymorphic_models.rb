class CreatePolymorphicModels < ActiveRecord::Migration[6.0]
  def change
    create_table :polymorphic_models do |t|
      t.references :resource, polymorphic: true

      t.timestamps
    end
  end
end
