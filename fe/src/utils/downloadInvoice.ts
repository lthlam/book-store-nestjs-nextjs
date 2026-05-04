import { api, adminApi } from '@/lib/axios';
import type { AxiosInstance } from 'axios';

/**
 * Tải invoice PDF qua axios với withCredentials (cookie auth).
 * Tạo blob URL và trigger download trong browser.
 */
export async function downloadInvoice(
  orderId: string,
  axiosInstance: AxiosInstance = api,
): Promise<void> {
  const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${orderId.slice(0, 8).toUpperCase()}.pdf`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

export { adminApi };
