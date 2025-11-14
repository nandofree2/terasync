class ProductsController < ApplicationController
  def index
    @q = Product.ransack(params[:q])
    @products = @q.result.order(:name).page(params[:page]).per(20)
  end

  def new
  end

  # GET /products/:id
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @product }
    end
  end

  # POST /products
  def create
    @product = Product.new(product_params)

    respond_to do |format|
      if @product.save
        format.html { redirect_to products_path, notice: "Product created." }
        format.json { render json: @product, status: :created }
      else
        format.html do
          flash.now[:alert] = @product.errors.full_messages.join(", ")
          render :new, status: :unprocessable_entity
        end
        format.json { render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  # PUT/PATCH /products/:id
  def update
    respond_to do |format|
      if @product.update(product_params)
        format.html { redirect_to products_path, notice: "Product updated." }
        format.json { render json: @product, status: :ok }
      else
        format.html do
          flash.now[:alert] = @product.errors.full_messages.join(", ")
          render :edit, status: :unprocessable_entity
        end
        format.json { render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /products/:id
  def destroy
    if @product.destroy
      respond_to do |format|
        format.html { redirect_to products_path, notice: "Product deleted." }
        format.json { head :no_content }
      end
    else
      respond_to do |format|
        format.html { redirect_to products_path, alert: "Delete failed." }
        format.json { render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end


  private

  def product_params
    params.require(:product).permit(:name, :sku, :price, :stock, :description)
  end
end
