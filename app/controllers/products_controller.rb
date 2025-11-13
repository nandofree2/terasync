class ProductsController < ApplicationController
  def index
    @q = Product.ransack(params[:q])
    @products = @q.result.order(:name).page(params[:page]).per(20)
  end

  def show; end

  def new
  end

  def create
    product = Products::CreateService.new(product_params, current_user).call
    redirect_to product
    rescue => e
    render :new, alert: e.message
  end

  def edit; end

  def update
    if @product.update(product_params)
      redirect_to @product, notice: "Product berhasil diupdate"
    else
      render :edit
    end
  end

  def destroy
    @product.destroy
    redirect_to products_path, notice: "Product dihapus"
  end

  private

  def product_params
    params.require(:product).permit(:name, :sku, :price, :stock, :description)
  end
end
