// src/api/roomApi.ts

import apiClient from './client';
import { Room, RoomCreate, RoomUpdate } from '../types/room';

// Create a new room
export const createRoom = async (room: RoomCreate): Promise<Room> => {
  const response = await apiClient.post<Room>('/rooms/', room);
  return response.data;
};

// Get all rooms with pagination and optional filters
export const getRooms = async (skip = 0, limit = 100, name?: string): Promise<Room[]> => {
  const response = await apiClient.get<Room[]>('/rooms/', {
    params: { skip, limit, name }
  });
  return response.data;
};

// Get a specific room by ID
export const getRoom = async (roomId: number): Promise<Room> => {
  const response = await apiClient.get<Room>(`/rooms/${roomId}`);
  return response.data;
};

// Update a room
export const updateRoom = async (roomId: number, roomData: RoomUpdate): Promise<Room> => {
  const response = await apiClient.patch<Room>(`/rooms/${roomId}`, roomData);
  return response.data;
};

// Delete a room
export const deleteRoom = async (roomId: number): Promise<void> => {
  await apiClient.delete(`/rooms/${roomId}`);
};