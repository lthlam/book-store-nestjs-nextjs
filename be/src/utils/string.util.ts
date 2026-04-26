export function removeAccents(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD') // Tách các dấu khỏi ký tự gốc
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu
    .replace(/[đĐ]/g, 'd') // Xử lý chữ đ
    .toLowerCase();
}
