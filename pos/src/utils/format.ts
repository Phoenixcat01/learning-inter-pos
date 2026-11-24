import { Alert, Platform } from 'react-native';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const generateInvoiceNumber = (count: number): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const num = String(count + 1).padStart(4, '0');
  return `INV-${yyyy}${mm}${dd}-${num}`;
};

export const showPOSAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message ? `${title}\n${message}` : title);
    }
  } else {
    Alert.alert(title, message);
  }
};
