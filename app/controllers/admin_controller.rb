module Admin
  class UsersController < ApplicationController
    before_action :authenticate_user!
    authorize_resource class: false
    load_and_authorize_resource :user, through: nil

    before_action :ensure_admin!

    def index
      @users = User.includes(:role).order(:email)
    end

    def new
      @user = User.new
    end

    def create
      @user = User.new(user_params)
      if @user.save
        redirect_to admin_users_path, notice: "User dibuat"
      else
        render :new
      end
    end

    def edit
      @user = User.find(params[:id])
    end

    def update
      @user = User.find(params[:id])
      if @user.update(user_update_params)
        redirect_to admin_users_path, notice: "User diupdate"
      else
        render :edit
      end
    end

    def destroy
      @user = User.find(params[:id])
      @user.destroy
      redirect_to admin_users_path, notice: "User dihapus"
    end

    private

    def ensure_admin!
      redirect_to root_path, alert: "Access denied" unless current_user.admin?
    end

    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation, :role_id)
    end

    def user_update_params
      if params[:user][:password].blank?
        params.require(:user).permit(:email, :role_id).tap { |wh| wh[:password] = nil }
      else
        params.require(:user).permit(:email, :password, :password_confirmation, :role_id)
      end
    end
  end
end
