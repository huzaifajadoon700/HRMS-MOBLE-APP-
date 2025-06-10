// import React from "react";

// const Products = () => {
//   const categories = ["All", "Today", "Tomorrow", "This week", "Next week", "This month"];
//   const topSectionItems = [
//     {
//       title: "Deluxe Room with Balcony",
//       subtitle: "Table for Two – 11/08/2023, 8 PM",
//       buttonText: "Book now",
//       image: "https://via.placeholder.com/200x120", // Replace with actual image URLs
//     },
//     {
//       title: "Chef’s Special (AUS)",
//       subtitle: "VIP Lounge – 10/08/2023",
//       buttonText: "Order now",
//       image: "https://via.placeholder.com/200x120",
//     },
//     {
//       title: "Business Conference (BE)",
//       subtitle: "Poolside Cabana – 10/08/2023",
//       buttonText: "Register now",
//       image: "https://via.placeholder.com/200x120",
//     },
//     {
//       title: "Champagne Brunch (UK)",
//       subtitle: "Theatre Night – This week",
//       buttonText: "RSVP now",
//       image: "https://via.placeholder.com/200x120",
//     },
//   ];

//   const bottomSectionItems = [
//     {
//       title: "HospitalityHub",
//       subtitle: "Book a room or a table",
//       buttonText: "Login",
//       image: "https://via.placeholder.com/200x120",
//     },
//     {
//       title: "Room Reservation",
//       subtitle: "Manage your bookings",
//       buttonText: "Book now",
//       image: "https://via.placeholder.com/200x120",
//     },
//     {
//       title: "Staff Management",
//       subtitle: "Efficiently manage staff",
//       buttonText: "Manage staff",
//       image: "https://via.placeholder.com/200x120",
//     },
//     {
//       title: "Customer Profiles",
//       subtitle: "Keep track of your customers",
//       buttonText: "View profiles",
//       image: "https://via.placeholder.com/200x120",
//     },
//   ];

//   return (
//     <div className="container my-4">
//       {/* Categories */}

//       <div className="d-flex justify-content-start mb-4">
//         {categories.map((category, index) => (
//           <button
//             key={index}
//             className={`btn btn-link ${
//               index === 1 ? "fw-bold text-dark" : "text-muted"
//             }`}
//           >
//             {category}
//           </button>
//         ))}
//       </div>

//       {/* Top Section */}

//       <div className="row g-3">
//         {topSectionItems.map((item, index) => (
//           <div className="col-12 col-md-6 col-lg-3" key={index}>
//             <div className="card">
//               <img src={item.image} className="card-img-top" alt={item.title} />
//               <div className="card-body">
//                 <h6 className="card-title">{item.title}</h6>
//                 <p className="card-text text-muted">{item.subtitle}</p>
//                 <button className="btn btn-primary">{item.buttonText}</button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Bottom Section */}
//       <h5 className="fw-bold mt-5">Eros faucibus duis</h5>
//       <div className="row g-3">
//         {bottomSectionItems.map((item, index) => (
//           <div className="col-12 col-md-6 col-lg-3" key={index}>
//             <div className="card">
//               <img src={item.image} className="card-img-top" alt={item.title} />
//               <div className="card-body">
//                 <h6 className="card-title">{item.title}</h6>
//                 <p className="card-text text-muted">{item.subtitle}</p>
//                 <button className="btn btn-primary">{item.buttonText}</button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Products;

import React from "react";

