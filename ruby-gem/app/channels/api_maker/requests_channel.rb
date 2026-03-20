require "digest"

class ApiMaker::RequestsChannel < ApplicationCable::Channel
  def subscribed
    @request_cache = {}
    @request_cache_order = []
    @pending_request_ids_by_fingerprint = {}
  end

  def execute(data)
    fingerprint = nil
    fingerprint = request_fingerprint(data)
    request_ids = @pending_request_ids_by_fingerprint[fingerprint]

    if request_ids
      transmit_received(data.fetch("request_id"))
      request_ids << data.fetch("request_id")
      return
    end

    cached_response = @request_cache[fingerprint]

    if cached_response
      transmit_received(data.fetch("request_id"))
      transmit_response(data.fetch("request_id"), cached_response)
      return
    end

    @pending_request_ids_by_fingerprint[fingerprint] = [data.fetch("request_id")]
    transmit_received(data.fetch("request_id"))

    response = ApiMaker::CommandRequestExecutor.execute!(
      controller: request_context(data, request_fingerprint: fingerprint),
      payload: data.fetch("request")
    )

    cache_response(fingerprint, response) if data["cache_response"]
    pending_request_ids(fingerprint).each do |request_id|
      transmit_response(request_id, response)
    end
  rescue => e # rubocop:disable Style/RescueStandardError
    pending_request_ids(fingerprint).each do |request_id|
      transmit(
        {
          request_id:,
          response: {errors: [{message: e.message, type: :runtime_error}], success: false},
          type: "api_maker_request_error"
        }
      )
    end

    raise e
  end

  def unsubscribed
    @request_cache = nil
    @request_cache_order = nil
    @pending_request_ids_by_fingerprint = nil
  end

private

  def cache_response(fingerprint, response)
    @request_cache[fingerprint] = response
    @request_cache_order << fingerprint

    return unless @request_cache_order.length > 100

    oldest_fingerprint = @request_cache_order.shift
    @request_cache.delete(oldest_fingerprint)
  end

  def pending_request_ids(fingerprint)
    @pending_request_ids_by_fingerprint.delete(fingerprint) || []
  end

  def request_context(data, request_fingerprint:)
    ApiMaker::ActionCableRequestContext.new(
      api_maker_args: {current_user:}.merge((data["global"] || {}).symbolize_keys),
      channel: self,
      request_fingerprint:
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

  def transmit_command_event(command_id:, payload:, request_fingerprint:, type:)
    request_ids = @pending_request_ids_by_fingerprint[request_fingerprint] || []

    request_ids.each do |request_id|
      transmit(
        {
          command_id:,
          request_id:,
          type:
        }.merge(payload)
      )
    end
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
end
