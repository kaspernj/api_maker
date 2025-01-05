# This migration comes from api_maker_table (originally 20250105094609)
class FixTableSettingColumnsPosition < ActiveRecord::Migration[7.0]
  def up
    run_query("SELECT * FROM table_settings").each do |table_setting|
      columns = run_query("SELECT * FROM table_setting_columns WHERE table_setting_id = '#{table_setting.fetch("id")}' ORDER BY position")
      columns.each_with_index do |column, column_index|
        position = column.fetch("position")

        if position != column_index
          puts "UPDATING POSITION FROM #{position} TO #{column_index}"
          run_query("UPDATE table_setting_columns SET position = '#{column_index}' WHERE id = '#{column.fetch("id")}'")
        end
      end
    end
  end

  def down
    # Do nothing
  end

  def run_query(sql)
    if ApiMaker::DatabaseType.mysql?
      execute(sql).to_a(as: :hash)
    else
      execute(sql).to_a
    end
  end
end
