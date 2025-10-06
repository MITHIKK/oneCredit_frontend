import { api } from './api';

export const paymentService = {
  
  getPayments: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payments?${queryString}` : '/payments';
      
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payments');
    }
  },

  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.payment;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payment');
    }
  },

  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.payment;
    } catch (error) {
      throw new Error(error.message || 'Failed to create payment');
    }
  },

  updatePayment: async (paymentId, updates) => {
    try {
      const response = await api.put(`/payments/${paymentId}`, updates);
      return response.payment;
    } catch (error) {
      throw new Error(error.message || 'Failed to update payment');
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const response = await api.delete(`/payments/${paymentId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete payment');
    }
  },

  processRefund: async (paymentId, refundData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, refundData);
      return response.payment;
    } catch (error) {
      throw new Error(error.message || 'Failed to process refund');
    }
  },

  getPaymentStats: async (dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (dateRange.startDate) {
        queryParams.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        queryParams.append('endDate', dateRange.endDate);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payments/stats/overview?${queryString}` : '/payments/stats/overview';
      
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payment statistics');
    }
  },

  getTripPayments: async (tripId) => {
    try {
      const response = await api.get(`/payments/trip/${tripId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch trip payments');
    }
  },

  createBulkPayments: async (paymentsData) => {
    try {
      const response = await api.post('/payments/bulk', { payments: paymentsData });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create payments');
    }
  },

  getPaymentsByCategory: async (category) => {
    try {
      return await paymentService.getPayments({ category });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payments by category');
    }
  },

  getPaymentsByStatus: async (status) => {
    try {
      return await paymentService.getPayments({ status });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch payments by status');
    }
  },

  getRecentPayments: async (limit = 10) => {
    try {
      return await paymentService.getPayments({ 
        limit,
        sortBy: 'paymentDate',
        sortOrder: 'desc' 
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch recent payments');
    }
  },

  searchPayments: async (searchTerm) => {
    try {
      
      return await paymentService.getPayments({ search: searchTerm });
    } catch (error) {
      throw new Error(error.message || 'Failed to search payments');
    }
  },

  formatPaymentForDisplay: (payment) => {
    return {
      ...payment,
      formattedAmount: `${payment.currency} ${payment.amount.toFixed(2)}`,
      formattedPaymentDate: new Date(payment.paymentDate).toLocaleDateString(),
      formattedTotalAmount: `${payment.currency} ${payment.totalAmount?.toFixed(2) || payment.amount.toFixed(2)}`,
      statusLabel: payment.status.charAt(0).toUpperCase() + payment.status.slice(1).replace('_', ' '),
      categoryLabel: payment.category.charAt(0).toUpperCase() + payment.category.slice(1).replace('_', ' '),
      paymentMethodLabel: payment.paymentMethod?.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified',
      isRefundable: payment.status === 'completed' && (payment.totalRefunded || 0) < payment.totalAmount,
      refundableAmount: payment.totalAmount - (payment.totalRefunded || 0)
    };
  },

  validatePaymentData: (paymentData) => {
    const errors = [];

    if (!paymentData.trip) {
      errors.push('Trip is required');
    }

    if (!paymentData.description || paymentData.description.trim().length < 3) {
      errors.push('Description must be at least 3 characters long');
    }

    if (!paymentData.category) {
      errors.push('Category is required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    if (!paymentData.paymentMethod?.type) {
      errors.push('Payment method is required');
    }

    if (!paymentData.vendor?.name || paymentData.vendor.name.trim().length < 2) {
      errors.push('Vendor name must be at least 2 characters long');
    }

    return errors;
  },

  calculatePaymentTotals: (payments) => {
    const totals = {
      totalAmount: 0,
      totalCompleted: 0,
      totalPending: 0,
      totalRefunded: 0,
      byCategory: {},
      byStatus: {},
      byPaymentMethod: {}
    };

    payments.forEach(payment => {
      totals.totalAmount += payment.amount;

      if (payment.status === 'completed') {
        totals.totalCompleted += payment.amount;
      } else if (payment.status === 'pending') {
        totals.totalPending += payment.amount;
      }

      if (payment.status === 'refunded' || payment.status === 'partially_refunded') {
        totals.totalRefunded += payment.totalRefunded || 0;
      }

      if (!totals.byCategory[payment.category]) {
        totals.byCategory[payment.category] = { count: 0, amount: 0 };
      }
      totals.byCategory[payment.category].count++;
      totals.byCategory[payment.category].amount += payment.amount;

      if (!totals.byStatus[payment.status]) {
        totals.byStatus[payment.status] = { count: 0, amount: 0 };
      }
      totals.byStatus[payment.status].count++;
      totals.byStatus[payment.status].amount += payment.amount;

      const paymentMethod = payment.paymentMethod?.type || 'unknown';
      if (!totals.byPaymentMethod[paymentMethod]) {
        totals.byPaymentMethod[paymentMethod] = { count: 0, amount: 0 };
      }
      totals.byPaymentMethod[paymentMethod].count++;
      totals.byPaymentMethod[paymentMethod].amount += payment.amount;
    });

    return totals;
  },

  getPaymentCategories: () => [
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'food', label: 'Food' },
    { value: 'activities', label: 'Activities' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'visa', label: 'Visa' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ],

  getPaymentMethods: () => [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash', label: 'Cash' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' }
  ],

  getSupportedCurrencies: () => [
    { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
    { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
    { value: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
    { value: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥' },
    { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'Fr' },
    { value: 'CNY', label: 'Chinese Yuan (CNY)', symbol: '¥' },
    { value: 'KRW', label: 'South Korean Won (KRW)', symbol: '₩' }
  ]
};

export default paymentService;
