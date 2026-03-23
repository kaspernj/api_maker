class ApiMaker::RequestsRegistry
  ENTRY_TTL = 5.minutes

  class << self
    def clear!
      mutex.synchronize do
        @entries = {}
      end
    end

    def complete_request(request_uid:, response_payload:, status:)
      mutex.synchronize do
        cleanup_expired_entries!

        entry = entries.fetch(request_uid)
        entry[:response_payload] = response_payload
        entry[:status] = status
        entry[:touched_at] = Time.current
      end
    end

    def register_request(channel:, request_fingerprint:, request_id:, request_uid:)
      mutex.synchronize do
        cleanup_expired_entries!

        entry = entries[request_uid]

        if entry
          raise "Request fingerprint mismatch for request UID: #{request_uid}" if entry.fetch(:request_fingerprint) != request_fingerprint
        else
          entry = {
            command_events: [],
            execution_started: false,
            next_command_event_sequence: 1,
            request_fingerprint:,
            request_subscriptions: {}.compare_by_identity,
            response_payload: nil,
            status: :pending,
            touched_at: Time.current
          }
          entries[request_uid] = entry
        end

        entry[:touched_at] = Time.current
        register_request_subscription(entry:, channel:, request_id:)

        start_execution = !entry.fetch(:execution_started) && entry[:status] == :pending && entry[:response_payload].nil?
        entry[:execution_started] = true if start_execution

        {
          command_events: command_events_since(
            entry:,
            last_command_event_sequence: channel_last_command_event_sequence(channel:, request_id:)
          ),
          response_payload: entry[:response_payload],
          start_execution:
        }
      end
    end

    def record_command_event(command_id:, payload:, request_uid:, type:)
      mutex.synchronize do
        cleanup_expired_entries!

        entry = entries[request_uid]
        return unless entry

        event = {
          command_event_sequence: entry.fetch(:next_command_event_sequence),
          command_id:,
          payload:,
          type:
        }

        entry[:next_command_event_sequence] += 1
        entry[:command_events] << event
        entry[:touched_at] = Time.current

        event
      end
    end

    def request_subscriptions(request_uid:)
      mutex.synchronize do
        cleanup_expired_entries!

        entry = entries[request_uid]
        next [] unless entry

        entry[:touched_at] = Time.current

        entry.fetch(:request_subscriptions).values.map do |request_subscription|
          {
            channel: request_subscription.fetch(:channel),
            request_ids: request_subscription.fetch(:request_ids).dup
          }
        end
      end
    end

    def unregister_channel(channel)
      mutex.synchronize do
        cleanup_expired_entries!

        entries.each_value do |entry|
          entry.fetch(:request_subscriptions).delete(channel)
        end
      end
    end

  private

    def cleanup_expired_entries!
      expires_before = Time.current - ENTRY_TTL

      entries.delete_if do |_request_uid, entry|
        entry.fetch(:touched_at) < expires_before
      end
    end

    def entries
      @entries ||= {}
    end

    def mutex
      @mutex ||= Mutex.new
    end

    def channel_last_command_event_sequence(channel:, request_id:)
      return 0 unless channel.respond_to?(:last_command_event_sequence_for_request_id)

      channel.last_command_event_sequence_for_request_id(request_id)
    end

    def command_events_since(entry:, last_command_event_sequence:)
      entry.fetch(:command_events)
        .select { |command_event| command_event.fetch(:command_event_sequence) > last_command_event_sequence }
        .map(&:dup)
    end

    def register_request_subscription(entry:, channel:, request_id:)
      request_subscription = entry.fetch(:request_subscriptions)[channel]

      unless request_subscription
        request_subscription = {
          channel:,
          request_ids: []
        }
        entry.fetch(:request_subscriptions)[channel] = request_subscription
      end

      request_subscription.fetch(:request_ids) << request_id unless request_subscription.fetch(:request_ids).include?(request_id)
    end
  end
end
