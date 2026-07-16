import "../styles/Contact.css";

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container contact__inner">
        <span className="eyebrow">Get in touch</span>
        <h2 className="contact__heading">
          Have a complex problem to solve?
          <br />
          Let's build something that works.
        </h2>
        <a href="mailto:markcajes24@gmail.com" className="contact__email">
          markcajes24@gmail.com
        </a>

        <div className="contact__meta mono">
          <span>Bohol, PH</span>
          <span>·</span>
          <a
            href="https://www.linkedin.com/in/john-mark-cajes-197020422/"
            aria-label="LinkedIn profile"
          >
            LinkedIn
          </a>
          <span>·</span>
          <a href="https://github.com/CajesJM" aria-label="GitHub profile">
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
