#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  spec_args=("spec/system/api_maker_table/api_maker_table_spec.rb")
else
  spec_args=("$@")
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}/ruby-gem"

rm -rf spec/dummy/public/packs/
(cd spec/dummy && bundle _2.3.15_ exec bin/shakapacker)
if [ "${SELENIUM_DRIVER:-}" = "firefox" ]; then
  bundle _2.3.15_ exec appraisal "rails 7" rspec "${spec_args[@]}"
else
  xvfb-run bundle _2.3.15_ exec appraisal "rails 7" rspec "${spec_args[@]}"
fi
