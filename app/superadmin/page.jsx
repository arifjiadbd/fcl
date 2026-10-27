'use client';
import { useState } from 'react';

export default function SuperAdminMemories() {
  // সিকিউরিটি পিন (আপনার পছন্দমতো পরিবর্তন করতে পারেন, যেমন: "123456")
  const ADMIN_PIN = "123456";
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // ফর্ম সিলেকশন ড্রপডাউন স্টেট
  const [selectedForm, setSelectedForm] = useState('memories');

  // Memories ফর্মের স্টেট
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZNDIubu-4Z7Cwc2s_giPUMa4-XEcw-ejMEdwHjbEXnCLqdyHsKOLoRKk2zX09b5hgdg/exec";

  const [formData, setFormData] = useState({
    category: 'স্মৃতিচারণ (Memories / Nostalgia)', 
    title: '',
    author: '',
    date: '',
    fbPostUrl: '',
    content: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categoriesList = [
    "স্মৃতিচারণ (Memories / Nostalgia)",
    "গান (Song)",
    "কবিতা (Poem)",
    "গল্প (Story)",
    "কৌতুক (Humor)"
  ];

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

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

      setMessage('সফলভাবে মেমোরিজ সেভ হয়েছে!');
      setFormData({ 
        category: 'স্মৃতিচারণ (Memories / Nostalgia)', 
        title: '', 
        author: '', 
        date: '', 
        fbPostUrl: '', 
        content: '' 
      });
    } catch (error) {
      console.error('Error:', error);
      setMessage('দুঃখিত, ডাটা পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // যদি পিন ভেরিফাই না হয়, তবে লগইন পিন স্ক্রিন দেখাবে
  if (!isAuthenticated) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        margin: '80px auto', 
        padding: '30px', 
        background: '#ffffff', 
        color: '#333333', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0',
        textAlign: 'center',
        boxSizing: 'border-box' 
      }}>
        <h2 style={{ marginBottom: '15px', color: '#0070f3', fontSize: '22px' }}>Super Admin Access</h2>
        <p style={{ marginBottom: '20px', fontSize: '13px', color: '#666' }}>অনুগ্রহ করে ৬ ডিজিটের সিকিউরিটি পিন দিন:</p>
        
        <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="password" 
            maxLength="6"
            value={enteredPin} 
            onChange={(e) => setEnteredPin(e.target.value)} 
            placeholder="Enter 6-digit PIN" 
            required 
            style={{ width: '100%', padding: '12px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ background: '#0070f3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
            Unlock Panel
          </button>
        </form>
        {pinError && <p style={{ color: '#ef4444', marginTop: '12px', fontSize: '13px', fontWeight: 'bold' }}>ভুল পিন! আবার চেষ্টা করুন।</p>}
      </div>
    );
  }

  // পিন সঠিক হলে ড্যাশবোর্ড ও ড্রপডাউন ফর্ম সিস্টেম দেখাবে
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '650px', 
      margin: '30px auto', 
      padding: '30px', 
      background: '#ffffff', 
      color: '#333333', 
      borderRadius: '12px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
      border: '1px solid #e0e0e0',
      boxSizing: 'border-box' 
    }}>
      {/* টপ হেডার ও ফর্ম সিলেকশন ড্রপডাউন */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <h2 style={{ color: '#0070f3', fontSize: '20px', margin: 0 }}>Super Admin Hub</h2>
        
        <div>
          <select 
            value={selectedForm} 
            onChange={(e) => setSelectedForm(e.target.value)}
            style={{ padding: '8px 12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="memories">📝 Memories & Literary Archive</option>
            <option value="matchdir">🏏 Match Directory Form</option>
            <option value="hvmmatch">⚡ HVM Match Form</option>
          </select>
        </div>
      </div>

      {/* ১. Memories ফর্ম */}
      {selectedForm === 'memories' && (
        <div>
          <h3 style={{ marginBottom: '20px', textAlign: 'center', color: '#0070f3', fontSize: '22px' }}>Memories Add Panel (Super Admin)</h3>
          
          {message && (
            <div style={{ padding: '10px', marginBottom: '15px', background: '#e6ffed', border: '1px solid #b7eb8f', color: '#52c41a', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' }}>Category (বিভাগ নির্বাচন করুন):</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' }}>Title:</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' }}>Author:</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' }}>Date (যেমন: 8-Sep-13):</label>
              <input type="text" name="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' }}>Facebook Post URL:</label>
              <input type="url" name="fbPostUrl" value={formData.fbPostUrl} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#444', fontSize: '14px' }}>Content:</label>
              <textarea name="content" value={formData.content} onChange={handleChange} rows="5" required style={{ width: '100%', padding: '10px 12px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
            </div>

            <button type="submit" disabled={loading} style={{ background: '#0070f3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', width: '100%', boxSizing: 'border-box' }}>
              {loading ? 'Sending...' : 'Submit to Google Sheet'}
            </button>
          </form>
        </div>
      )}

      {/* ২. Match Directory ফর্ম */}
      {selectedForm === 'matchdir' && (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Match Directory Manager</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>এই ফর্মটি খুব শীঘ্রই যুক্ত করা হবে।</p>
        </div>
      )}

      {/* ৩. HVM Match ফর্ম */}
      {selectedForm === 'hvmmatch' && (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>HVM Match Manager</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>এই ফর্মটি খুব শীঘ্রই যুক্ত করা হবে।</p>
        </div>
      )}
    </div>
  );
}