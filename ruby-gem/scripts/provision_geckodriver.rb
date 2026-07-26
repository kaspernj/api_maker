require "webdrivers"

# Populate webdrivers' own version cache before CI fans out into system spec builds.
driver_path = Webdrivers::Geckodriver.update
driver_version = Webdrivers::Geckodriver.current_version

puts "Provisioned geckodriver #{driver_version} at #{driver_path}"
