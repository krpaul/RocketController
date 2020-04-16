Rails.application.routes.draw do
  # Page endpoint
  get ':flight_id/telemetry', to: "index#index", :constraints => { :id => /[0-9|]+/ }
  get ':flight_id/telemetry/other', to: "index#otherTelem", :constraints => { :id => /[0-9|]+/ }
  get ':flight_id/configuration', to: "index#configuration", :constraints => { :id => /[0-9|]+/ }
  get ':flight_id/map', to: "index#map", :constraints => { :id => /[0-9|]+/ }
  
  # Graph endpoints
  get 'get/alt/:flight_id', to: "graph#alt", :constraints => { :id => /[0-9|]+/ }
  get 'get/accel/:flight_id', to: "graph#accel", :constraints => { :id => /[0-9|]+/ }
  get 'get/gyro/:flight_id', to: "graph#gyro", :constraints => { :id => /[0-9|]+/ }
  get 'get/orientation/:flight_id', to: "graph#orientation", :constraints => { :id => /[0-9|]+/ }
  get 'get/rssi/:flight_id', to: "graph#rssi", :constraints => { :id => /[0-9|]+/ }
  
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
