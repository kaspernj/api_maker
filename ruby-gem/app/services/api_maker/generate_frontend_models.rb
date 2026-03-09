class ApiMaker::GenerateFrontendModels < ApiMaker::ApplicationService # rubocop:disable Metrics/ClassLength
  FRONTEND_MODELS_PATHS_ENV_KEY = "API_MAKER_FRONTEND_MODELS_PATHS".freeze

  attr_reader :path

  def initialize(path: nil)
    @path = path
  end

  def perform
    models_paths.each do |models_path|
      FileUtils.mkdir_p(models_path)

      resources.each do |resource|
        model_content = ApiMaker::ModelContentGeneratorService.execute!(resource:)
        file_path = models_path.join("#{model_content.dig(:model_class_data, :nameDasherized)}.js")

        File.write(file_path, model_file_content(model_content:, resource:))
      end

      File.write(models_index_path(models_path), models_index_content)
    end

    succeed!
  end

private

  def env_models_paths
    ENV.fetch(FRONTEND_MODELS_PATHS_ENV_KEY, "")
      .split(File::PATH_SEPARATOR)
      .map(&:strip)
      .compact_blank
      .uniq
  end

  def models_paths
    @models_paths ||= begin
      output_paths = env_models_paths
      output_paths = [path] if output_paths.blank? && path.present?
      output_paths = [Rails.root.join("app/javascript/models")] if output_paths.blank?
      output_paths.map { |output_path| Pathname(output_path) }
    end
  end

  def resources
    @resources ||= ApiMaker::ModelsFinderService.execute!
  end

  def models_index_path(models_path)
    models_path.join("../models.js").cleanpath
  end

  def models_index_content
    lines = []
    model_names = resources.map(&:short_name)

    resources.each do |resource|
      file_name = resource.short_name.underscore.dasherize
      lines << "import #{resource.short_name} from \"models/#{file_name}.js\""
    end

    lines << ""
    lines << "export {"
    model_names.each do |model_name|
      lines << "  #{model_name},"
    end
    lines << "}"
    lines << ""
    lines.join("\n")
  end

  def model_file_content(model_content:, resource:) # rubocop:disable Metrics/AbcSize
    model_class_name = resource.short_name
    attributes = model_content.fetch(:attributes)
    relationships = model_content.fetch(:relationships)
    collection_commands = model_content.fetch(:collection_commands)
    member_commands = model_content.fetch(:member_commands)
    model_class_data_json = JSON.pretty_generate(model_content.fetch(:model_class_data))

    lines = []
    lines << "import BaseModel from \"@kaspernj/api-maker/build/base-model.js\""
    if relationships.values.any? { |relationship| relationship[:type] == :has_many }
      lines << "import Collection from \"@kaspernj/api-maker/build/collection.js\""
    end
    lines << "import modelClassRequire from \"@kaspernj/api-maker/build/model-class-require.js\"" if relationships.any?
    lines << ""
    lines << "const modelClassData = #{model_class_data_json}"
    lines << ""
    lines << "/** Frontend model for #{model_class_name}. */"
    lines << "class #{model_class_name} extends BaseModel {"
    lines << "  /** @returns {Record<string, any>} */"
    lines << "  static modelClassData() {"
    lines << "    return modelClassData"
    lines << "  }"
    lines.concat(static_method_lines(model_class_name:))
    lines.concat(attribute_method_lines(attributes))
    lines.concat(collection_command_lines(collection_commands, model_content))
    lines.concat(member_command_lines(member_commands, model_content))
    lines.concat(relationship_method_lines(relationships:, model_content:))
    lines << "}"
    lines << ""
    lines << "export default #{model_class_name}"
    lines << ""

    lines.join("\n")
  end

  def resource_by_short_name
    @resource_by_short_name ||= resources.index_by(&:short_name)
  end

  def attribute_method_lines(attributes)
    attributes.values.flat_map do |attribute_data|
      attribute_name = attribute_data.fetch(:name).to_s
      method_name = js_method_name(attribute_name)
      has_method_name = js_method_name("has_#{attribute_name}")
      attribute_type = attribute_jsdoc_type(attribute_data)

      [
        "",
        "  /** @returns {#{attribute_type}} */",
        "  #{method_name}() {",
        "    return this.readAttributeUnderscore(\"#{attribute_name}\")",
        "  }",
        "",
        "  /** @returns {boolean} */",
        "  #{has_method_name}() {",
        "    const value = this.#{method_name}()",
        "",
        "    return this._isPresent(value)",
        "  }"
      ]
    end
  end

  def static_method_lines(model_class_name:)
    [
      "",
      "  /**",
      "   * @param {Record<string, any>} [query]",
      "   * @returns {import(\"@kaspernj/api-maker/build/collection.js\").default<typeof #{model_class_name}>}",
      "   */",
      "  static ransack(query = {}) {",
      "    return super.ransack(query)",
      "  }",
      "",
      "  /**",
      "   * @param {Record<string, any>} [select]",
      "   * @returns {import(\"@kaspernj/api-maker/build/collection.js\").default<typeof #{model_class_name}>}",
      "   */",
      "  static select(select) {",
      "    return super.select(select)",
      "  }"
    ]
  end

  def collection_command_lines(collection_commands, model_content)
    collection_name = model_content.dig(:model_class_data, :collectionName)

    collection_commands.values.flat_map do |command|
      command_name = command.fetch(:name).to_s
      method_name = js_method_name(command_name)

      [
        "",
        "  /**",
        "   * @template TCommandResponse",
        "   * @param {Record<string, any> | HTMLFormElement | FormData} args",
        "   * @param {Record<string, any>} [commandArgs]",
        "   * @returns {Promise<TCommandResponse>}",
        "   */",
        "  static #{method_name}(args, commandArgs = {}) {",
        "    return /** @type {Promise<TCommandResponse>} */ (this._callCollectionCommand(",
        "      {",
        "        args,",
        "        command: \"#{command_name}\",",
        "        collectionName: \"#{collection_name}\",",
        "        type: \"collection\"",
        "      },",
        "      commandArgs",
        "    ))",
        "  }"
      ]
    end
  end

  def member_command_lines(member_commands, model_content)
    collection_name = model_content.dig(:model_class_data, :collectionName)

    member_commands.values.flat_map do |command|
      command_name = command.fetch(:name).to_s
      method_name = js_method_name(command_name)

      [
        "",
        "  /**",
        "   * @template TCommandResponse",
        "   * @param {Record<string, any> | HTMLFormElement | FormData} args",
        "   * @param {Record<string, any>} [commandArgs]",
        "   * @returns {Promise<TCommandResponse>}",
        "   */",
        "  #{method_name}(args, commandArgs = {}) {",
        "    return /** @type {Promise<TCommandResponse>} */ (this._callMemberCommand(",
        "      {",
        "        args,",
        "        command: \"#{command_name}\",",
        "        primaryKey: this.primaryKey(),",
        "        collectionName: \"#{collection_name}\",",
        "        type: \"member\"",
        "      },",
        "      commandArgs",
        "    ))",
        "  }"
      ]
    end
  end

  def relationship_method_lines(relationships:, model_content:)
    relationships.flat_map do |relationship_key_name, relationship|
      case relationship.fetch(:type).to_s
      when "belongs_to"
        belongs_to_relationship_method_lines(relationship:, relationship_key_name:)
      when "has_many"
        build_has_many_relationship_method_lines(relationship:, model_content:, relationship_key_name:)
      when "has_one"
        build_has_one_relationship_method_lines(relationship:, model_content:, relationship_key_name:)
      else
        raise "Unknown relationship type: #{relationship.fetch(:type)}"
      end
    end
  end

  def belongs_to_relationship_method_lines(relationship:, relationship_key_name:)
    relationship_name = relationship_key_name.to_s
    method_name = js_method_name(relationship_name)
    related_model_jsdoc_type = relationship_jsdoc_type(relationship)
    load_method_name = js_method_name("load_#{relationship_name}")
    foreign_key_method_name = js_method_name(relationship.fetch(:foreign_key))
    options_primary_key = relationship.dig(:options, :primary_key)
    klass_primary_key = relationship.dig(:klass, :primary_key)
    ransack_key = "#{options_primary_key || klass_primary_key}_eq"
    related_model_resource_name = relationship.fetch(:resource_name)

    [
      "",
      "  /** @returns {#{related_model_jsdoc_type} | null} */",
      "  #{method_name}() {",
      "    return this._readBelongsToReflection({reflectionName: \"#{relationship_name}\"})",
      "  }",
      "",
      "  /** @returns {Promise<#{related_model_jsdoc_type} | null>} */",
      "  #{load_method_name}() {",
      "    if (!(\"#{foreign_key_method_name}\" in this)) throw new Error(\"Foreign key method wasn't defined: #{foreign_key_method_name}\")",
      "",
      "    const id = this.#{foreign_key_method_name}()",
      "    const modelClass = modelClassRequire(\"#{related_model_resource_name}\")",
      "    const ransack = {}",
      "",
      "    ransack[\"#{ransack_key}\"] = id",
      "",
      "    return this._loadBelongsToReflection(",
      "      {reflectionName: \"#{relationship_name}\", model: this, modelClass},",
      "      {ransack}",
      "    )",
      "  }"
    ]
  end

  def build_has_many_relationship_method_lines(relationship:, model_content:, relationship_key_name:) # rubocop:disable Metrics/MethodLength
    relationship_name = relationship_key_name.to_s
    method_name = js_method_name(relationship_name)
    load_method_name = js_method_name("load_#{relationship_name}")
    related_model_jsdoc_type = relationship_jsdoc_type(relationship)
    active_record_name = relationship.dig(:active_record, :name)
    class_name = relationship.fetch(:class_name)
    foreign_key = relationship.fetch(:foreign_key)
    options_as = relationship.dig(:options, :as)
    options_primary_key = relationship.dig(:options, :primary_key)
    options_through = relationship.dig(:options, :through)
    model_primary_key = model_content.dig(:model_class_data, :primaryKey)
    primary_key_method_name = js_method_name(options_primary_key || model_primary_key)
    related_model_resource_name = relationship.fetch(:resource_name)

    lines = [
      "",
      "  /** @returns {import(\"@kaspernj/api-maker/build/collection.js\").default<typeof #{related_model_jsdoc_type}>} */",
      "  #{method_name}() {"
    ]

    if options_through
      lines.push(

        "    const modelClass = modelClassRequire(\"#{related_model_resource_name}\")",
        "",
        "    return new Collection(",
        "      {",
        "        reflectionName: \"#{relationship_key_name}\",",
        "        model: this,",
        "        modelName: \"#{class_name}\",",
        "        modelClass",
        "      },",
        "      {",
        "        params: {",
        "          through: {",
        "            model: \"#{active_record_name}\",",
        "            id: this.primaryKey(),",
        "            reflection: \"#{relationship_name}\"",
        "          }",
        "        }",
        "      }",
        "    )"

      )
    else
      lines.push(

        "    if (!(\"#{primary_key_method_name}\" in this)) throw new Error(\"No such primary key method: #{primary_key_method_name}\")",
        "",
        "    const modelClass = modelClassRequire(\"#{related_model_resource_name}\")",
        "",
        "    const ransack = {}",
        "",
        "    ransack[\"#{foreign_key}_eq\"] = this.#{primary_key_method_name}()"

      )
      lines << "    ransack[\"#{options_as}_type_eq\"] = \"#{active_record_name}\"" if options_as
      lines.push(

        "",
        "    return new Collection(",
        "      {",
        "        reflectionName: \"#{relationship_key_name}\",",
        "        model: this,",
        "        modelName: \"#{class_name}\",",
        "        modelClass",
        "      },",
        "      {ransack}",
        "    )"

      )
    end

    lines.push(

      "  }",
      "",
      "  /** @returns {Promise<Array<#{related_model_jsdoc_type}>>} */",
      "  #{load_method_name}() {"

    )

    if options_through
      lines.push(

        "    const modelClass = modelClassRequire(\"#{related_model_resource_name}\")",
        "",
        "    return this._loadHasManyReflection(",
        "      {",
        "        reflectionName: \"#{relationship_name}\",",
        "        model: this,",
        "        modelClass",
        "      },",
        "      {",
        "        params: {",
        "          through: {",
        "            model: \"#{model_content.dig(:model_class_data, :className)}\",",
        "            id: this.primaryKey(),",
        "            reflection: \"#{relationship_name}\"",
        "          }",
        "        }",
        "      }",
        "    )"

      )
    else
      lines.push(

        "    if (!(\"#{primary_key_method_name}\" in this)) throw new Error(\"No such primary key method: #{primary_key_method_name}\")",
        "",
        "    const modelClass = modelClassRequire(\"#{related_model_resource_name}\")",
        "",
        "    const ransack = {}",
        "",
        "    ransack[\"#{foreign_key}_eq\"] = this.#{primary_key_method_name}()"
      )
      lines << "    ransack[\"#{options_as}_type_eq\"] = \"#{active_record_name}\"" if options_as
      lines.push(

        "",
        "    return this._loadHasManyReflection(",
        "      {",
        "        reflectionName: \"#{relationship_name}\",",
        "        model: this,",
        "        modelClass",
        "      },",
        "      {ransack}",
        "    )"

      )
    end

    lines << "  }"
    lines
  end

  def build_has_one_relationship_method_lines(relationship:, model_content:, relationship_key_name:) # rubocop:disable Metrics/MethodLength
    relationship_name = relationship_key_name.to_s
    method_name = js_method_name(relationship_name)
    load_method_name = js_method_name("load_#{relationship_name}")
    related_model_jsdoc_type = relationship_jsdoc_type(relationship)
    active_record_primary_key = relationship.dig(:active_record, :primary_key)
    foreign_key = relationship.fetch(:foreign_key)
    options_through = relationship.dig(:options, :through)
    primary_key_method_name = js_method_name(active_record_primary_key)
    related_model_resource_name = relationship.fetch(:resource_name)

    lines = [
      "",
      "  /** @returns {#{related_model_jsdoc_type} | null} */",
      "  #{method_name}() {",
      "    return this._readHasOneReflection({reflectionName: \"#{relationship_name}\"})",
      "  }",
      "",
      "  /** @returns {Promise<#{related_model_jsdoc_type} | null>} */",
      "  #{load_method_name}() {",
      "    if (!(\"#{primary_key_method_name}\" in this)) throw new Error(\"Primary key method wasn't defined: #{primary_key_method_name}\")",
      "",
      "    const id = this.#{primary_key_method_name}()",
      "    const modelClass = modelClassRequire(\"#{related_model_resource_name}\")"
    ]

    if options_through
      lines.push(

        "",
        "    return this._loadHasOneReflection(",
        "      {reflectionName: \"#{relationship_name}\", model: this, modelClass},",
        "      {",
        "        params: {",
        "          through: {",
        "            model: \"#{model_content.dig(:model_class_data, :className)}\",",
        "            id,",
        "            reflection: \"#{relationship_name}\"",
        "          }",
        "        }",
        "      }",
        "    )"

      )
    else
      lines.push(

        "    const ransack = {}",
        "",
        "    ransack[\"#{foreign_key}_eq\"] = id",
        "",
        "    return this._loadHasOneReflection(",
        "      {",
        "        reflectionName: \"#{relationship_name}\",",
        "        model: this,",
        "        modelClass",
        "      },",
        "      {ransack}",
        "    )"

      )
    end

    lines << "  }"
    lines
  end

  def relationship_jsdoc_type(relationship)
    relationship_resource_name = relationship.fetch(:resource_name)
    relationship_resource = resource_by_short_name.fetch(relationship_resource_name)
    relationship_file_name = relationship_resource.short_name.underscore.dasherize

    "import(\"./#{relationship_file_name}.js\").default"
  end

  def attribute_jsdoc_type(attribute_data)
    column_data = attribute_data[:column]
    return "string | null" if !column_data && attribute_data[:translated]
    return "any" unless column_data

    base_type = jsdoc_type_for_db_column(column_data.fetch(:type).to_s)
    return "#{base_type} | null" if column_data[:null]

    base_type
  end

  def jsdoc_type_for_db_column(type)
    case type
    when "bigint", "decimal", "float", "integer"
      "number"
    when "boolean"
      "boolean"
    when "binary", "citext", "date", "datetime", "inet", "string", "text", "time", "timestamp", "uuid"
      "string"
    when "json", "jsonb", "hstore"
      "Record<string, any> | Array<any>"
    else
      "any"
    end
  end

  def js_method_name(name)
    ApiMaker::JsMethodNamerService.execute!(name:)
  end
end
