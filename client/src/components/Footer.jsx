export default function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-wish">{t.footerText}</p>
        <p className="muted">{t.footerNote}</p>
        <a className="btn-link" href="#/credits">{t.photoCredits}</a>
      </div>
    </footer>
  );
}
