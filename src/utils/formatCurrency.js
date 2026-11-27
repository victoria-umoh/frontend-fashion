const formatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 2,
});

const formatCurrency = (amount) => {
  const value = Number(amount);
  return formatter.format(Number.isFinite(value) ? value : 0);
};

export default formatCurrency;
