// CSMS Order API

import { mockOrders } from '../utils/mockData.jsx';

export const getAllOrders = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let orders = [...mockOrders];
      if (params.status) {
        orders = orders.filter(o => o.status === params.status);
      }
      resolve(orders);
    }, 300);
  });
};

export const getOrderById = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === parseInt(id));
      order ? resolve(order) : reject(new Error('Order not found'));
    }, 300);
  });
};

export const createOrder = async (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: mockOrders.length + 1, ...orderData });
    }, 500);
  });
};

export const updateOrder = async (id, orderData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === parseInt(id));
      order ? resolve({ ...order, ...orderData }) : reject(new Error('Order not found'));
    }, 500);
  });
};
