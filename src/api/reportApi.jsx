// CSMS Report API

import { mockDailyReports, mockIngredientTransactions } from '../utils/mockData.jsx';

export const getDailyReports = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let reports = [...mockDailyReports];
      if (params.startDate && params.endDate) {
        reports = reports.filter(r => r.reportDate >= params.startDate && r.reportDate <= params.endDate);
      }
      resolve(reports);
    }, 300);
  });
};

export const getDailyReportByDate = async (date) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const report = mockDailyReports.find(r => r.reportDate === date);
      report ? resolve(report) : reject(new Error('Report not found'));
    }, 300);
  });
};

export const getIngredientTransactions = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let transactions = [...mockIngredientTransactions];
      if (params.type) {
        transactions = transactions.filter(t => t.type === params.type);
      }
      resolve(transactions);
    }, 300);
  });
};

export const createDailyReport = async (reportData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: mockDailyReports.length + 1, ...reportData });
    }, 500);
  });
};
