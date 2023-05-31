class ApiMaker::SearchToRansackParams
  attr_reader :search

  def initialize(search:)
    @search = search
  end

  def perform
    ransack_params = {}

    search.each do |search_param|
      ransack_key = ""
      ransack_key << "#{search_param[:p].join("_")}_" if search_param[:p].length.positive?

      if search_param[:a] && search_param[:pre]
        ransack_key << "#{search_param[:a] || search_param[:sc]}_#{search_param[:pre]}"
      elsif search_param[:sc]
        ransack_key << search_param[:sc]
      else
        raise "Don't know if should use attribute or scope?"
      end

      ransack_params[ransack_key] = search_param[:v]
    end

    ransack_params
  end
end
