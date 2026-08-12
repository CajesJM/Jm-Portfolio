import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Work from "./components/Work";
import GitHubActivity from "./components/GitHubActivity";
import Experience from "./components/Experience";
import Process from "./components/Process";
import Album from "./components/Album";
import Contact from "./components/Contact";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <GitHubActivity />
        <Experience />
        <Process />
        <Album />
      </main>
      <Contact />
    </>
  );
}
