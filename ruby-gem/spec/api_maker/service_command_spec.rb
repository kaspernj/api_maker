require "rails_helper"

describe ApiMaker::ServiceCommand do
  let(:command_response) { ApiMaker::CommandResponse.new(controller: nil) }

  it "generates errors" do
    expect_any_instance_of(Services::Devise::SignOut).to receive(:perform) { |service| service.fail!("Hello", type: :test_error) }
    response = ApiMaker::ServiceCommand
      .new(
        ability: nil,
        api_maker_args: nil,
        collection: nil,
        collection_instance: nil,
        command: ApiMaker::IndividualCommand.new(
          id: nil,
          args: {service_args: nil, service_name: "Devise::SignOut"},
          collection: nil,
          command: nil,
          response: command_response
        ),
        commands: nil,
        command_response:,
        controller: nil
      )
      .execute_with_response

    expect(response).to eq(
      type: :failed,
      data: {
        errors: [
          {
            message: "Hello",
            type: :test_error
          }
        ]
      }
    )
  end
end
