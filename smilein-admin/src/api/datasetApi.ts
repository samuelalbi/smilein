import apiClient from './client';
import { Dataset, DatasetCreate, DatasetUpdate } from '../types/dataset';

// Create a new dataset
export const createDataset = async (dataset: DatasetCreate): Promise<Dataset> => {
  const response = await apiClient.post('/datasets/', dataset);
  return response.data;
};

// Get all datasets with pagination
export const getDatasets = async (skip = 0, limit = 100): Promise<Dataset[]> => {
  const response = await apiClient.get('/datasets/', {
    params: { skip, limit }
  });
  return response.data;
};

// Get datasets for a specific student
export const getStudentDatasets = async (studentId: number): Promise<Dataset[]> => {
  const response = await apiClient.get(`/datasets/student/${studentId}/datasets`);
  return response.data;
};

// Get a specific dataset by ID
export const getDataset = async (datasetId: number): Promise<Dataset> => {
  const response = await apiClient.get(`/datasets/${datasetId}`);
  return response.data;
};

// Update a dataset
export const updateDataset = async (datasetId: number, datasetData: DatasetUpdate): Promise<Dataset> => {
  const response = await apiClient.put(`/datasets/${datasetId}`, datasetData);
  return response.data;
};

// Delete a dataset
export const deleteDataset = async (datasetId: number): Promise<void> => {
  await apiClient.delete(`/datasets/${datasetId}`);
};