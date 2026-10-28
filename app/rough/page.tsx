'use client';

import { useState, useEffect, useMemo } from 'react';

export default function RoughDataCheckPage() {
  const [loading, setLoading] = useState(true);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [toursList, setToursList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

        const players: any[] = data.players || [];
        const tournaments: any[] = data.tournaments || [];

        setPlayersList(players);
        setToursList(tournaments);

        // ১. প্লেয়ার্স ডাটার নামগুলোর একটি সেট তৈরি (লোয়ারকেস ও ট্রিম করে)
        const playerNamesSet = new Set(
          players.map((p) => (p.name || '').trim().toLowerCase())
        );

        // ২. টুর্নামেন্ট ডাটার প্লেয়ারের নামগুলোর একটি সেট তৈরি
        const tourPlayerNamesSet = new Set(
          tournaments.map((t) => (t.playerName || '').trim().toLowerCase()).filter(Boolean)
        );

        // ৩. ফাইন্ডিংস: টুর্নামেন্টে আছে কিন্তু প্লেয়ার্স লিস্টে নাই
        const missingInPlayers: string[] = [];
        tourPlayerNamesSet.forEach((name) => {
          if (!playerNamesSet.has(name)) {
            missingInPlayers.push(name);
          }
        });

        // ৪. ফাইন্ডিংস: প্লেয়ার্স লিস্টে আছে কিন্তু টুর্নামেন্ট রেকর্ডে নাই
        const missingInTournaments: string[] = [];
        playerNamesSet.forEach((name) => {
          if (!tourPlayerNamesSet.has(name)) {
            missingInTournaments.push(name);
          }
        });

        setAnalysis({
          missingInPlayers,
          missingInTournaments,
          totalPlayers: players.length,
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

  // সব ইউনিক টুর্নামেন্টের তালিকা বের করা
  const allUniqueTournaments = useMemo(() => {
    const toursSet = new Set<string>();
    toursList.forEach((t) => {
      if (t.tournament) {
        toursSet.add(t.tournament.trim());
      }
    });
    return Array.from(toursSet).sort();
  }, [toursList]);

  // সার্চকৃত প্লেয়ার কোন কোন টুর্নামেন্ট খেলেনি তা বের করা
  const playerMissedTournaments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { playerName: '', played: [], missed: [] };

    // প্লেয়ারের আসল নাম খুঁজে বের করা
    const matchedPlayer = playersList.find(
      (p) => (p.name || '').trim().toLowerCase().includes(q) || (p.nickName || '').trim().toLowerCase().includes(q)
    );

    if (!matchedPlayer) {
      return { playerName: searchQuery, played: [], missed: [] };
    }

    const realName = (matchedPlayer.name || '').trim().toLowerCase();

    // প্লেয়ারটি যে টুর্নামেন্টগুলোতে খেলেছে তার সেট
    const playedTours = new Set<string>();
    toursList.forEach((t) => {
      if ((t.playerName || '').trim().toLowerCase() === realName && t.tournament) {
        playedTours.add(t.tournament.trim());
      }
    });

    // যা খেলেনি (মিস করেছে)
    const missed: string[] = [];
    const played: string[] = [];

    allUniqueTournaments.forEach((tourName) => {
      if (playedTours.has(tourName)) {
        played.push(tourName);
      } else {
        missed.push(tourName);
      }
    });

    return {
      playerName: matchedPlayer.name,
      played,
      missed,
    };
  }, [searchQuery, playersList, toursList, allUniqueTournaments]);

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

      {/* নতুন ফিচার: প্লেয়ার সার্চ করে মিসিং টুর্নামেন্ট দেখা */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, color: '#0284c7' }}>🎯 প্লেয়ারভিত্তিক মিসিং টুর্নামেন্ট ফাইন্ডার</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>প্লেয়ারের নাম বা নিকনেম লিখে সার্চ করুন:</p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="যেমন: Arif Ziad..."
          style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #94a3b8', boxSizing: 'border-box', background: '#fff', color: '#000' }}
        />

        {searchQuery.trim() && (
          <div style={{ marginTop: '15px' }}>
            <p><strong>নির্বাচিত প্লেয়ার:</strong> {playerMissedTournaments.playerName || 'পাওয়া যায়নি'}</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div style={{ flex: 1, background: '#dcfce7', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>খেলেছে ({playerMissedTournaments.played.length}টি):</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', maxHeight: '150px', overflowY: 'auto' }}>
                  {playerMissedTournaments.played.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1, background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>খেলেনি / মিস করেছে ({playerMissedTournaments.missed.length}টি):</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', maxHeight: '150px', overflowY: 'auto' }}>
                  {playerMissedTournaments.missed.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
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
