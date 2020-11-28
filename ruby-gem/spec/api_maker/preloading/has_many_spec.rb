require "rails_helper"

describe "preloading - has many" do
  let(:account) { create :account }
  let(:project) { create :project, account: account }
  let(:task) { create :task, project: project, user: user }

  let(:other_task) { create :task }

  let(:user) { create :user }
  let(:user_ability) { ApiMaker::Ability.new(args: {current_user: user}) }

  it "adds joins and exists if the user has ability with no conditions" do
    collection = Account.where(id: account.id)
    reflection = Account.reflections.fetch("project_tasks")

    expect(user_ability.can?(:read, task)).to eq true
    expect(user_ability.can?(:read, other_task)).to eq false

    preloader = ApiMaker::PreloaderHasOne.new(
      ability: user_ability,
      args: {},
      collection: collection,
      data: {},
      locals: {},
      records: collection.to_a,
      reflection: reflection,
      select: nil,
      select_columns: nil
    )

    sql = preloader.join_query.to_sql

    expect(preloader.models).to eq [task]
    expect(sql).to include "JOIN tasks AS accessible_table ON accessible_table.id = tasks.id"
    expect(sql).to include '(EXISTS (SELECT 1 FROM "tasks" WHERE "tasks"."user_id" = 1 AND (tasks.id = accessible_table.id)))'
  end

  it "doesnt add joins and exists if the user has ability with no conditions" do
    user.update!(admin: true)
    collection = Account.where(id: account.id)
    reflection = Account.reflections.fetch("project_tasks")

    expect(user_ability.can?(:read, task)).to eq true
    expect(user_ability.can?(:read, other_task)).to eq true

    preloader = ApiMaker::PreloaderHasOne.new(
      ability: user_ability,
      args: {},
      collection: collection,
      data: {},
      locals: {},
      records: collection.to_a,
      reflection: reflection,
      select: nil,
      select_columns: nil
    )

    sql = preloader.join_query.to_sql

    expect(preloader.models).to eq [task]
    expect(sql).not_to include "JOIN tasks AS accessible_table ON accessible_table.id = tasks.id"
    expect(sql).not_to include "EXISTS"
  end
end
