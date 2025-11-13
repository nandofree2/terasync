class Products::CreateService
  def initialize(params, current_user)
    @params = params
    @user = current_user
  end

  def call
    Product.transaction do
      product = Product.create!(@params)
      # log / stock history / audit
      product
    end
  end
end
