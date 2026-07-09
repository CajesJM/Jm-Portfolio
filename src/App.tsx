import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Process from "./components/Process";
import Contact from "./components/Contact";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Process />
      </main>
      <Contact />
    </>
  );
}
