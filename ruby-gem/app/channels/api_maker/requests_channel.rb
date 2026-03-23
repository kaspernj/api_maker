require "digest"

class ApiMaker::RequestsChannel < ApplicationCable::Channel
  def subscribed; end

  def execute(data)
    fingerprint = request_fingerprint(data)
    request_uid = data["request_uid"].presence || "legacy-request-#{fingerprint}-#{data.fetch("request_id")}"
    request_registration = ApiMaker::RequestsRegistry.register_request(
      channel: self,
      request_fingerprint: fingerprint,
      request_id: data.fetch("request_id"),
      request_uid:
    )

    transmit_received(data.fetch("request_id"))

    if request_registration.fetch(:response_payload)
      transmit_request_payload(request_id: data.fetch("request_id"), response_payload: request_registration.fetch(:response_payload))
      return
    end

    return unless request_registration.fetch(:start_execution)

    response = ApiMaker::CommandRequestExecutor.execute!(
      controller: request_context(data, request_fingerprint: fingerprint, request_uid:),
      payload: data.fetch("request")
    )
    response_payload = {
      response:,
      type: "api_maker_request_response"
    }

    ApiMaker::RequestsRegistry.complete_request(request_uid:, response_payload:, status: :completed)
    transmit_request_payloads(request_uid:, response_payload:)
  rescue => e # rubocop:disable Style/RescueStandardError
    response_payload = {
      response: {errors: [{message: e.message, type: :runtime_error}], success: false},
      type: "api_maker_request_error"
    }

    ApiMaker::RequestsRegistry.complete_request(request_uid:, response_payload:, status: :failed) if request_uid
    transmit_request_payloads(request_uid:, response_payload:) if request_uid
    raise e
  end

  def unsubscribed
    ApiMaker::RequestsRegistry.unregister_channel(self)
  end

  def transmit_command_event(command_id:, payload:, request_uid:, type:)
    ApiMaker::RequestsRegistry.request_subscriptions(request_uid:).each do |request_subscription|
      request_subscription.fetch(:request_ids).each do |request_id|
        request_subscription.fetch(:channel).transmit(
          {
            command_id:,
            request_id:,
            type:
          }.merge(payload)
        )
      end
    end
  end

private

  def request_context(data, request_fingerprint:, request_uid:)
    ApiMaker::ActionCableRequestContext.new(
      api_maker_args: {current_user:}.merge((data["global"] || {}).symbolize_keys),
      channel: self,
      request_fingerprint:,
      request_uid:
    )
  end

  def request_fingerprint(data)
    Digest::SHA256.hexdigest(
      JSON.generate(
        global: data["global"],
        request: data.fetch("request")
      )
    )
  end

  def transmit_received(request_id)
    transmit(
      {
        request_id:,
        type: "api_maker_request_received"
      }
    )
  end

  def transmit_response(request_id, response)
    transmit(
      {
        request_id:,
        response:,
        type: "api_maker_request_response"
      }
    )
  end

  def transmit_request_payload(request_id:, response_payload:)
    transmit(
      {
        request_id:
      }.merge(response_payload)
    )
  end

  def transmit_request_payloads(request_uid:, response_payload:)
    ApiMaker::RequestsRegistry.request_subscriptions(request_uid:).each do |request_subscription|
      request_subscription.fetch(:request_ids).each do |request_id|
        request_subscription.fetch(:channel).transmit_request_payload(request_id:, response_payload:)
      end
    end
  end
end
