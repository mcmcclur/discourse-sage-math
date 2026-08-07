# frozen_string_literal: true

# name: discourse-sage-math
# about: Renders SageMath fenced code blocks as interactive-ready Discourse content.
# version: 0.0.1
# authors: Mark McClure
# url: https://github.com/mcmcclur/discourse-sage-math
# required_version: 2.7.0

register_asset "stylesheets/common/discourse-sage-math.scss"

enabled_site_setting :discourse_sage_math_enabled

module ::DiscourseSageMath
  PLUGIN_NAME = "discourse-sage-math"
end

require_relative "lib/discourse_sage_math/engine"
