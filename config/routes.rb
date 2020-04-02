Rails.application.routes.draw do
  get '/telemetry', to: "index#index"
  get '/telemetry/other', to: "index#otherTelem"
  get '/configuration', to: "index#configuration"
  
  get '/reset', to: "index#reset"
  
  post '/in', to: "posting#inData"
  post '/newFlight', to: "index#newFlight"
  post '/isFlight', to: "index#isFlight"
  post '/setActiveFlight', to: "index#setFlight"

  get '/out', to: "index#outData"
  get '/all', to: "index#allData"

  mount Lockup::Engine, at: '/lockup'

  root 'index#index'
end
