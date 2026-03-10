exports.calculateFinalFee = (registrationFee, discountPercent = 0) => {
  const discount = (registrationFee * discountPercent) / 100;
  return registrationFee - discount;
};
