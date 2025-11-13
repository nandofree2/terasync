Rails.application.routes.draw do
 devise_for :users, skip: [ :registrations ]

  resources :products
  namespace :admin do
    resources :users, except: [ :show ] # halaman admin untuk membuat user
    resources :roles, only: [ :index, :new, :create ] # opsional
  end

  get "up" => "rails/health#show", as: :rails_health_check

  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  root to: "products#index"
end
