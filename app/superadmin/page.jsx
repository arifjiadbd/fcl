'use client';
import { useState } from 'react';

export default function SuperAdminMemories() {
  // আপনার Apps Script এর ওয়েব অ্যাপ ইউআরএল
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
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // গুগল স্ক্রিপ্টের ক্ষেত্রে এটি জরুরি
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setMessage('সফলভাবে মেমোরিজ সেভ হয়েছে!');
      setFormData({ category: '', title: '', author: '', date: '', fbPostUrl: '', content: '' });
    } catch (error) {
      console.error('Error:', error);
      B;
      setMessage('দুঃখित, ডাটা পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
      <h2>Memories Add Panel (Super Admin)</h2>
      {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Category (যেমন: স্মৃতিচারণ, গান, কবিতা):</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Author:</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Date (যেমন: 8-Sep-13):</label>
          <input type="text" name="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Facebook Post URL:</label>
          <input type="url" name="fbPostUrl" value={formData.fbPostUrl} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Content:</label>
          <textarea name="content" value={formData.content} onChange={handleChange} rows="4" required style={{ width: '100%', padding: '8px' }}></textarea>
        </div>

        <button type="submit" disabled={loading} style={{ background: '#0070f3', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Sending...' : 'Submit to Google Sheet'}
        </button>
      </form>
    </div>
  );
}