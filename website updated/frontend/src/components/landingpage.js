import Options from "./options";
import Navbar from "./navbar";

// import Navbar from "./components/navbar";
function Landingpage(){

    return(
        <div className="app">
        <Navbar/>
        <header className="hero">
          <h1 >Experience Luxury and Comfort with SlickBooker</h1>
          
          <button style={{margin:"20px"}} className="hero-btn">Book a Room</button>
          <button className="hero-btn">Reserve a Table </button>
         
        </header>
  
        <main  className="features">
          <section className="feature">
            <img src="./images/calendar-icon.png" alt="Effortless Room Booking" />
            <h2>Effortless Room Booking</h2>
            <p>
              Simplify your booking process with our user-friendly interface that
              ensures a seamless experience.
            </p>
          </section>
  
          <section className="feature">
            <img src="./images/table-icon.png" alt="Table Reservations" />
            <h2>Table Reservations Made Easy</h2>
            <p>
              Reserve your table in advance with just a few clicks, ensuring your
              spot in the finest dining experiences.
            </p>
          </section>
  
          <section className="feature">
            <img src="./images/management-icon.png" alt="Customer Management" />
            <h2>Comprehensive Customer Management</h2>
            <p>
              Manage customer profiles and interactions efficiently with our
              comprehensive tools.
            </p>
          </section>
  
          <section className="feature">
            <img src="./images/staff-icon.png" alt="Efficient Staff" />
            <h2>Efficient Staff</h2>
            <p>
              Optimize staff schedules with ease, ensuring your team is always
              prepared and organized.
            </p>
          </section>
          <Options/>
        </main></div>
    )
}
export default Landingpage;