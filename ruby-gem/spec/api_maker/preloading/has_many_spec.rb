require "rails_helper"

describe "preloading - has many" do
  let(:account) { create :account }
  let(:project) { create :project, account: }
  let(:task) { create :task, project:, user: }

  let(:other_task) { create :task }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(api_maker_args: {current_user: user}) }

  it "adds joins and exists if the user has ability with no conditions" do
    collection = Account.where(id: account.id)
    reflection = Account.reflections.fetch("project_tasks")

    expect(user_ability.can?(:read, task)).to be true
    expect(user_ability.can?(:read, other_task)).to be false

    preloader = ApiMaker::PreloaderHasOne.new(
      ability: user_ability,
      api_maker_args: {},
      collection:,
      data: {},
      locals: {},
      records: collection.to_a,
      reflection:,
      select: nil,
      select_columns: nil
    )

    sql = preloader.join_query.to_sql

    expect(preloader.models).to eq [task]
    expect(sql).to include "JOIN tasks AS accessible_table ON accessible_table.id = tasks.id"
    expect(sql).to include "EXISTS (SELECT 1 FROM \"tasks\" WHERE ((" \
                           "EXISTS (SELECT 1 FROM account_marked_tasks WHERE account_marked_tasks.task_id = tasks.id AND (account_marked_tasks.id = 5))) OR " \
                           "((tasks.name = 'Some readable task') OR (\"tasks\".\"user_id\" = 1))) AND (tasks.id = accessible_table.id)"
  end

  it "doesnt add joins and exists if the user has ability with no conditions" do
    user.update!(admin: true)
    collection = Account.where(id: account.id)
    reflection = Account.reflections.fetch("project_tasks")

    expect(user_ability.can?(:read, task)).to be true
    expect(user_ability.can?(:read, other_task)).to be true

    preloader = ApiMaker::PreloaderHasOne.new(
      ability: user_ability,
      api_maker_args: {},
      collection:,
      data: {},
      locals: {},
      records: collection.to_a,
      reflection:,
      select: nil,
      select_columns: nil
    )

    sql = preloader.join_query.to_sql

    expect(preloader.models).to eq [task]
    expect(sql).not_to include "JOIN tasks AS accessible_table ON accessible_table.id = tasks.id"
    expect(sql).not_to include "EXISTS"
  end

  describe "#preload_model" do
    # This can happen if the same model is preloaded under different paths like so
    # .preload([
    #   "photo_sheet_product_sheet_layouts.sheet_layout.boxes",
    #   "sheet_layout.boxes"
    # ])
    it "doesnt preload the same model multiple times" do
      user.update!(admin: true)
      collection = Project.where(id: project.id)
      reflection = Project.reflections.fetch("tasks")

      expect(user_ability.can?(:read, task)).to be true
      expect(user_ability.can?(:read, other_task)).to be true

      data = {
        preloaded: {}
      }

      records = {
        "projects" => {
          project.id => {
            r: {}
          }
        }
      }

      preloader = ApiMaker::PreloaderHasMany.new(
        ability: user_ability,
        api_maker_args: {},
        collection:,
        data:,
        locals: {},
        records:,
        reflection:,
        select: nil,
        select_columns: nil
      )

      allow(task).to receive(:[]).with(:api_maker_origin_id).and_return(project.id).at_least(:once)

      preloader.__send__(:preload_model, task)
      preloader.__send__(:preload_model, task)
      preloader.__send__(:preload_model, task)

      preloaded_task_ids_for_project = records.dig!("projects", project.id, :r, :tasks)

      expect(preloaded_task_ids_for_project).to eq [task.id]
    end
  end
end
