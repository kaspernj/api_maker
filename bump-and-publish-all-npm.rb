#!/usr/bin/env ruby

require "json"

otp = ENV.fetch("OTP")

def bump_version(old_version)
  old_version = old_version.split(".")
  old_minor = old_version[old_version.length - 1].to_i

  new_version = old_version.dup
  new_version[old_version.length - 1] = old_minor + 1
  new_version.join(".")
end

def wait_for_publish
  puts "Waiting for publish"
  sleep 2
  puts "Done waiting"
end

api_maker_package = JSON.parse(File.read("npm-api-maker/package.json"))
api_maker_version = api_maker_package.fetch("version")
api_maker_new_version = bump_version(api_maker_version)

puts %x[cd npm-api-maker && yarn publish --new-version #{api_maker_new_version} --otp #{otp}]
wait_for_publish


inputs_package = JSON.parse(File.read("npm-api-maker-inputs/package.json"))
inputs_version = inputs_package.fetch("version")
inputs_new_version = bump_version(inputs_version)

inputs_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version

File.write("npm-api-maker-inputs/package.json", JSON.pretty_generate(inputs_package))

puts %x[cd npm-api-maker-inputs && yarn && yarn publish --new-version #{inputs_new_version} --otp #{otp}]
wait_for_publish


bootstrap_package = JSON.parse(File.read("npm-api-maker-bootstrap/package.json"))
bootstrap_version = bootstrap_package.fetch("version")
bootstrap_new_version = bump_version(bootstrap_version)

bootstrap_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version
bootstrap_package["dependencies"]["@kaspernj/api-maker-inputs"] = inputs_new_version

File.write("npm-api-maker-bootstrap/package.json", JSON.pretty_generate(bootstrap_package))

puts %x[cd npm-api-maker-bootstrap && yarn && yarn publish --new-version #{bootstrap_new_version} --otp #{otp}]
wait_for_publish


table_package = JSON.parse(File.read("api_maker_table_npm/package.json"))
table_version = table_package.fetch("version")
table_new_version = bump_version(table_version)

table_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version
table_package["dependencies"]["@kaspernj/api-maker-bootstrap"] = bootstrap_new_version
table_package["dependencies"]["@kaspernj/api-maker-inputs"] = inputs_new_version

File.write("api_maker_table_npm/package.json", JSON.pretty_generate(table_package))

puts %x[cd api_maker_table_npm && yarn && yarn publish --new-version #{table_new_version} --otp #{otp}]


dummy_package = JSON.parse(File.read("ruby-gem/spec/dummy/package.json"))
table_version = table_package.fetch("version")
table_new_version = bump_version(table_version)

table_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version
table_package["dependencies"]["@kaspernj/api-maker-bootstrap"] = bootstrap_new_version
table_package["dependencies"]["@kaspernj/api-maker-inputs"] = inputs_new_version
table_package["dependencies"]["@kaspernj/api-maker-table"] = table_new_version

File.write("ruby-gem/spec/dummy/package.json", JSON.pretty_generate(table_package))

puts %x[cd ruby-gem/spec/dummy && yarn]
