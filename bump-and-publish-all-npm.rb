#!/usr/bin/env ruby

class CommandFailedError < RuntimeError; end

require "json"
require "pry"
require "tretry"

def otp
  ENV.fetch("OTP")
end

def bump_version(old_version)
  old_version = old_version.split(".")
  old_minor = old_version[old_version.length - 1].to_i

  new_version = old_version.dup
  new_version[old_version.length - 1] = old_minor + 1
  new_version.join(".")
end

def wait_for_publish
  puts "Waiting for publish"
  sleep 7
  puts "Done waiting"
end

def run_command_with_retry(command)
  Tretry.try(errors: [CommandFailedError], wait: 2) do
    system(command)
    raise CommandFailedError, "Command failed" unless $?.success?
  end
end


# BASE
api_maker_package = JSON.parse(File.read("npm-api-maker/package.json"))
api_maker_version = api_maker_package.fetch("version")
api_maker_new_version = bump_version(api_maker_version)


# DUMMY
dummy_package = JSON.parse(File.read("ruby-gem/spec/dummy/package.json"))
# dummy_version = table_package.fetch("version")
# dummy_new_version = bump_version(table_version)

dummy_package["dependencies"]["@kaspernj/api-maker"] = api_maker_new_version

File.write("ruby-gem/spec/dummy/package.json", JSON.pretty_generate(dummy_package))


# RELEASE NEW VERSIONS
#run_command_with_retry("cd npm-api-maker && yarn publish --new-version #{api_maker_new_version} --otp #{otp}")
#wait_for_publish

#run_command_with_retry("cd ruby-gem/spec/dummy && yarn")
