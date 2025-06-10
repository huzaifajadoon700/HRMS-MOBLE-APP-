import React from "react";
import MainContentCarousel from "./MainContentCarousel";
import About from "./About";
import Services from "./Services";
import Rooms from "./Rooms";
// import Teams from "./Team";
import TableReservation from "./TableReservation";
import MostPopularItems from "../Menu/MostPopularItems";

export default function Home() {
  return (
    <>
      <MainContentCarousel />
      {/* <Book /> */}
      <About />
      <Rooms />
      <TableReservation/>
      <MostPopularItems/>
      <Services />
      {/* <TestimonialPage/>
       */}
      {/* <Teams /> */}
    </>
  );
}