const Products = () => {
  const categories = [
    "All",
    "Today",
    "Tomorrow",
    "This week",
    "Next week",
    "This month",
  ];
  const topSectionItems = [
    {
      title: "Deluxe Room with Balcony",
      subtitle: "Table for Two – 11/08/2023, 8 PM",
      buttonText: "Book now",
      actionText: "View",
      image: "https://via.placeholder.com/200x120",
    },
    {
      title: "Chef’s Special (AUS)",
      subtitle: "VIP Lounge – 10/08/2023",
      buttonText: "Order now",
      actionText: "View",
      image: "https://via.placeholder.com/200x120",
    },
    {
      title: "Business Conference (BE)",
      subtitle: "Poolside Cabana – 10/08/2023",
      buttonText: "Register now",
      actionText: "View",
      image: "https://via.placeholder.com/200x120",
    },
    {
      title: "Champagne Brunch (UK)",
      subtitle: "Theatre Night – This week",
      buttonText: "RSVP now",
      actionText: "View",
      image: "https://via.placeholder.com/200x120",
    },
  ];

  const middleSectionItems = [
    {
      title: "HospitalityHub",
      subtitle: "Book a room or a table",
      buttonText: "Login",
      image: "https://via.placeholder.com/200x120",
    },
    {
      title: "Room Reservation",
      subtitle: "Manage your bookings",
      buttonText: "Book now",
      image: "https://via.placeholder.com/200x120",
    },
    {
      title: "Staff Management",
      subtitle: "Efficiently manage staff",
      buttonText: "Manage staff",
      image: "https://via.placeholder.com/200x120",
    },
    {
      title: "Customer Profiles",
      subtitle: "Keep track of your customers",
      buttonText: "View profiles",
      image: "https://via.placeholder.com/200x120",
    },
  ];

  const bottomSectionItems = [
    {
      title: "The Blue Bar",
      subtitle: "256 reservations",
      buttonText: "View",
      image: "https://via.placeholder.com/100x100",
    },
    {
      title: "The Grand Hotel",
      subtitle: "324 reservations",
      buttonText: "View",
      image: "https://via.placeholder.com/100x100",
    },
    {
      title: "Jazz Café",
      subtitle: "87 reservations",
      buttonText: "View",
      image: "https://via.placeholder.com/100x100",
    },
    {
      title: "The Glass House",
      subtitle: "49 reservations",
      buttonText: "View",
      image: "https://via.placeholder.com/100x100",
    },
    {
      title: "The Hospitality Museum",
      subtitle: "122 reservations",
      buttonText: "View",
      image: "https://via.placeholder.com/100x100",
    },
  ];

  return (
    <div className="container my-4">
      <h3>
        <span className="fw-bold">Popular</span> City
      </h3>
      {/* Categories */}
      <div className="d-flex justify-content-start mb-4">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`btn btn-link ${
              index === 1 ? "fw-bold text-dark" : "text-muted"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Top Section */}

      <div className="row g-3">
        {topSectionItems.map((item, index) => (
          <div className="col-12 col-md-6 col-lg-3" key={index}>
            <div className="card">
              <img src={item.image} className="card-img-top" alt={item.title} />
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h6 className="card-title">{item.title}</h6>
                  <button className="btn btn-outline-secondary btn-sm">
                    {item.actionText}
                  </button>
                </div>
                <p className="card-text text-muted">{item.subtitle}</p>
                <button className="btn btn-primary w-100">
                  {item.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <h5 className="fw-bold mt-5">Eros faucibus duis</h5>
      <div className="row g-3">
        {middleSectionItems.map((item, index) => (
          <div className="col-12 col-md-6 col-lg-3" key={index}>
            <div className="card">
              <img src={item.image} className="card-img-top" alt={item.title} />
              <div className="card-body">
                <h6 className="card-title">{item.title}</h6>
                <p className="card-text text-muted">{item.subtitle}</p>
                <button className="btn btn-primary w-100">
                  {item.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <h5 className="fw-bold mt-5">Recommended Venues</h5>
      <div className="row g-3">
        {bottomSectionItems.map((item, index) => (
          <div className="col-6 col-md-4 col-lg-2" key={index}>
            <div className="card text-center">
              <img
                src={item.image}
                className="card-img-top rounded-circle mx-auto mt-3"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
                alt={item.title}
              />
              <div className="card-body">
                <h6 className="card-title">{item.title}</h6>
                <p className="card-text text-muted">{item.subtitle}</p>
                <button className="btn btn-primary btn-sm">
                  {item.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
