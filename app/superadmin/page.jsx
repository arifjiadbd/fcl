'use client';

import { useState, useEffect, useRef } from 'react';

export default function SuperAdminHub() {
  const ADMIN_PIN = "423597";
  const [enteredPin, setEnteredPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [rotation, setRotation] = useState(0);
  const [mounted, setMounted] = useState(false); // ✅ Hydration ফিক্স
  const inputRef = useRef(null);

  useEffect(() => {
    setMounted(true); // ✅ ক্লায়েন্টে মাউন্ট হওয়ার পরই true হবে
    const authStatus = localStorage.getItem('fcl_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // পিন ৬ ডিজিট হলে অটো-ভেরিফাই
  useEffect(() => {
    if (enteredPin.length === 6) {
      if (enteredPin === ADMIN_PIN) {
        setStatus('success');
        const t = setTimeout(() => {
          localStorage.setItem('fcl_admin_auth', 'true');
          setIsAuthenticated(true);
        }, 1100);
        return () => clearTimeout(t);
      } else {
        setStatus('error');
        const t = setTimeout(() => {
          setStatus('idle');
          setEnteredPin('');
          setRotation((prev) => shortestRotation(prev, 0));
        }, 900);
        return () => clearTimeout(t);
      }
    }
  }, [enteredPin]);

  // মোবাইলে কীবোর্ড খোলা রাখার জন্য অটো-ফোকাস
  useEffect(() => {
    if (mounted && !isAuthenticated && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthenticated, mounted]);

  const [selectedForm, setSelectedForm] = useState('memories');
  const [mode, setMode] = useState('add');
  const [existingRecords, setExistingRecords] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // 🌟 সার্চ কুয়েরির জন্য স্টেট

  // ✅ সমস্ত শিটের স্ক্রিপ্ট ইউআরএল
  const MEMORIES_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx3Zz8Vbr3r8aTtlpxmslqiyDXpGciX_g5NUIvDjDHK2hpxAWfBXeULtEPU4ICXYMf9uw/exec";
  const THRILLERS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzz_E-ynaL_pajp7l36WWBF7p1VvwWMhev4xTzH66A36hKg6G3Up1mNIQHBWaG9s6fA/exec";
  const FCL_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwMzgj1DMlIk45ZXw9L9Qb-e44GGFBOM0epr0zGN4TtOP2uc6cqe_nJhyBFOAf-4o2PmQ/exec";

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

  // 🌟 FCL Overall Players Data
  const [fclOverallData, setFclOverallData] = useState({
    sheetType: 'Overall',
    'FCL Player Nick Name': '',
    'Full Name': '',
    'Total Tournament': '',
    'Total Match': '',
    'Total Runs': '',
    'Total Wickets': '',
    'Innings': '',
    'Not Out': '',
    "Total 4's": '',
    "Total 6's": '',
    'Hat-Trick': '',
    'MOM (Man Of The Match)': '',
    'CPOM (T (Cool Player Of The Match) 2nd Position Of MOM': '',
    'MOT (Man Of The Tournament)': '',
    'CPOT (Cool Player Of The Tournament) 2nd Position Of MOT': '',
    'Champion': '',
    'Runner-Up': '',
    'Total Final': '',
    'Last Played Tournament': '',
    'Highest Run Scorer': '',
    'Top Wicket Taker': '',
    'Dabut Year (Month/Year)': '',
    'Dabut Tournament:': '',
    'Dabut Team Name': '',
    'Max Runs In Tournament': '',
    'Max Wickets In Tournament': '',
    'Player Image': '',
    'Birthday': ''
  });

  // 🌟 FCL Tournaments Data
  const [fclTourData, setFclTourData] = useState({
    sheetType: 'Tournaments',
    'Name': '',
    'PLAYERS': '',
    'TOURNAMENT': '',
    'Team Name Of The Player': '',
    'M': '',
    'RUN': '',
    'W': '',
    'IN': '',
    'NO': '',
    "4's": '',
    "6's": '',
    'Hat-Trick': '',
    'MOM': '',
    'CPOM/SAPOM': '',
    'MOT/CPOT': '',
    'Cham/RU': '',
    'TOURNAMENT TIME (Month-Year)': '',
    'TOP SCORER': '',
    'TOP WICKET': ''
  });

  const categoriesList = ["স্মৃতিচারণ (Memories / Nostalgia)", "গান (Song)", "কবিতা (Poem)", "গল্প (Story)", "কৌতুক (Humor)"];

  useEffect(() => {
    if (isAuthenticated) {
      let url = MEMORIES_SCRIPT_URL;
      if (selectedForm === 'extraordinary' || selectedForm === 'hvm') {
        url = THRILLERS_SCRIPT_URL;
      } else if (selectedForm === 'fcl_overall' || selectedForm === 'fcl_tournaments') {
        url = FCL_SCRIPT_URL;
      }

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (selectedForm === 'memories') setExistingRecords(data.memories || []);
          if (selectedForm === 'extraordinary') setExistingRecords(data.extraordinary || []);
          if (selectedForm === 'hvm') setExistingRecords(data.highVoltage || []);
          if (selectedForm === 'fcl_overall') setExistingRecords(data.players || []);
          if (selectedForm === 'fcl_tournaments') setExistingRecords(data.tournaments || []);
        })
        .catch(err => console.error("Error fetching sheet data:", err));
    }
  }, [isAuthenticated, selectedForm, message]);

  // 🌟 ফিল্টার করা রেকর্ডস (টাইটেল এবং অথর/প্লেয়ারের নাম দুটো দিয়েই সার্চ ও ফিল্টার হবে)
  const filteredRecords = existingRecords.filter((rec) => {
    const titleText = rec['title'] || rec['Performance Title'] || rec['Match Title'] || rec['Full Name'] || rec['name'] || rec['PLAYERS'] || '';
    const authorText = rec['author'] || rec['Player Name'] || rec['Tournament'] || '';
    const combined = `${titleText} (${authorText})`.toLowerCase();
    return combined.includes(searchQuery.toLowerCase());
  });

  const handleRecordSelect = (e) => {
    const rowIndexVal = e.target.value;
    if (rowIndexVal === "add") {
      setMode('add');
      setSelectedRowIndex(null);
      resetForms();
    } else {
      setMode('edit');
      const record = existingRecords.find(r => String(r.rowIndex) === String(rowIndexVal));
      if (!record) return;
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
      } else if (selectedForm === 'fcl_overall') {
        setFclOverallData({
          sheetType: 'Overall',
          'FCL Player Nick Name': record['FCL Player Nick Name'] || record['nickName'] || record['Nick Name'] || '',
          'Full Name': record['Full Name'] || record['name'] || '',
          'Total Tournament': record['Total Tournament'] || record['totalTournament'] || record['Total Tournaments'] || '',
          'Total Match': record['Total Match'] || record['matches'] || '',
          'Total Runs': record['Total Runs'] || record['runs'] || '',
          'Total Wickets': record['Total Wickets'] || record['wickets'] || '',
          'Innings': record['Innings'] || record['innings'] || '',
          'Not Out': record['Not Out'] || record['notOut'] || '',
          "Total 4's": record["Total 4's"] || record['fours'] || '',
          "Total 6's": record["Total 6's"] || record['sixes'] || '',
          'Hat-Trick': record['Hat-Trick'] || record['hatTricks'] || '',
          'MOM (Man Of The Match)': record['MOM (Man Of The Match)'] || record['mom'] || '',
          'CPOM (T (Cool Player Of The Match) 2nd Position Of MOM': record['CPOM (T (Cool Player Of The Match) 2nd Position Of MOM'] || record['cpom'] || '',
          'MOT (Man Of The Tournament)': record['MOT (Man Of The Tournament)'] || record['mot'] || '',
          'CPOT (Cool Player Of The Tournament) 2nd Position Of MOT': record['CPOT (Cool Player Of The Tournament) 2nd Position Of MOT'] || record['cpot'] || '',
          'Champion': record['Champion'] || record['champion'] || '',
          'Runner-Up': record['Runner-Up'] || record['runnersUp'] || '',
          'Total Final': record['Total Final'] || record['totalFinal'] || '',
          'Last Played Tournament': record['Last Played Tournament'] || record['lastPlayed'] || '',
          'Highest Run Scorer': record['Highest Run Scorer'] || record['highestRunScorer'] || '',
          'Top Wicket Taker': record['Top Wicket Taker'] || record['topWicketTaker'] || '',
          'Dabut Year (Month/Year)': record['Dabut Year (Month/Year)'] || record['debutYear'] || '',
          'Dabut Tournament:': record['Dabut Tournament:'] || record['debutTournament'] || '',
          'Dabut Team Name': record['Dabut Team Name'] || record['debutTeam'] || '',
          'Max Runs In Tournament': record['Max Runs In Tournament'] || record['maxRuns'] || '',
          'Max Wickets In Tournament': record['Max Wickets In Tournament'] || record['maxWickets'] || '',
          'Player Image': record['Player Image'] || record['photoUrl'] || '',
          'Birthday': record['Birthday'] || record['birthday'] || ''
        });
      } else if (selectedForm === 'fcl_tournaments') {
        setFclTourData({
          sheetType: 'Tournaments',
          'Name': record['Name'] || record['name'] || '',
          'PLAYERS': record['PLAYERS'] || record['playerName'] || '',
          'TOURNAMENT': record['TOURNAMENT'] || record['tournament'] || '',
          'Team Name Of The Player': record['Team Name Of The Player'] || record['team'] || '',
          'M': record['M'] || record['matches'] || '',
          'RUN': record['RUN'] || record['runs'] || '',
          'W': record['W'] || record['wickets'] || '',
          'IN': record['IN'] || record['innings'] || '',
          'NO': record['NO'] || record['notOut'] || '',
          "4's": record["4's"] || record['fours'] || '',
          "6's": record["6's"] || record['sixes'] || '',
          'Hat-Trick': record['Hat-Trick'] || record['hatTrick'] || '',
          'MOM': record['MOM'] || record['mom'] || '',
          'CPOM/SAPOM': record['CPOM/SAPOM'] || record['cpom'] || '',
          'MOT/CPOT': record['MOT/CPOT'] || record['motCpot'] || '',
          'Cham/RU': record['Cham/RU'] || record['chamRu'] || '',
          'TOURNAMENT TIME (Month-Year)': record['TOURNAMENT TIME (Month-Year)'] || record['time'] || '',
          'TOP SCORER': record['TOP SCORER'] || record['topScorer'] || '',
          'TOP WICKET': record['TOP WICKET'] || record['topWicket'] || ''
        });
      }
    }
  };

  const resetForms = () => {
    setMemoriesData({ sheetType: 'Memories', category: categoriesList[0], title: '', author: '', date: '', fbPostUrl: '', content: '' });
    setExtraData({ sheetType: 'Extraordinary Performance', part: '', matchYear: '', playerName: '', performanceTitle: '', tournamentMatch: '', description: '', facebookLink: '', photo: '' });
    setHvmData({ sheetType: 'High Voltage Matches', matchTitle: '', tournament: '', date: '', description: '', facebookLink: '', thumbnail: '' });
    setFclOverallData({
      sheetType: 'Overall', 'FCL Player Nick Name': '', 'Full Name': '', 'Total Tournament': '', 'Total Match': '', 'Total Runs': '', 'Total Wickets': '', 'Innings': '', 'Not Out': '', "Total 4's": '', "Total 6's": '', 'Hat-Trick': '', 'MOM (Man Of The Match)': '', 'CPOM (T (Cool Player Of The Match) 2nd Position Of MOM': '', 'MOT (Man Of The Tournament)': '', 'CPOT (Cool Player Of The Tournament) 2nd Position Of MOT': '', 'Champion': '', 'Runner-Up': '', 'Total Final': '', 'Last Played Tournament': '', 'Highest Run Scorer': '', 'Top Wicket Taker': '', 'Dabut Year (Month/Year)': '', 'Dabut Tournament:': '', 'Dabut Team Name': '', 'Max Runs In Tournament': '', 'Max Wickets In Tournament': '', 'Player Image': '', 'Birthday': ''
    });
    setFclTourData({
      sheetType: 'Tournaments', 'Name': '', 'PLAYERS': '', 'TOURNAMENT': '', 'Team Name Of The Player': '', 'M': '', 'RUN': '', 'W': '', 'IN': '', 'NO': '', "4's": '', "6's": '', 'Hat-Trick': '', 'MOM': '', 'CPOM/SAPOM': '', 'MOT/CPOT': '', 'Cham/RU': '', 'TOURNAMENT TIME (Month-Year)': '', 'TOP SCORER': '', 'TOP WICKET': ''
    });
  };

  const getTargetUrl = () => {
    if (selectedForm === 'memories') return MEMORIES_SCRIPT_URL;
    if (selectedForm === 'extraordinary' || selectedForm === 'hvm') return THRILLERS_SCRIPT_URL;
    if (selectedForm === 'fcl_overall' || selectedForm === 'fcl_tournaments') return FCL_SCRIPT_URL;
    return MEMORIES_SCRIPT_URL;
  };

  const handleSubmit = async (e, payload) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const targetUrl = getTargetUrl();
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
    const targetUrl = getTargetUrl();
    const currentSheetType = selectedForm === 'memories' ? 'Memories' : selectedForm === 'extraordinary' ? 'Extraordinary Performance' : selectedForm === 'hvm' ? 'High Voltage Matches' : selectedForm === 'fcl_overall' ? 'Overall' : 'Tournaments';

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetType: currentSheetType, action: 'delete', rowIndex: selectedRowIndex }),
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

  // ============ 🔵 ROTARY DIAL লজিক ============
  const DIAL_SIZE = 280;
  const CENTER = DIAL_SIZE / 2;
  const RADIUS = 108;
  const DIGIT_SIZE = 46;

  function shortestRotation(current, target) {
    let diff = (target - current) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return current + diff;
  }

  const handleDigitInput = (digitChar) => {
    if (status !== 'idle' || enteredPin.length >= 6) return;
    const d = parseInt(digitChar, 10);
    setEnteredPin(enteredPin + digitChar);
    setRotation((prev) => shortestRotation(prev, -(d * 36)));
  };

  const handleBackspace = () => {
    if (status !== 'idle' || enteredPin.length === 0) return;
    const newPin = enteredPin.slice(0, -1);
    setEnteredPin(newPin);
    if (newPin.length > 0) {
      const lastD = parseInt(newPin[newPin.length - 1], 10);
      setRotation((prev) => shortestRotation(prev, -(lastD * 36)));
    } else {
      setRotation((prev) => shortestRotation(prev, 0));
    }
  };

  const handleHiddenInputKeyDown = (e) => {
    if (status !== 'idle') { e.preventDefault(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); handleBackspace(); return; }
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); handleDigitInput(e.key); }
  };

  const ringColor = status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#2563eb';
  const lastDigit = enteredPin.length > 0 ? parseInt(enteredPin[enteredPin.length - 1], 10) : null;

  let statusText = 'কীবোর্ড দিয়ে ৬-ডিজিটের পিন দিন';
  let statusColor = '#64748b';
  if (status === 'success') { statusText = '✅ সঠিক পিন! প্রবেশ করানো হচ্ছে...'; statusColor = '#16a34a'; }
  if (status === 'error') { statusText = '❌ ভুল পিন! আবার চেষ্টা করুন'; statusColor = '#dc2626'; }
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem('fcl_admin_auth');
    setIsAuthenticated(false);
    setStatus('idle');
    setEnteredPin('');
    setRotation(0);
  };

  if (!isAuthenticated) {
    if (!mounted) {
      return (
        <div style={{ width: '100%', maxWidth: '420px', margin: '60px auto', minHeight: '560px' }} />
      );
    }

    return (
      <div style={{ width: '100%', maxWidth: '420px', margin: '60px auto', padding: '35px 25px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 40px rgba(37,99,235,0.12)', border: '1px solid #dbeafe', textAlign: 'center', boxSizing: 'border-box' }}>

        <h2 style={{ marginBottom: '6px', color: '#1d4ed8', fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px' }}>🔐 Super Admin Access</h2>
        <p style={{ marginBottom: '25px', fontSize: '13px', color: '#64748b' }}>নিরাপত্তা যাচাইয়ের জন্য ৬-ডিজিটের পিন দিন</p>

        {/* Dial */}
        <div
          onClick={() => inputRef.current && inputRef.current.focus()}
          style={{
            position: 'relative',
            width: `${DIAL_SIZE}px`,
            height: `${DIAL_SIZE}px`,
            margin: '0 auto',
            borderRadius: '50%',
            background: 'linear-gradient(145deg,#ffffff,#eff6ff)',
            border: `5px solid ${ringColor}`,
            boxShadow: status === 'idle'
              ? '0 0 0 6px #eff6ff, 0 8px 25px rgba(37,99,235,0.15)'
              : `0 0 0 6px ${ringColor}22, 0 8px 25px ${ringColor}33`,
            cursor: 'pointer',
            transition: 'border-color .4s, box-shadow .4s'
          }}
          className={status === 'success' ? 'dial-success' : ''}
        >
          {/* Pointer */}
          <div style={{
            position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: `15px solid ${ringColor}`,
            zIndex: 6, transition: 'border-color .4s'
          }} />

          {/* Rotor */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)'
          }}>
            {Array.from({ length: 10 }).map((_, d) => {
              const theta = d * 36;
              const rad = theta * Math.PI / 180;
              const x = CENTER + RADIUS * Math.sin(rad);
              const y = CENTER - RADIUS * Math.cos(rad);
              const active = d === lastDigit;
              return (
                <div
                  key={d}
                  onClick={(e) => { e.stopPropagation(); handleDigitInput(String(d)); }}
                  style={{
                    position: 'absolute',
                    left: `${x}px`, top: `${y}px`,
                    width: `${DIGIT_SIZE}px`, height: `${DIGIT_SIZE}px`,
                    transform: `translate(-50%,-50%) rotate(${-rotation}deg)`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '17px', fontWeight: 800, cursor: 'pointer', userSelect: 'none',
                    background: active ? ringColor : '#ffffff',
                    color: active ? '#ffffff' : '#1d4ed8',
                    border: `2px solid ${active ? ringColor : '#bfdbfe'}`,
                    boxShadow: active ? `0 0 12px ${ringColor}88` : '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all .3s'
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Center display */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '92px', height: '92px', borderRadius: '50%', background: '#ffffff',
            border: `3px solid ${ringColor}`, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 5,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)', transition: 'border-color .4s'
          }}>
            <span style={{ fontSize: '26px', lineHeight: 1 }}>
              {status === 'success' ? '✅' : status === 'error' ? '❌' : '🔒'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: ringColor, marginTop: '4px' }}>
              {enteredPin.length}/6
            </span>

          </div>
        </div>

        {/* Progress boxes */}
        <div className={status === 'error' ? 'pin-shake' : ''} style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              width: '36px', height: '44px', borderRadius: '8px',
              border: `2px solid ${i < enteredPin.length ? ringColor : '#cbd5e1'}`,
              background: i < enteredPin.length ? '#eff6ff' : '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: ringColor, fontWeight: 900, transition: 'all .25s'
            }}>
              {i < enteredPin.length ? '●' : ''}
            </div>
          ))}
        </div>

        <p style={{ marginTop: '18px', fontSize: '13px', fontWeight: 700, color: statusColor, minHeight: '18px', transition: 'color .3s' }}>
          {statusText}
        </p>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoFocus
          value=""
          onChange={() => {}}
          onKeyDown={handleHiddenInputKeyDown}
          onBlur={() => setTimeout(() => inputRef.current && inputRef.current.focus(), 50)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, border: 'none', outline: 'none' }}
        />

        <style jsx>{`
          @keyframes shakeAnim {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          .pin-shake { animation: shakeAnim 0.5s ease; }

          @keyframes successGlow {
            0%, 100% { box-shadow: 0 0 0 6px #dcfce7, 0 8px 25px rgba(34,197,94,0.25); }
            50% { box-shadow: 0 0 0 10px #bbf7d0, 0 8px 35px rgba(34,197,94,0.4); }
          }
          .dial-success { animation: successGlow 0.8s ease infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '30px auto', padding: '30px', background: '#ffffff', color: '#333333', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', boxSizing: 'border-box' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ color: '#0070f3', fontSize: '20px', margin: 0 }}>Super Admin Hub</h2>
          <button
            onClick={handleLogout}
            title="লগআউট করুন"
            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🔒 Logout
          </button>
        </div>

        <div>
          <select
            value={selectedForm}
            onChange={(e) => { setSelectedForm(e.target.value); setMode('add'); setSelectedRowIndex(null); setSearchQuery(''); resetForms(); setMessage(''); }}
            style={{ padding: '8px 12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <option value="memories">📝 Memories & Literary Archive</option>
            <option value="extraordinary">🔥 Extraordinary Performance Form</option>
            <option value="hvm">⚡ High Voltage Match Form</option>
            <option value="fcl_overall">🏏 FCL Overall Players Data</option>
            <option value="fcl_tournaments">🏆 FCL Tournaments Data</option>
          </select>
        </div>
      </div>

      {/* 🌟 সার্চ বক্স এবং ড্রপডাউন সেকশন (লেখক/প্লেয়ারের নাম সহ) */}
      <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>নাম বা টাইটেল দিয়ে খুঁজুন (Search Record):</label>
          <input
            type="text"
            placeholder="এখানে টাইটেল বা লেখকের নাম লিখে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>রেকর্ড সিলেক্ট করুন (এডিট বা ডিলিটের জন্য):</label>
          <select onChange={handleRecordSelect} value={selectedRowIndex !== null ? selectedRowIndex : "add"} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: '600' }}>
            <option value="add">➕ নতুন রেকর্ড যোগ করুন (Add New)</option>
            {filteredRecords.map((rec, i) => {
              const title = rec['title'] || rec['Performance Title'] || rec['Match Title'] || rec['Full Name'] || rec['name'] || rec['PLAYERS'] || `Record #${i + 1}`;
              const author = rec['author'] || rec['Player Name'] || rec['Tournament'] || '';
              const displayLabel = author ? `${title} — [লেখক/প্লেয়ার: ${author}]` : title;
              return (
                <option key={i} value={rec.rowIndex}>
                  {displayLabel}
                </option>
              );
            })}
          </select>
        </div>
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

      {selectedForm === 'fcl_overall' && (
        <form onSubmit={(e) => handleSubmit(e, fclOverallData)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Full Name:</label>
            <input type="text" value={fclOverallData['Full Name']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Full Name': e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>FCL Player Nick Name:</label>
            <input type="text" value={fclOverallData['FCL Player Nick Name']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'FCL Player Nick Name': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total Tournament:</label>
              <input type="number" value={fclOverallData['Total Tournament']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Total Tournament': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total Match:</label>
              <input type="number" value={fclOverallData['Total Match']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Total Match': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total Runs:</label>
              <input type="number" value={fclOverallData['Total Runs']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Total Runs': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total Wickets:</label>
              <input type="number" value={fclOverallData['Total Wickets']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Total Wickets': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Innings:</label>
              <input type="number" value={fclOverallData['Innings']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Innings': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Not Out:</label>
              <input type="number" value={fclOverallData['Not Out']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Not Out': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total 4's:</label>
              <input type="number" value={fclOverallData["Total 4's"]} onChange={(e) => setFclOverallData({ ...fclOverallData, "Total 4's": e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total 6's:</label>
              <input type="number" value={fclOverallData["Total 6's"]} onChange={(e) => setFclOverallData({ ...fclOverallData, "Total 6's": e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Hat-Trick:</label>
              <input type="number" value={fclOverallData['Hat-Trick']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Hat-Trick': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>MOM (Man Of The Match):</label>
              <input type="number" value={fclOverallData['MOM (Man Of The Match)']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'MOM (Man Of The Match)': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>CPOM (2nd Pos of MOM):</label>
              <input type="number" value={fclOverallData['CPOM (T (Cool Player Of The Match) 2nd Position Of MOM']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'CPOM (T (Cool Player Of The Match) 2nd Position Of MOM': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>MOT (Man Of The Tournament):</label>
              <input type="number" value={fclOverallData['MOT (Man Of The Tournament)']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'MOT (Man Of The Tournament)': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>CPOT (2nd Pos of MOT):</label>
              <input type="number" value={fclOverallData['CPOT (Cool Player Of The Tournament) 2nd Position Of MOT']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'CPOT (Cool Player Of The Tournament) 2nd Position Of MOT': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Champion:</label>
              <input type="number" value={fclOverallData['Champion']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Champion': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Runner-Up:</label>
              <input type="number" value={fclOverallData['Runner-Up']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Runner-Up': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Total Final:</label>
              <input type="number" value={fclOverallData['Total Final']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Total Final': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Highest Run Scorer:</label>
              <input type="number" value={fclOverallData['Highest Run Scorer']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Highest Run Scorer': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Top Wicket Taker:</label>
              <input type="number" value={fclOverallData['Top Wicket Taker']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Top Wicket Taker': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Last Played Tournament:</label>
            <input type="text" value={fclOverallData['Last Played Tournament']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Last Played Tournament': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Debut Year:</label>
              <input type="text" value={fclOverallData['Dabut Year (Month/Year)']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Dabut Year (Month/Year)': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Debut Tournament:</label>
              <input type="text" value={fclOverallData['Dabut Tournament:']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Dabut Tournament:': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Debut Team Name:</label>
              <input type="text" value={fclOverallData['Dabut Team Name']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Dabut Team Name': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Max Runs In Tournament:</label>
              <input type="number" value={fclOverallData['Max Runs In Tournament']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Max Runs In Tournament': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Max Wickets In Tournament:</label>
              <input type="number" value={fclOverallData['Max Wickets In Tournament']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Max Wickets In Tournament': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Player Image URL:</label>
              <input type="url" value={fclOverallData['Player Image']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Player Image': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Birthday:</label>
              <input type="text" value={fclOverallData['Birthday']} onChange={(e) => setFclOverallData({ ...fclOverallData, 'Birthday': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: mode === 'edit' ? '#d97706' : '#059669', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>
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

      {selectedForm === 'fcl_tournaments' && (
        <form onSubmit={(e) => handleSubmit(e, fclTourData)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Name (Tournament Name):</label>
            <input type="text" value={fclTourData['Name']} onChange={(e) => setFclTourData({ ...fclTourData, 'Name': e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Player Name (PLAYERS):</label>
            <input type="text" value={fclTourData['PLAYERS']} onChange={(e) => setFclTourData({ ...fclTourData, 'PLAYERS': e.target.value })} required style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Tournament:</label>
              <input type="text" value={fclTourData['TOURNAMENT']} onChange={(e) => setFclTourData({ ...fclTourData, 'TOURNAMENT': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Team Name:</label>
              <input type="text" value={fclTourData['Team Name Of The Player']} onChange={(e) => setFclTourData({ ...fclTourData, 'Team Name Of The Player': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Matches (M):</label>
              <input type="number" value={fclTourData['M']} onChange={(e) => setFclTourData({ ...fclTourData, 'M': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Runs (RUN):</label>
              <input type="number" value={fclTourData['RUN']} onChange={(e) => setFclTourData({ ...fclTourData, 'RUN': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Wickets (W):</label>
              <input type="number" value={fclTourData['W']} onChange={(e) => setFclTourData({ ...fclTourData, 'W': e.target.value })} style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: mode === 'edit' ? '#d97706' : '#059669', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>
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