Rails.application.routes.draw do
  get 'index/index'
  get '/reset', to: "index#reset"
  
  post '/in', to: "index#inData"
  get '/out', to: "index#outData"
  get '/all', to: "index#allData"
  
  root 'index#index'
end
