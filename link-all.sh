#!/bin/sh

cd npm-api-maker-inputs
yarn link @kaspernj/api-maker
cd ..

cd ruby-gem/spec/dummy
yarn link @kaspernj/api-maker
cd ../../..
