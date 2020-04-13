Rails.application.routes.draw do
  get '/telemetry', to: "index#index"
  get '/telemetry/other', to: "index#otherTelem"
  get '/configuration', to: "index#configuration"
  get '/map', to: "index#map"
  
  get '/reset', to: "index#reset"

  get '/get/alt', to: "graph#alt"
  get '/get/accel', to: "graph#accel"
  get '/get/gyro', to: "graph#gyro"
  get '/get/orientation', to: "graph#orientation"
  get '/get/rssi', to: "graph#rssi"
  
  post '/in', to: "posting#inData"
  post '/newFlight', to: "index#newFlight"
  post '/isFlight', to: "index#isFlight"
  post '/allFlightData', to: "index#getAllFlightData"

  get '/out', to: "index#outData"
  get '/all', to: "index#allData"

  mount Lockup::Engine, at: '/lockup'

  root 'index#index'
end
