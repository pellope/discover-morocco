import { useState } from 'react';
import { api } from '../api.js';
import { errorText } from '../i18n.js';

// Profil : nom, mot de passe, suppression du compte.
export default function Profile({ t, user, setUser, logout }) {
  const [name, setName] = useState(user.name);
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState(null); // { section, type, text }

  async function act(section, action, success) {
    setMessage(null);
    try {
      await action();
      if (success) setMessage({ section, type: 'success', text: success });
    } catch (err) {
      setMessage({ section, type: 'error', text: errorText(t, err.code) });
    }
  }
  const note = (section) => message?.section === section && (
    <p className={message.type === 'error' ? 'error' : 'success small'} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>
  );

  return (
    <div className="profile">
      <h1 className="page-title">{t.profileTitle}</h1>
      <p className="lead" dir="ltr">{user.email}</p>

      <form className="card" onSubmit={(e) => { e.preventDefault(); act('name', async () => setUser((await api.updateMe({ name })).user), t.profileSaved); }}>
        <div className="input-group">
          <label>
            <span>{t.name}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" />
          </label>
        </div>
        {note('name')}
        <button className="btn-primary">{t.saveProfile}</button>
      </form>

      <section className="card">
        <h2>{t.changePassword}</h2>
        {user.google ? (
          <p className="muted">{t.googleAccount}</p>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            act('password', async () => { await api.changePassword(passwords.current, passwords.next); setPasswords({ current: '', next: '' }); }, t.passwordChanged);
          }}>
            <div className="input-group">
              <label>
                <span>{t.currentPassword}</span>
                <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required autoComplete="current-password" dir="ltr" />
              </label>
              <label>
                <span>{t.newPassword}</span>
                <input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} required minLength={8} autoComplete="new-password" dir="ltr" />
              </label>
            </div>
            <small className="muted hint">{t.passwordHint}</small>
            {note('password')}
            <button className="btn-primary">{t.changePassword}</button>
          </form>
        )}
      </section>

      <section className="card danger-zone">
        <h2>{t.deleteAccount}</h2>
        <p className="muted">{t.deleteWarning}</p>
        {!confirming ? (
          <button className="btn-small danger" onClick={() => setConfirming(true)}>{t.deleteAccount}</button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); act('delete', async () => { await api.deleteAccount(deletePassword); logout(); }); }}>
            {!user.google && (
              <div className="input-group">
                <label>
                  <span>{t.password}</span>
                  <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} required autoComplete="current-password" dir="ltr" />
                </label>
              </div>
            )}
            {note('delete')}
            <div className="trip-actions">
              <button className="btn-small danger solid">{t.confirmDelete}</button>
              <button type="button" className="btn-small" onClick={() => setConfirming(false)}>{t.close}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
