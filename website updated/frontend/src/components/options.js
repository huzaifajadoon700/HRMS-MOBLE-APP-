import React from "react";
import Products from "./products";

const Options = () => {
    const items = [
        { name: "Rooms", icon: "bi bi-house" },
        { name: "Tables", icon: "bi bi-grid-3x3-gap" },
        { name: "Events", icon: "bi bi-calendar-event" },
        { name: "Deals", icon: "bi bi-tag" },
        { name: "Guests", icon: "bi bi-people" },
        { name: "Staff", icon: "bi bi-person-badge" },
        { name: "Finance", icon: "bi bi-currency-dollar" },
        { name: "Settings", icon: "bi bi-gear" },
      ];
      

  return (
    <div className="container my-5">
      <div className="row g-3">
        {items.map((item, index) => (
          <div className="col-6 col-md-3" key={index}>
            <button
              className="btn btn-light w-100 py-3 border"
              style={{ borderRadius: "8px" }}
            >
              <i className={`${item.icon} d-block mb-2`} style={{ fontSize: "24px" }}></i>
              {item.name}
            </button>
          </div>
        ))}
      </div>
      <Products/>
    </div>
  );
};

export default Options;
