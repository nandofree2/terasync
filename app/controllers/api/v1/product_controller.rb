class ProductSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :sku, :price, :stock
end
