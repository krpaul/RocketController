Rails.application.routes.draw do
  get 'index/index'
  get '/telemetry', to: "index#checkForTelemetryUpdate"
  get '/telemetry/all', to: "index#allTelemetry"
  get '/reset', to: "index#resetDB"

  post '/in', to: "index#inData"
  get '/out', to: "index#outData"

  root 'index#index'
end
