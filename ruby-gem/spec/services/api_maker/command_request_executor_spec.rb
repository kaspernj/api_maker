require "rails_helper"

describe ApiMaker::CommandRequestExecutor do
  let(:api_maker_args) do
    {
      current_user:,
      layout: "user"
    }
  end
  let(:current_user) { create(:user) }
  let(:ability) { ApiMaker::Ability.new(api_maker_args:) }
  let(:controller) do
    instance_double(
      ApiMaker::ActionCableRequestContext,
      api_maker_args:,
      current_ability: ability
    )
  end

  it "executes collection commands through the shared request payload" do
    expect(controller).to receive(:with_request_context).and_yield

    response = described_class.execute!(
      controller:,
      payload: {
        "pool" => {
          "collection" => {
            "tasks" => {
              "test_collection" => {
                "1" => {
                  "args" => {},
                  "id" => 1
                }
              }
            }
          }
        }
      }
    )

    expect(response).to include(:responses)
    expect(response.fetch(:responses).fetch("1")).to include(type: :success)
    expect(response.fetch(:responses).fetch("1").fetch(:data)).to include(
      test_collection_command_called: true
    )
    expect(response.fetch(:responses).fetch("1").dig(:data, :api_maker_args, :layout)).to eq("user")
  end

  it "wraps websocket command args in action controller parameters" do
    expect(controller).to receive(:with_request_context).and_yield

    response = described_class.execute!(
      controller:,
      payload: {
        "pool" => {
          "collection" => {
            "projects" => {
              "create_project" => {
                "1" => {
                  "args" => {
                    "project" => {
                      "account_id" => create(:account).id,
                      "name" => "Websocket project"
                    }
                  },
                  "id" => 1
                }
              }
            }
          }
        }
      }
    )

    expect(response.fetch(:responses).fetch("1")).to include(type: :success)
    expect(Project.find_by!(name: "Websocket project")).to be_present
  end

  it "runs execution inside the controller request context" do
    expect(controller).to receive(:with_request_context).and_yield

    described_class.execute!(
      controller:,
      payload: {
        "pool" => {
          "collection" => {
            "tasks" => {
              "test_collection" => {
                "1" => {
                  "args" => {},
                  "id" => 1
                }
              }
            }
          }
        }
      }
    )
  end

  it "transmits command progress and log events through current_command" do
    expect(controller).to receive(:with_request_context).and_yield
    expect(controller).to receive(:transmit_command_event).with(
      command_id: "1",
      payload: {total: 4},
      type: "api_maker_command_progress"
    )
    expect(controller).to receive(:transmit_command_event).with(
      command_id: "1",
      payload: {count: 1, progress: 0.25, total: 4},
      type: "api_maker_command_progress"
    )
    expect(controller).to receive(:transmit_command_event).with(
      command_id: "1",
      payload: {message: "Started"},
      type: "api_maker_command_log"
    )
    expect(controller).to receive(:transmit_command_event).with(
      command_id: "1",
      payload: {count: 1, progress: 0.5, total: 4},
      type: "api_maker_command_progress"
    )
    expect(controller).to receive(:transmit_command_event).with(
      command_id: "1",
      payload: {count: 2, progress: 0.5, total: 4},
      type: "api_maker_command_progress"
    )

    response = described_class.execute!(
      controller:,
      payload: {
        "pool" => {
          "service" => {
            "calls" => {
              "services" => {
                "1" => {
                  "args" => {
                    "service_args" => {},
                    "service_name" => "CommandProgressTest"
                  },
                  "id" => 1
                }
              }
            }
          }
        }
      }
    )

    expect(response.fetch(:responses).fetch("1").fetch(:data)).to include(current_command_present: true)
  end
end
