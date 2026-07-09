import "./Contact.css";

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container contact__inner">
        <span className="eyebrow">Get in touch</span>
        <h2 className="contact__heading">
          Have a hard interface problem?
          <br />
          Let's take a look at it together.
        </h2>
        <a href="mailto:hello@adareyes.design" className="contact__email">
          hello@adareyes.design
        </a>

        <div className="contact__meta mono">
          <span>Based in Manila, PH</span>
          <span>·</span>
          <a href="#" aria-label="LinkedIn profile">LinkedIn</a>
          <span>·</span>
          <a href="#" aria-label="Dribbble profile">Dribbble</a>
        </div>
      </div>
    </section>
  );
}
