require "rails_helper"

# Regression for the production PG::GroupingError. An index command that
# groups the collection (e.g. `group_by: "id"` to de-duplicate rows produced
# by joins) and sorts on a column of a joined table emits a GROUP BY on the
# primary key plus an ORDER BY on the joined column. The pagination `meta.count`
# was computed from a relation that still carried that ORDER BY while keeping
# the GROUP BY:
#
#   SELECT COUNT(...) ... GROUP BY "tasks"."id" ORDER BY "projects"."name"
#
# PostgreSQL rejects ordering by a column that is neither grouped nor
# aggregated (PG::GroupingError). The main collection query is safe because
# active_record_query_fixer expands the GROUP BY; the count path does not run
# that fix, so the ORDER BY must be dropped before counting.
#
# This drives ApiMaker::IndexCommand with the same shape and asserts the
# grouped count query no longer carries the ORDER BY. It runs on SQLite (the
# count query executes fine there, so the assertion on the emitted SQL is what
# pins the behaviour).
describe "ApiMaker::CollectionLoader grouped pagination count" do
  let(:ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }
  let(:api_maker_args) { {current_user: user} }
  # rubocop:disable RSpec/VerifiedDoubles -- same controller double as index_command_spec.rb
  let(:controller) { double(api_maker_args:, current_ability: ability, current_user: user) }
  # rubocop:enable RSpec/VerifiedDoubles
  let(:helper) do
    ApiMaker::CommandSpecHelper.new(
      collection: Task.accessible_by(ability).joins(:project).order("projects.name"),
      command: ApiMaker::IndexCommand,
      controller:
    )
  end

  let!(:user) { create :user }
  let!(:project) { create :project, name: "Alpha" }
  # user: scopes the task in (ApiMaker::Ability authorizes the user's own tasks)
  let!(:task) { create :task, project:, user: }

  it "does not carry the joined-column ORDER BY into the grouped count query" do
    executed_sql = []
    subscriber = ActiveSupport::Notifications.subscribe("sql.active_record") do |_name, _start, _finish, _id, payload|
      executed_sql << payload[:sql]
    end

    parsed = nil
    begin
      command = helper.add_command(args: {group_by: ["id"], page: 1})
      helper.execute!
      parsed = command.result
    ensure
      ActiveSupport::Notifications.unsubscribe(subscriber)
    end

    # Pagination meta was computed, so the grouped count query actually ran.
    expect(parsed.dig(:meta, :count)).to eq 1
    expect(parsed.dig(:meta, :totalPages)).to eq 1
    expect(parsed.dig(:meta, :totalCount)).to eq 1
    expect(parsed.dig!(:collection, "data", "tasks")).to eq [task.id]

    grouped_count_queries = executed_sql.select { |sql| sql.match?(/COUNT\s*\(/i) && sql.match?(/GROUP BY/i) }
    expect(grouped_count_queries).not_to be_empty
    grouped_count_queries.each do |sql|
      expect(sql).not_to include("ORDER BY")
    end
  end
end
