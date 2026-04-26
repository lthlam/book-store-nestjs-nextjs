export const formatVND = (val: number) =>
  val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
