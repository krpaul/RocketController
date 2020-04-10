Rails.application.routes.draw do
  get '/telemetry', to: "index#index"
  get '/telemetry/other', to: "index#otherTelem"
  get '/configuration', to: "index#configuration"
  get '/map', to: "index#map"
  
  get '/reset', to: "index#reset"
  
  post '/in', to: "posting#inData"
  post '/newFlight', to: "index#newFlight"
  post '/isFlight', to: "index#isFlight"
  post '/allFlightData', to: "index#getAllFlightData"

  get '/out', to: "index#outData"
  get '/all', to: "index#allData"

  mount Lockup::Engine, at: '/lockup'

  root 'index#index'
end
