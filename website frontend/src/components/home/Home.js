import React from "react";
import MainContentCarousel from "./MainContentCarousel";
import Book from "./Book";
import About from "./About";
import Services from "./Services";
import Rooms from "./Rooms";
import Sliders from "./Slider";
// import Teams from "./Team";
import TableReservation from "./TableReservation";
import MostPopularItems from "../Menu/MostPopularItems";
import TestimonialPage from "../../pages/TestimonialPage";

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