Rails.application.routes.draw do
  # Page endpoint
  get ':flight_id/telemetry', to: "index#index"
  get ':flight_id/telemetry/other', to: "index#otherTelem"
  get ':flight_id/configuration', to: "index#configuration"
  get ':flight_id/map', to: "index#map"
  
  # Graph endpoints
  get 'get/alt/:flight_id', to: "graph#alt"
  get 'get/accel/:flight_id', to: "graph#accel"
  get 'get/gyro/:flight_id', to: "graph#gyro"
  get 'get/orientation/:flight_id', to: "graph#orientation"
  get 'get/rssi/:flight_id', to: "graph#rssi"
  
  # AJAX Endpoitns
  post '/in', to: "posting#inData"
  post '/newFlight', to: "index#newFlight"
  post '/isFlight', to: "index#isFlight"
  post '/allFlightData', to: "index#getAllFlightData"

  get '/out', to: "index#outData"
  get '/all', to: "index#allData"

  # Other
  mount Lockup::Engine, at: '/lockup'
  root 'index#route_me'
end
