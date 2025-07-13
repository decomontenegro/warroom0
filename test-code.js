function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

// BUG: TypeError quando items é undefined
console.log(calculateTotal());
