Rails.application.routes.draw do
  get 'index/index'
  get '/reset', to: "index#reset"
  
  post '/in', to: "posting#inData"
  get '/out', to: "index#outData"
  get '/all', to: "index#allData"

  mount Lockup::Engine, at: '/lockup'

  root 'index#index'
end
