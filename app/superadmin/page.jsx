'use client';

import { useState, useEffect } from 'react';

export default function SuperAdminHub() {
  const ADMIN_PIN = "423597";
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('fcl_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const [selectedForm, setSelectedForm] = useState('memories');
  const [mode, setMode] = useState('add');
  const [existingRecords, setExistingRecords] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // মেমোরিজ এবং থ্রিলার্সের সঠিক ওয়েব অ্যাপ ইউআরএল এখানে নিখুঁতভাবে বসানো আছে
  const MEMORIES_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZNDIubu-4Z7Cwc2s_giPUMa4-XEcw-ejMEdwHjbEXnCLqdyHsKOLoRKk2zX09b5hgdg/exec";
  const THRILLERS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdogXgY3vIhLkn7aBHFXyXzj0UL-s6NmT4GE11Q4fRn3NVA5djiqMzh29E5xxAfnJg/exec";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [memoriesData, setMemoriesData] = useState({
    sheetType: 'Memories',
    category: 'স্মৃতিচারণ (Memories / Nostalgia)', 
    title: '', author: '', date: '', fbPostUrl: '', content: ''
  });

  const [extraData, setExtraData] = useState({
    sheetType: 'Extraordinary Performance',
    part: '', matchYear: '', playerName: '', performanceTitle: '', tournamentMatch: '', description: '', facebookLink: '', photo: ''
  });

  const [hvmData, setHvmData] = useState({
    sheetType: 'High Voltage Matches',
    matchTitle: '', tournament: '', date: '', description: '', facebookLink: '', thumbnail: ''
  });

  const categoriesList = ["স্মৃতিচারণ (Memories / Nostalgia)", "গান (Song)", "কবিতা (Poem)", "গল্প (Story)", "কৌতুক (Humor)"];

  useEffect(() => {
    if (isAuthenticated) {
      const url = selectedForm === 'memories' ? MEMORIES_SCRIPT_URL : THRILLERS_SCRIPT_URL;
      
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (selectedForm === 'memories') setExistingRecords(data.memories || []);
          if (selectedForm === 'extraordinary') setExistingRecords(data.extraordinary || []);
          if (selectedForm === 'hvm') setExistingRecords(data.highVoltage || []);
        })
        .catch(err => console.error("Error fetching sheet data:", err));
    }
  }, [isAuthenticated, selectedForm, message]);

  const handleRecordSelect = (e) => {
    const idx = e.target.value;
    if (idx === "add") {
      setMode('add');
      setSelectedRowIndex(null);
      resetForms();
    } else {
      setMode('edit');
      const record = existingRecords[idx];
      setSelectedRowIndex(record.rowIndex);
      
      if (selectedForm === 'memories') {
        setMemoriesData({
          sheetType: 'Memories',
          category: record['category'] || categoriesList[0],
          title: record['title'] || '',
          author: record['author'] || '',
          date: record['date'] || '',
          fbPostUrl: record['fbPostUrl'] || '',
          content: record['content'] || ''
        });
      } else if (selectedForm === 'extraordinary') {
        setExtraData({
          sheetType: 'Extraordinary Performance',
          part: record['Part'] || '',
          matchYear: record['Match Year'] || '',
          playerName: record['Player Name'] || '',
          performanceTitle: record['Performance Title'] || '',
          tournamentMatch: record['Tournament & Match'] || '',
          description: record['Description'] || '',
          facebookLink: record['Facebook Link'] || '',
          photo: record['Photo'] || ''
        });
      } else if (selectedForm === 'hvm') {
        setHvmData({
          sheetType: 'High Voltage Matches',
          matchTitle: record['Match Title'] || '',
          tournament: record['Tournament'] || '',
          date: record['Date'] || '',
          description: record['Description'] || '',
          facebookLink: record['Facebook Link'] || '',
          thumbnail: record['Thumbnail / Photo'] || ''
        });
      }
    }
  };

  const resetForms = () => {
    setMemoriesData({ sheetType: 'Memories', category: categoriesList[0], title: '', author: '', date: '', fbPostUrl: '', content: '' });
    setExtraData({ sheetType: 'Extraordinary Performance', part: '', matchYear: '', playerName: '', performanceTitle: '', tournamentMatch: '', description: '', facebookLink: '', photo: '' });
    setHvmData({ sheetType: 'High Voltage Matches', matchTitle: '', tournament: '', date: '', description: '', facebookLink: '', thumbnail: '' });
  };

  const handleSubmit = async (e, payload) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const targetUrl = selectedForm === 'memories' ? MEMORIES_SCRIPT_URL : THRILLERS_SCRIPT_URL;
    const bodyData = { ...payload, action: mode, rowIndex: selectedRowIndex };

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      setMessage(mode === 'edit' ? 'সফলভাবে আপডেট হয়েছে!' : 'সফলভাবে নতুন ডাটা যোগ হয়েছে!');
      setMode('add');
      setSelectedRowIndex(null);
      resetForms();
    } catch (error) {
      console.error('Error:', error);
      setMessage('দুঃখিত, ডাটা প্রসেস করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRowIndex) return;
    if (!confirm("আপনি কি নিশ্চিত এই রেকর্ডটি ডিলিট করতে চান?")) return;

    setLoading(true);
    const targetUrl = selectedForm === 'memories' ? MEMORIES_SCRIPT_URL : THRILLERS_SCRIPT_URL;

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetType: memoriesData.sheetType, action: 'delete', rowIndex: selectedRowIndex }),
      });

      setMessage('সফলভাবে ডিলিট করা হয়েছে!');
      setMode('add');
      setSelectedRowIndex(null);
      resetForms();
    } catch (error) {
      console.error('Error:', error);
      setMessage('ডিলিট করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ width: '100%', maxWidth: '400px', margin: '80px auto', padding: '30px', background: '#ffffff', color: '#333333', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', textAlign: 'center', boxSizing: 'border-box' }}>
        <h2 style={{ marginBottom: '15px', color: '#0070f3', fontSize: '22px' }}>Super Admin Access</h2>
        <p style={{ marginBottom: '20px', fontSize: '13px', color: '#666' }}>অনুগ্রহ করে ৬ ডিজিটের সিকিউরিটি পিন দিন:</p>
        
        <form onSubmit={(e) => { e.preventDefault(); if (enteredPin === ADMIN_PIN) { setIsAuthenticated(true); localStorage.setItem('fcl_admin_auth', 'true'); } else setPinError(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="password" 
            maxLength={6}
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

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '30px auto', padding: '30px', background: '#ffffff', color: '#333333', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ color: '#0070f3', fontSize: '20px', margin: 0 }}>Super Admin Hub</h2>
          <button 
            onClick={() => { localStorage.removeItem('fcl_admin_auth'); setIsAuthenticated(false); }}
            title="লগআউট করুন"
            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🔒 Logout
          </button>
        </div>

        <div>
          <select 
            value={selectedForm} 
            onChange={(e) => { setSelectedForm(e.target.value); setMode('add'); setSelectedRowIndex(null); resetForms(); setMessage(''); }}
            style={{ padding: '8px 12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="memories">📝 Memories & Literary Archive</option>
            <option value="extraordinary">🔥 Extraordinary Performance Form</option>
            <option value="hvm">⚡ High Voltage Match Form</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>রেকর্ড সিলেক্ট করুন (এডিট বা ডিলিটের জন্য):</label>
        <select onChange={handleRecordSelect} value={selectedRowIndex ? existingRecords.findIndex(r => r.rowIndex === selectedRowIndex) : "add"} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: '600' }}>
          <option value="add">➕ নতুন রেকর্ড যোগ করুন (Add New)</option>
          {existingRecords.map((rec, i) => (
            <option key={i} value={i}>
              {rec['title'] || rec['Performance Title'] || rec['Match Title'] || `Record #${i + 1}`}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', background: '#e6ffed', border: '1px solid #b7eb8f', color: '#52c41a', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {selectedForm === 'memories' && (
        <form onSubmit={(e) => handleSubmit(e, memoriesData)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Category:</label>
            <select 
              value={memoriesData.category} 
              onChange={(e) => setMemoriesData({ ...memoriesData, category: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Title:</label>
            <input type="text" value={memoriesData.title} onChange={(e) => setMemoriesData({ ...memoriesData, title: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Author:</label>
            <input type="text" value={memoriesData.author} onChange={(e) => setMemoriesData({ ...memoriesData, author: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Date:</label>
            <input type="text" value={memoriesData.date} onChange={(e) => setMemoriesData({ ...memoriesData, date: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Facebook Post URL:</label>
            <input type="url" value={memoriesData.fbPostUrl} onChange={(e) => setMemoriesData({ ...memoriesData, fbPostUrl: e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Content:</label>
            <textarea value={memoriesData.content} onChange={(e) => setMemoriesData({ ...memoriesData, content: e.target.value })} rows={5} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: mode === 'edit' ? '#d97706' : '#0070f3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>
              {loading ? 'Processing...' : mode === 'edit' ? 'Update Record' : 'Add New Record'}
            </button>
            {mode === 'edit' && (
              <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#dc2626', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {selectedForm === 'extraordinary' && (
        <form onSubmit={(e) => handleSubmit(e, extraData)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Part:</label>
              <input type="text" value={extraData.part} onChange={(e) => setExtraData({ ...extraData, part: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Match Year:</label>
              <input type="text" value={extraData.matchYear} onChange={(e) => setExtraData({ ...extraData, matchYear: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Player Name:</label>
            <input type="text" value={extraData.playerName} onChange={(e) => setExtraData({ ...extraData, playerName: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Performance Title:</label>
            <input type="text" value={extraData.performanceTitle} onChange={(e) => setExtraData({ ...extraData, performanceTitle: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Tournament & Match:</label>
            <input type="text" value={extraData.tournamentMatch} onChange={(e) => setExtraData({ ...extraData, tournamentMatch: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Description:</label>
            <textarea value={extraData.description} onChange={(e) => setExtraData({ ...extraData, description: e.target.value })} rows={4} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Facebook Link:</label>
            <input type="url" value={extraData.facebookLink} onChange={(e) => setExtraData({ ...extraData, facebookLink: e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: mode === 'edit' ? '#d97706' : '#0070f3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>
              {loading ? 'Processing...' : mode === 'edit' ? 'Update Record' : 'Add New Record'}
            </button>
            {mode === 'edit' && (
              <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#dc2626', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {selectedForm === 'hvm' && (
        <form onSubmit={(e) => handleSubmit(e, hvmData)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Match Title:</label>
            <input type="text" value={hvmData.matchTitle} onChange={(e) => setHvmData({ ...hvmData, matchTitle: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Tournament:</label>
              <input type="text" value={hvmData.tournament} onChange={(e) => setHvmData({ ...hvmData, tournament: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Date:</label>
              <input type="text" value={hvmData.date} onChange={(e) => setHvmData({ ...hvmData, date: e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Description:</label>
            <textarea value={hvmData.description} onChange={(e) => setHvmData({ ...hvmData, description: e.target.value })} rows={4} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Facebook Link:</label>
            <input type="url" value={hvmData.facebookLink} onChange={(e) => setHvmData({ ...hvmData, facebookLink: e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: mode === 'edit' ? '#d97706' : '#7c3aed', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>
              {loading ? 'Processing...' : mode === 'edit' ? 'Update Record' : 'Add New Record'}
            </button>
            {mode === 'edit' && (
              <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#dc2626', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Delete
              </button>
            )}
          </div>
        </form>
      )}

    </div>
  );
}