class FixTableSettingColumnsPosition < ActiveRecord::Migration[7.0]
  def up
    execute("SELECT * FROM table_settings").to_a(as: :hash).each do |table_setting|
      columns = execute("SELECT * FROM table_setting_columns WHERE table_setting_id = '#{table_setting.fetch("id")}' ORDER BY position").to_a(as: :hash)
      columns.each_with_index do |column, column_index|
        position = column.fetch("position")

        if position != column_index
          puts "UPDATING POSITION FROM #{position} TO #{column_index}"
          execute("UPDATE table_setting_columns SET position = '#{column_index}' WHERE id = '#{column.fetch("id")}'")
        end
      end
    end
  end

  def down
    # Do nothing
  end
end
