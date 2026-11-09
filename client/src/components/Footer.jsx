import Logo from './Logo.jsx';

export default function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Logo size={44} />
        <p className="footer-wish">{t.footerText}</p>
        <p className="muted">{t.glossary}</p>
        <p className="muted">{t.footerNote}</p>
        <a className="btn-link" href="#/credits">{t.photoCredits}</a>
      </div>
    </footer>
  );
}
