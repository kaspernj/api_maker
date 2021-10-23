class ApiMaker::TranslatedCollections
  def self.add(blk:, collection_name:, model_class:)
    @translated_collections ||= {}
    collections = {}
    model_class_name = model_class.name
    collection_values = nil

    I18n.available_locales.each do |locale|
      I18n.with_locale(locale) do
        collection = blk.call.freeze
        collections[locale.to_s] = {
          collection: collection,
          collection_array: collection.map { |translation, value| [translation: translation, value: value] }.flatten,
          inverted_collection: collection.invert
        }
        collection_values = collection.values.clone.freeze if collection_values.nil?
      end
    end

    @translated_collections[model_class_name] ||= {}
    @translated_collections[model_class_name][collection_name] ||= collections

    plural_name = collection_name.to_s.pluralize
    translated_collection_name = "translated_#{plural_name}"
    inverted_translated_collection_name = "translated_#{plural_name}_inverted"

    model_class.define_singleton_method(translated_collection_name) do
      collections.fetch(I18n.locale.to_s).fetch(:collection)
    end

    model_class.define_singleton_method(inverted_translated_collection_name) do
      collections.fetch(I18n.locale.to_s).fetch(:inverted_collection)
    end

    model_class.define_singleton_method(plural_name) do
      collection_values
    end

    model_class.define_method("translated_#{collection_name}") do
      current_value = __send__(collection_name)
      inverted_translated_collection = self.class.__send__(inverted_translated_collection_name)
      inverted_translated_collection.fetch(current_value)
    end

    model_class.validates :state, inclusion: {in: collection_values}
  end

  def self.translated_collections
    ApiMaker::Loader.load_models

    @translated_collections ||= {}
    @translated_collections
  end
end
