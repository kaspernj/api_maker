class CreateProjectSecrets < ActiveRecord::Migration[5.2]
  def change
    create_table :project_secrets do |t|
      t.references :project, foreign_key: true, null: false
      t.string :key, null: false
      t.text :secret, null: false
      t.timestamps
    end
  end
end
