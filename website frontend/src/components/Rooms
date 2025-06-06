// src/components/RoomList.tsx
import React, { useState, useEffect } from "react";
import { fetchRooms } from "../api/rooms";

const RoomList = ({ onSelectRoom }: { onSelectRoom: (room: any) => void }) => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filters, setFilters] = useState({ price: "", type: "", amenities: "" });

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  useEffect(() => {
    let filtered = rooms;
    if (filters.price) filtered = filtered.filter((room: any) => room.price <= filters.price);
    if (filters.type) filtered = filtered.filter((room: any) => room.type === filters.type);
    if (filters.amenities)
      filtered = filtered.filter((room: any) => room.amenities.includes(filters.amenities));

    setFilteredRooms(filtered);
  }, [filters, rooms]);

  return (
    <div className="container">
      <h2 className="my-4">Available Rooms</h2>
      
      {/* Filters */}
      <div className="row mb-3">
        <input className="form-control col" placeholder="Max Price" onChange={(e) => setFilters({ ...filters, price: e.target.value })} />
        <input className="form-control col" placeholder="Room Type" onChange={(e) => setFilters({ ...filters, type: e.target.value })} />
        <input className="form-control col" placeholder="Amenities" onChange={(e) => setFilters({ ...filters, amenities: e.target.value })} />
      </div>

      {/* Room Listings */}
      <div className="row">
        {filteredRooms.map((room: any) => (
          <div key={room._id} className="col-md-4">
            <div className="card">
              <img src={room.image} className="card-img-top" alt={room.name} />
              <div className="card-body">
                <h5 className="card-title">{room.name}</h5>
                <p className="card-text">Price: ${room.price} | Type: {room.type}</p>
                <button className="btn btn-primary" onClick={() => onSelectRoom(room)}>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
