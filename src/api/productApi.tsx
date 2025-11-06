// CSMS Product API

import apiClient from './apiClient.tsx';
import { mockProducts } from '../utils/mockData.tsx';

/**
 * Get all products
 */
export const getAllProducts = async (params = {}) => {
  // TODO: Replace with actual API call
  // return apiClient.get('/products', params);
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      let products = [...mockProducts];
      
      // Filter by status
      if (params.status) {
        products = products.filter(p => p.status === params.status);
      }
      
      // Filter by category
      if (params.category) {
        products = products.filter(p => p.category === params.category);
      }
      
      // Search by name
      if (params.search) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      resolve(products);
    }, 300);
  });
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  // TODO: Replace with actual API call
  // return apiClient.get(`/products/${id}`);
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 300);
  });
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  // TODO: Replace with actual API call
  // return apiClient.post('/products', productData);
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct = {
        id: mockProducts.length + 1,
        ...productData
      };
      resolve(newProduct);
    }, 500);
  });
};

/**
 * Update product
 */
export const updateProduct = async (id, productData) => {
  // TODO: Replace with actual API call
  // return apiClient.put(`/products/${id}`, productData);
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (product) {
        const updatedProduct = { ...product, ...productData };
        resolve(updatedProduct);
      } else {
        reject(new Error('Product not found'));
      }
    }, 500);
  });
};

/**
 * Delete product
 */
export const deleteProduct = async (id) => {
  // TODO: Replace with actual API call
  // return apiClient.delete(`/products/${id}`);
  
  // Mock implementation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockProducts.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        resolve({ success: true, message: 'Product deleted successfully' });
      } else {
        reject(new Error('Product not found'));
      }
    }, 500);
  });
};
