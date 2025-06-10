// src/api/rooms.ts
export const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/rooms");
      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  };
  