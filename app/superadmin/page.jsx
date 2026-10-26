'use client';
import { useState } from 'react';

export default function SuperAdminMemories() {
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZNDIubu-4Z7Cwc2s_giPUMa4-XEcw-ejMEdwHjbEXnCLqdyHsKOLoRKk2zX09b5hgdg/exec";

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    author: '',
    date: '',
    fbPostUrl: '',
    content: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setMessage('সফলভাবে মেমোরিজ সেভ হয়েছে!');
      setFormData({ category: '', title: '', author: '', date: '', fbPostUrl: '', content: '' });
    } catch (error) {
      console.error('Error:', error);
      setMessage('দুঃখিত, ডাটা পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '30px', background: '#ffffff', color: '#333333', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#0070f3', fontSize: '24px' }}>Memories Add Panel (Super Admin)</h2>
      
      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', background: '#e6ffed', border: '1px solid #b7eb8f', color: '#52c41a', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' }}>Category (যেমন: স্মৃতিচারণ, গান, কবিতা):</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' }}>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' }}>Author:</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' }}>Date (যেমন: 8-Sep-13):</label>
          <input type="text" name="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' }}>Facebook Post URL:</label>
          <input type="url" name="fbPostUrl" value={formData.fbPostUrl} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444' }}>Content:</label>
          <textarea name="content" value={formData.content} onChange={handleChange} rows="5" required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', resize: 'vertical' }}></textarea>
        </div>

        <button type="submit" disabled={loading} style={{ background: '#0070f3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
          {loading ? 'Sending...' : 'Submit to Google Sheet'}
        </button>
      </form>
    </div>
  );
}