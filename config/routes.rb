Rails.application.routes.draw do
  get 'index/index'
  get '/telemetry', to: "index#checkForTelemetryUpdate"
  get '/telemetry/all', to: "index#allTelemetry"
  get '/reset', to: "index#resetDB"

  root 'index#index'
end
