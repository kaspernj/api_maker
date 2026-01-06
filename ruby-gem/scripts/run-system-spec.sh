#!/usr/bin/env bash
set -euo pipefail

spec_path="${1:-spec/system/api_maker_table/api_maker_table_spec.rb}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}/ruby-gem"

rm -rf spec/dummy/public/packs/
(cd spec/dummy && bin/shakapacker)
xvfb-run bundle exec appraisal "rails 7" rspec "${spec_path}"
