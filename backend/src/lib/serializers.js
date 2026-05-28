function toNumber(decimalValue) {
  return Number(decimalValue);
}

function serializeProduct(product) {
  const price = toNumber(product.price);
  const discountPercent = Number(product.discountPercent || 0);
  const finalPrice =
    discountPercent > 0
      ? Number((price * (1 - discountPercent / 100)).toFixed(2))
      : price;

  return {
    ...product,
    price,
    discountPercent,
    finalPrice,
  };
}

module.exports = {
  toNumber,
  serializeProduct,
};
