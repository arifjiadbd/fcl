'use client';

import { useState, useEffect } from 'react';

export default function RoughDataCheckPage() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    missingInPlayers: string[];
    missingInTournaments: string[];
    totalPlayers: number;
    totalTourNames: number;
  } | null>(null);

  useEffect(() => {
    async function checkData() {
      try {
        const res = await fetch('/api/fcl-data');
        const data = await res.json();

        const playersList: any[] = data.players || [];
        const toursList: any[] = data.tournaments || [];

        // ১. প্লেয়ার্স ডাটার নামগুলোর একটি সেট তৈরি (লোয়ারকেস ও ট্রিম করে)
        const playerNamesSet = new Set(
          playersList.map((p) => (p.name || '').trim().toLowerCase())
        );

        // ২. টুর্নামেন্ট ডাটার প্লেয়ারের নামগুলোর একটি সেট তৈরি
        const tourPlayerNamesSet = new Set(
          toursList.map((t) => (t.playerName || '').trim().toLowerCase()).filter(Boolean)
        );

        // ৩. ফাইন্ডিংস: টুর্নামেন্টে আছে কিন্তু প্লেয়ার্স লিস্টে নাই
        const missingInPlayers: string[] = [];
        tourPlayerNamesSet.forEach((name) => {
          if (!playerNamesSet.has(name)) {
            missingInPlayers.push(name);
          }
        });

        // ৪. ফাইন্ডিংস: প্লেয়ার্স লিস্টে আছে কিন্তু টুর্নামেন্ট রেকর্ডে নাই (কখনো খেলেনি বা নাম বানান ভুল)
        const missingInTournaments: string[] = [];
        playerNamesSet.forEach((name) => {
          if (!tourPlayerNamesSet.has(name)) {
            missingInTournaments.push(name);
          }
        });

        setAnalysis({
          missingInPlayers,
          missingInTournaments,
          totalPlayers: playersList.length,
          totalTourNames: tourPlayerNamesSet.size,
        });
      } catch (err) {
        console.error('Data check error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: '#fff' }}>ডাটা এনালাইসিস করা হচ্ছে...</div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', color: '#333', fontFamily: 'sans-serif' }}>
      <h1>🔍 FCL Data Diagnostic Page</h1>
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>প্লেয়ার্স ডাটাবেজ মোট</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analysis?.totalPlayers}</p>
        </div>
        <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', flex: 1 }}>
          <h3>টুর্নামেন্টে অনন্য প্লেয়ার (Unique)</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analysis?.totalTourNames}</p>
        </div>
      </div>

      <h2>⚠️ টুর্নামেন্ট রেকর্ডে আছে কিন্তু প্লেয়ার্স লিস্টে নাই ({analysis?.missingInPlayers.length} জন):</h2>
      <ul style={{ background: '#fee2e2', padding: '20px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {analysis?.missingInPlayers.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>

      <h2 style={{ marginTop: '20px' }}>ℹ️ প্লেয়ার্স লিস্টে আছে কিন্তু কোনো টুর্নামেন্ট রেকর্ডে নাম নাই ({analysis?.missingInTournaments.length} জন):</h2>
      <ul style={{ background: '#f1f5f9', padding: '20px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {analysis?.missingInTournaments.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </div>
  );
}