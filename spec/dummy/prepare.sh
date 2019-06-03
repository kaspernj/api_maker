rm -rf public/assets/ public/packs tmp/cache
rake api_maker:generate_models assets:precompile
