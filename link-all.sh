#!/bin/sh

cd npm-api-maker-inputs
yarn link @kaspernj/api-maker
cd ..

cd npm-api-maker-bootstrap
yarn link @kaspernj/api-maker
yarn link @kaspernj/api-maker-inputs
cd ..

cd api_maker_table_npm
yarn link @kaspernj/api-maker
yarn link @kaspernj/api-maker-inputs
yarn link @kaspernj/api-maker-bootstrap
cd ..

cd ruby-gem/spec/dummy
yarn link @kaspernj/api-maker
yarn link @kaspernj/api-maker-inputs
yarn link @kaspernj/api-maker-bootstrap
yarn link @kaspernj/api-maker-table
cd ../../..
