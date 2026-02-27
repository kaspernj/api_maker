class ApiMaker::GenerateFrontendModels < ApiMaker::ApplicationService # rubocop:disable Metrics/ClassLength
  attr_reader :path

  def initialize(path: nil)
    @path = path
  end

  def perform
    FileUtils.mkdir_p(models_path)

    resources.each do |resource|
      model_content = ApiMaker::ModelContentGeneratorService.execute!(resource:)
      file_path = models_path.join("#{model_content.dig(:model_class_data, :nameDasherized)}.js")

      File.write(file_path, model_file_content(model_content:, resource:))
    end

    succeed!
  end

private

  def models_path
    @models_path ||= Pathname(path || Rails.root.join("app/javascript/models"))
  end

  def resources
    @resources ||= ApiMaker::ModelsFinderService.execute!
  end

  def model_file_content(model_content:, resource:) # rubocop:disable Metrics/AbcSize
    model_class_name = resource.short_name
    model_file_name = "#{model_content.dig(:model_class_data, :nameDasherized)}.js"
    attributes = model_content.fetch(:attributes)
    relationships = model_content.fetch(:relationships)
    collection_commands = model_content.fetch(:collection_commands)
    member_commands = model_content.fetch(:member_commands)
    model_class_data_json = JSON.pretty_generate(model_content.fetch(:model_class_data))

    lines = []
    lines << "import BaseModel from \"../base-model.js\""
    lines << "import Collection from \"../collection.js\"" if relationships.values.any? { |relationship| relationship[:type] == :has_many }
    lines.concat(relationship_import_lines(relationships:, model_file_name:, model_class_name:))
    lines << ""
    lines << "const modelClassData = #{model_class_data_json}"
    lines << ""
    lines << "/** Frontend model for #{model_class_name}. */"
    lines << "class #{model_class_name} extends BaseModel {"
    lines << "  /** @returns {Record<string, any>} */"
    lines << "  static modelClassData() {"
    lines << "    return modelClassData"
    lines << "  }"
    lines.concat(attribute_method_lines(attributes))
    lines.concat(collection_command_lines(collection_commands, model_content))
    lines.concat(member_command_lines(member_commands, model_content))
    lines.concat(relationship_method_lines(relationships:, model_class_name:, model_content:))
    lines << "}"
    lines << ""
    lines << "export default #{model_class_name}"
    lines << ""

    lines.join("\n")
  end

  def relationship_import_lines(relationships:, model_file_name:, model_class_name:)
    relationship_resources = relationships
      .values
      .map { |relationship| relationship.fetch(:resource_name) }
      .uniq
      .reject { |resource_name| resource_name == model_class_name }
      .sort

    relationship_resources.filter_map do |resource_name|
      resource = resource_by_short_name.fetch(resource_name)
      file_name = "#{resource.short_name.underscore.dasherize}.js"
      next if file_name == model_file_name

      "import #{resource_name} from \"./#{file_name}\""
    end
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

  def collection_command_lines(collection_commands, model_content)
    collection_name = model_content.dig(:model_class_data, :collectionName)

    collection_commands.values.flat_map do |command|
      command_name = command.fetch(:name).to_s
      method_name = js_method_name(command_name)

      [
        "",
        "  /**",
        "   * @param {Record<string, any>} args",
        "   * @param {Record<string, any>} [commandArgs]",
        "   * @returns {Promise<any>}",
        "   */",
        "  static #{method_name}(args, commandArgs = {}) {",
        "    return this._callCollectionCommand(",
        "      {",
        "        args,",
        "        command: \"#{command_name}\",",
        "        collectionName: \"#{collection_name}\",",
        "        type: \"collection\"",
        "      },",
        "      commandArgs",
        "    )",
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
        "   * @param {Record<string, any>} args",
        "   * @param {Record<string, any>} [commandArgs]",
        "   * @returns {Promise<any>}",
        "   */",
        "  #{method_name}(args, commandArgs = {}) {",
        "    return this._callMemberCommand(",
        "      {",
        "        args,",
        "        command: \"#{command_name}\",",
        "        primaryKey: this.primaryKey(),",
        "        collectionName: \"#{collection_name}\",",
        "        type: \"member\"",
        "      },",
        "      commandArgs",
        "    )",
        "  }"
      ]
    end
  end

  def relationship_method_lines(relationships:, model_class_name:, model_content:)
    relationships.flat_map do |relationship_key_name, relationship|
      case relationship.fetch(:type).to_s
      when "belongs_to"
        belongs_to_relationship_method_lines(relationship:, model_class_name:, relationship_key_name:)
      when "has_many"
        build_has_many_relationship_method_lines(relationship:, model_class_name:, model_content:, relationship_key_name:)
      when "has_one"
        build_has_one_relationship_method_lines(relationship:, model_class_name:, model_content:, relationship_key_name:)
      else
        raise "Unknown relationship type: #{relationship.fetch(:type)}"
      end
    end
  end

  def belongs_to_relationship_method_lines(relationship:, model_class_name:, relationship_key_name:)
    relationship_name = relationship_key_name.to_s
    method_name = js_method_name(relationship_name)
    related_model_class_name = relationship_resource_class_name(relationship:, model_class_name:)
    load_method_name = js_method_name("load_#{relationship_name}")
    foreign_key_method_name = js_method_name(relationship.fetch(:foreign_key))
    options_primary_key = relationship.dig(:options, :primary_key)
    klass_primary_key = relationship.dig(:klass, :primary_key)
    ransack_key = "#{options_primary_key || klass_primary_key}_eq"

    [
      "",
      "  /** @returns {#{related_model_class_name} | null} */",
      "  #{method_name}() {",
      "    return this._readBelongsToReflection({reflectionName: \"#{relationship_name}\"})",
      "  }",
      "",
      "  /** @returns {Promise<#{related_model_class_name} | null>} */",
      "  #{load_method_name}() {",
      "    if (!(\"#{foreign_key_method_name}\" in this)) throw new Error(\"Foreign key method wasn't defined: #{foreign_key_method_name}\")",
      "",
      "    const id = this.#{foreign_key_method_name}()",
      "    const ransack = {}",
      "",
      "    ransack[\"#{ransack_key}\"] = id",
      "",
      "    return this._loadBelongsToReflection(",
      "      {reflectionName: \"#{relationship_name}\", model: this, modelClass: #{related_model_class_name}},",
      "      {ransack}",
      "    )",
      "  }"
    ]
  end

  def build_has_many_relationship_method_lines(relationship:, model_class_name:, model_content:, relationship_key_name:) # rubocop:disable Metrics/MethodLength
    relationship_name = relationship_key_name.to_s
    method_name = js_method_name(relationship_name)
    load_method_name = js_method_name("load_#{relationship_name}")
    related_model_class_name = relationship_resource_class_name(relationship:, model_class_name:)
    active_record_name = relationship.dig(:active_record, :name)
    class_name = relationship.fetch(:class_name)
    foreign_key = relationship.fetch(:foreign_key)
    options_as = relationship.dig(:options, :as)
    options_primary_key = relationship.dig(:options, :primary_key)
    options_through = relationship.dig(:options, :through)
    model_primary_key = model_content.dig(:model_class_data, :primaryKey)
    primary_key_method_name = js_method_name(options_primary_key || model_primary_key)

    lines = [
      "",
      "  /** @returns {import(\"../collection.js\").default<typeof #{related_model_class_name}>} */",
      "  #{method_name}() {"
    ]

    if options_through
      lines.push(

        "    return new Collection(",
        "      {",
        "        reflectionName: \"#{relationship_key_name}\",",
        "        model: this,",
        "        modelName: \"#{class_name}\",",
        "        modelClass: #{related_model_class_name}",
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
        "        modelClass: #{related_model_class_name}",
        "      },",
        "      {ransack}",
        "    )"

      )
    end

    lines.push(

      "  }",
      "",
      "  /** @returns {Promise<Array<#{related_model_class_name}>>} */",
      "  #{load_method_name}() {"

    )

    if options_through
      lines.push(

        "    return this._loadHasManyReflection(",
        "      {",
        "        reflectionName: \"#{relationship_name}\",",
        "        model: this,",
        "        modelClass: #{related_model_class_name}",
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

        "    const ransack = {}",
        "",
        "    ransack[\"#{foreign_key}_eq\"] = this.primaryKey()",
        "",
        "    return this._loadHasManyReflection(",
        "      {",
        "        reflectionName: \"#{relationship_name}\",",
        "        model: this,",
        "        modelClass: #{related_model_class_name}",
        "      },",
        "      {ransack}",
        "    )"

      )
    end

    lines << "  }"
    lines
  end

  def build_has_one_relationship_method_lines(relationship:, model_class_name:, model_content:, relationship_key_name:) # rubocop:disable Metrics/MethodLength
    relationship_name = relationship_key_name.to_s
    method_name = js_method_name(relationship_name)
    load_method_name = js_method_name("load_#{relationship_name}")
    related_model_class_name = relationship_resource_class_name(relationship:, model_class_name:)
    active_record_primary_key = relationship.dig(:active_record, :primary_key)
    foreign_key = relationship.fetch(:foreign_key)
    options_through = relationship.dig(:options, :through)
    primary_key_method_name = js_method_name(active_record_primary_key)

    lines = [
      "",
      "  /** @returns {#{related_model_class_name} | null} */",
      "  #{method_name}() {",
      "    return this._readHasOneReflection({reflectionName: \"#{relationship_name}\"})",
      "  }",
      "",
      "  /** @returns {Promise<#{related_model_class_name} | null>} */",
      "  #{load_method_name}() {",
      "    if (!(\"#{primary_key_method_name}\" in this)) throw new Error(\"Primary key method wasn't defined: #{primary_key_method_name}\")",
      "",
      "    const id = this.#{primary_key_method_name}()"
    ]

    if options_through
      lines.push(

        "",
        "    return this._loadHasOneReflection(",
        "      {reflectionName: \"#{relationship_name}\", model: this, modelClass: #{related_model_class_name}},",
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
        "        modelClass: #{related_model_class_name}",
        "      },",
        "      {ransack}",
        "    )"

      )
    end

    lines << "  }"
    lines
  end

  def relationship_resource_class_name(relationship:, model_class_name:)
    relationship_resource_name = relationship.fetch(:resource_name)
    return model_class_name if relationship_resource_name == model_class_name

    relationship_resource_name
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
