Rails.application.routes.draw do
  # Page endpoint
  get ':flight_id/telemetry', to: "index#index", :constraints => { :flight_id => /[0-9|]+/ }
  get ':flight_id/telemetry/other', to: "index#otherTelem", :constraints => { :flight_id => /[0-9|]+/ }
  get ':flight_id/configuration', to: "index#configuration", :constraints => { :flight_id => /[0-9|]+/ }
  get ':flight_id/map', to: "index#map", :constraints => { :flight_id => /[0-9|]+/ }
  get ':flight_id/images', to: "index#images", :constraints => { :flight_id => /[0-9|]+/ }
  
  # Graph endpoints
  get 'get/alt/:flight_id', to: "graph#alt", :constraints => { :flight_id => /[0-9|]+/ }
  get 'get/accel/:flight_id', to: "graph#accel", :constraints => { :flight_id => /[0-9|]+/ }
  get 'get/gyro/:flight_id', to: "graph#gyro", :constraints => { :flight_id => /[0-9|]+/ }
  get 'get/mag/:flight_id', to: "graph#mag", :constraints => { :flight_id => /[0-9|]+/ }
  get 'get/rssi/:flight_id', to: "graph#rssi", :constraints => { :flight_id => /[0-9|]+/ }
  
  # AJAX Endpoitns
  post '/in', to: "posting#inData"
  post '/newFlight', to: "index#newFlight"
  post '/isFlight', to: "index#isFlight"
  post '/allFlightData', to: "index#getAllFlightData"
  get '/lastUpdate/:flight_id', to: "index#lastUpdate"

  get '/out', to: "index#outData"
  get '/all', to: "index#allData"

  # Imaging
  post '/image', to: "posting#image"
  get ':flight_id/getLastImage', to: "posting#getLastImage", :constraints => { :flight_id => /[0-9|]+/ }
  get ':flight_id/getLastImage/time', to: "posting#getLastImage_time", :constraints => { :flight_id => /[0-9|]+/ }

  # Other
  mount Lockup::Engine, at: '/lockup'
  root 'index#route_me'
end
