class CreateProjectDetailFiles < ActiveRecord::Migration[6.0]
  def change
    create_table :project_detail_files do |t|
      t.references :project_detail, foreign_key: true, null: false
      t.string :filename, null: false
      t.timestamps
    end
  end
end
