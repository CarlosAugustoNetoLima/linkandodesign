export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Linkando Design",
    url: "https://linkandodesign.com",
    logo: "https://linkandodesign.com/logo.svg",
    description:
      "Estúdio de design de marca e desenvolvimento web: identidade visual, criação de site, landing page, redesign e sistemas internos. 9 anos, clientes em 5 países. Diagnóstico gratuito.",
    areaServed: ["Brasil", "Portugal", "França", "Cabo Verde", "Estados Unidos"],
    knowsLanguage: ["pt-BR", "en"],
    serviceType: ["Identidade visual", "Criação de site", "Landing page", "Redesign de site", "Sistemas internos"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
