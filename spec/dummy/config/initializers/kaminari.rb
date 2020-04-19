if Gem.loaded_specs["kaminari"]
  Kaminari.configure do |config|
    config.default_per_page = 30
  end
end
