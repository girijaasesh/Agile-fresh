'use client';

import { useEffect, useState } from 'react';
import styles from './MessagesAdmin.module.css';

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages/list');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1>Contact Messages</h1>
      <p className={styles.subtitle}>
        {messages.length} message{messages.length !== 1 ? 's' : ''} received
      </p>

      {error && <div className={styles.error}>{error}</div>}

      {messages.length === 0 ? (
        <p className={styles.noMessages}>No messages yet.</p>
      ) : (
        <div className={styles.messagesGrid}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.messageCard}>
              <div className={styles.cardHeader}>
                <h3>{msg.name}</h3>
                <span className={styles.date}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.field}>
                  <strong>Phone:</strong> {msg.phone}
                </div>
                <div className={styles.field}>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${msg.email}`}>{msg.email}</a>
                </div>
                {msg.company && (
                  <div className={styles.field}>
                    <strong>Company:</strong> {msg.company}
                  </div>
                )}
                <div className={styles.field}>
                  <strong>Message:</strong>
                  <p className={styles.message}>{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
