export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });

export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};
