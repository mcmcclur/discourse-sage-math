# frozen_string_literal: true

DiscourseSageMath::Engine.routes.draw {}

Discourse::Application.routes.draw { mount ::DiscourseSageMath::Engine, at: "discourse-sage-math" }
