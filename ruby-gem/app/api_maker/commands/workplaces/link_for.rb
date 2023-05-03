class Commands::Workplaces::LinkFor < Commands::ApplicationCommand
  class CollectionInstance < ApiMaker::BaseCollectionInstance
    def links
      @links ||= begin
        links = {}
        optimised_query.each do |link|
          links[link.resource_type] ||= {}
          links[link.resource_type][link.resource_id] = link
        end
        links
      end
    end

    def model_classes_with_ids
      @model_classes_with_ids ||= begin
        result = {}
        commands.each_value do |command_args|
          model_class = command_args.dig("args", "model_class")
          model_id = command_args.dig("args", "model_id")

          result[model_class] ||= []
          result[model_class] << model_id
        end
        result
      end
    end

    def optimised_query
      @optimised_query ||= begin
        query = current_workplace.workplace_links
        or_query = WorkerPlugins::WorkplaceLink.where("0=1")

        model_classes_with_ids.each do |model_class, model_ids|
          or_query = or_query.or(WorkerPlugins::WorkplaceLink.where(resource_type: model_class, resource_id: model_ids))
        end

        query.merge(or_query)
      end
    end
  end

  def execute!
    model_class = args.fetch(:model_class)
    model_id = args.fetch(:model_id)

    succeed!(
      link: collection_instance.links.dig(model_class, model_id.to_s)
    )
  end
end
