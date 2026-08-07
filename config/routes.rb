# frozen_string_literal: true

DiscourseSageMath::Engine.routes.draw do
  get "/examples" => "examples#index"
  # define routes here
end

Discourse::Application.routes.draw { mount ::DiscourseSageMath::Engine, at: "discourse-sage-math" }
