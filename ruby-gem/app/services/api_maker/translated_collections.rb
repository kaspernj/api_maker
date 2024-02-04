class ApiMaker::TranslatedCollections
  class InvalidCollectionValueError < RuntimeError; end

  def self.add(allow_blank:, blk:, collection_name:, helper_methods:, helper_methods_prepend: false, model_class:) # rubocop:disable Metrics/AbcSize
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
    inverted_translated_collection_name = "translated_#{plural_name}_inverted"
    collection_values_as_strings = collection_values.map(&:to_s)

    add_helper_methods(model_class, collection_name, collection_values_as_strings, helper_methods_prepend) if helper_methods
    add_translated_collection_method(model_class, plural_name, collections)
    add_translated_inverted_collection_method(model_class, inverted_translated_collection_name, collections)
    add_query_values_method(model_class, plural_name, collection_values)
    add_translated_method(model_class, collection_name, inverted_translated_collection_name)
    add_with_scope(model_class, collection_name, plural_name, collection_values_as_strings)
    add_without_scope(model_class, collection_name, plural_name, collection_values_as_strings)

    model_class.validates collection_name, allow_blank: allow_blank, inclusion: {in: collection_values}
  end

  def self.add_helper_methods(model_class, collection_name, collection_values_as_strings, helper_methods_prepend)
    methods = model_class.methods

    collection_values_as_strings.each do |value|
      method_name = if helper_methods_prepend
        :"#{collection_name}_#{value}?"
      else
        :"#{value}?"
      end

      raise "Helper method #{method_name} is already defined on #{model_class.name}" if methods.include?(method_name)

      model_class.define_method(method_name) do
        __send__(collection_name) == value
      end
    end
  end

  def self.add_with_scope(model_class, collection_name, plural_name, collection_values_as_strings)
    model_class.scope "with_#{plural_name}".to_sym, lambda { |*options|
      # Check that options are valid
      options.each do |option|
        raise InvalidCollectionValueError, "Invalid option for #{collection_name}: #{option}" if collection_values_as_strings.exclude?(option.to_s)
      end

      where(collection_name => options)
    }
  end

  def self.add_without_scope(model_class, collection_name, plural_name, collection_values_as_strings)
    model_class.scope "without_#{plural_name}".to_sym, lambda { |*options|
      # Check that options are valid
      options.each do |option|
        raise InvalidCollectionValueError, "Invalid option for #{collection_name}: #{option}" if collection_values_as_strings.exclude?(option.to_s)
      end

      where.not(collection_name => options)
    }
  end

  def self.add_translated_collection_method(model_class, plural_name, collections)
    model_class.define_singleton_method("translated_#{plural_name}") do
      collections.fetch(I18n.locale.to_s).fetch(:collection)
    end
  end

  def self.add_translated_inverted_collection_method(model_class, inverted_translated_collection_name, collections)
    model_class.define_singleton_method(inverted_translated_collection_name) do
      collections.fetch(I18n.locale.to_s).fetch(:inverted_collection)
    end
  end

  def self.add_query_values_method(model_class, plural_name, collection_values)
    model_class.define_singleton_method(plural_name) do
      collection_values
    end
  end

  def self.add_translated_method(model_class, collection_name, inverted_translated_collection_name)
    model_class.define_method("translated_#{collection_name}") do
      current_value = __send__(collection_name)
      inverted_translated_collection = self.class.__send__(inverted_translated_collection_name)
      inverted_translated_collection[current_value]
    end
  end

  def self.translated_collections
    ApiMaker::Loader.load_models

    @translated_collections ||= {}
    @translated_collections
  end
end
