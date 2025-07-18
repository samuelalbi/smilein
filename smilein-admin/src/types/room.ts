// src/types/room.ts

export interface Room {
    room_id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    created_at: string;
  }
  
  export interface RoomCreate {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }
  
  export interface RoomUpdate {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }