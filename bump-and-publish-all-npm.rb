#!/usr/bin/env ruby

class CommandFailedError < RuntimeError; end

require "json"
require "pry"
require "tretry"

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
  sleep 5
  puts "Done waiting"
end

def run_command_with_retry(command)
  Tretry.try(errors: [CommandFailedError], wait: 2) do
    system(command)
    raise CommandFailedError, "Command failed" unless $?.success?
  end
end

api_maker_package = JSON.parse(File.read("npm-api-maker/package.json"))
api_maker_version = api_maker_package.fetch("version")
api_maker_new_version = bump_version(api_maker_version)

run_command_with_retry("cd npm-api-maker && yarn publish --new-version #{api_maker_new_version} --otp #{otp}")
wait_for_publish


inputs_package = JSON.parse(File.read("npm-api-maker-inputs/package.json"))
inputs_version = inputs_package.fetch("version")
inputs_new_version = bump_version(inputs_version)

inputs_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version

File.write("npm-api-maker-inputs/package.json", JSON.pretty_generate(inputs_package))

run_command_with_retry("cd npm-api-maker-inputs && yarn && yarn publish --new-version #{inputs_new_version} --otp #{otp}")
wait_for_publish


bootstrap_package = JSON.parse(File.read("npm-api-maker-bootstrap/package.json"))
bootstrap_version = bootstrap_package.fetch("version")
bootstrap_new_version = bump_version(bootstrap_version)

bootstrap_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version
bootstrap_package["dependencies"]["@kaspernj/api-maker-inputs"] = inputs_new_version

File.write("npm-api-maker-bootstrap/package.json", JSON.pretty_generate(bootstrap_package))

run_command_with_retry("cd npm-api-maker-bootstrap && yarn && yarn publish --new-version #{bootstrap_new_version} --otp #{otp}")
wait_for_publish


table_package = JSON.parse(File.read("api_maker_table_npm/package.json"))
table_version = table_package.fetch("version")
table_new_version = bump_version(table_version)

table_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version
table_package["dependencies"]["@kaspernj/api-maker-bootstrap"] = bootstrap_new_version
table_package["dependencies"]["@kaspernj/api-maker-inputs"] = inputs_new_version

File.write("api_maker_table_npm/package.json", JSON.pretty_generate(table_package))

run_command_with_retry("cd api_maker_table_npm && yarn && yarn publish --new-version #{table_new_version} --otp #{otp}")
wait_for_publish


dummy_package = JSON.parse(File.read("ruby-gem/spec/dummy/package.json"))
dummy_version = table_package.fetch("version")
dummy_new_version = bump_version(table_version)

dummy_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version
dummy_package["dependencies"]["@kaspernj/api-maker-bootstrap"] = bootstrap_new_version
dummy_package["dependencies"]["@kaspernj/api-maker-inputs"] = inputs_new_version
dummy_package["dependencies"]["@kaspernj/api-maker-table"] = table_new_version

File.write("ruby-gem/spec/dummy/package.json", JSON.pretty_generate(dummy_package))

run_command_with_retry("cd ruby-gem/spec/dummy && yarn")
