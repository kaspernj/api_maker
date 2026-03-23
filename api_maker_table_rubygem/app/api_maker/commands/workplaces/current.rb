# frozen_string_literal: true

module Commands
  module Workplaces
    # Returns the current workplace and optional link count.
    class Current < Commands::ApplicationCommand
      def execute!
        workplace = current_workplace
        response = {current: current_workplace_serializer(workplace)}

        response[:links_count] = current_workplace_links_count(workplace) if args&.dig(:links_count)

        succeed!(response)
      end

      private

      def current_workplace_serializer(workplace)
        ApiMaker::CollectionSerializer.new(
          ability: current_ability,
          collection: WorkerPlugins::Workplace.where(id: workplace),
          query_params: args&.dig(:params)
        )
      end

      def current_workplace_links_count(workplace)
        return workplace.workplace_links.ransack(args.dig(:links_count, :ransack)).result.count if workplace.present?
        return 0 if current_user.nil? && current_session_id.blank?

        fail!("Current workplace could not be loaded")
      end
    end
  end
end
