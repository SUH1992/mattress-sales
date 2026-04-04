import { useState, useMemo, useEffect } from "react";

// ── SVG Icon Paths ──
const ic = {
  home: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z",
  plus: ["M12 5v14", "M5 12h14"],
  calendar: ["M16 2v4", "M8 2v4", "M3 10h18", "M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"],
  users: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 11a4 4 0 100-8 4 4 0 000 8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"],
  trophy: ["M6 9H4.5a2.5 2.5 0 010-5H6", "M18 9h1.5a2.5 2.5 0 000-5H18", "M4 22h16", "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22", "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22", "M18 2H6v7a6 6 0 1012 0V2z"],
  lock: ["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z", "M7 11V7a5 5 0 0110 0v4"],
  clipboard: ["M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2", "M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"],
  settings: ["M12 15a3 3 0 100-6 3 3 0 000 6z", "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  menu: ["M3 12h18", "M3 6h18", "M3 18h18"],
  x: ["M18 6L6 18", "M6 6l12 12"],
  check: "M20 6L9 17l-5-5",
  chevDown: "M6 9l6 6 6-6",
  chevL: "M15 18l-6-6 6-6",
  chevR: "M9 18l6-6-6-6",
  trendUp: ["M23 6l-9.5 9.5-5-5L1 18"],
  trendDown: ["M23 18l-9.5-9.5-5 5L1 6"],
  list: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  inbox: ["M22 12h-6l-2 3H10l-2-3H2", "M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"],
  trash: ["M3 6h18", "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"],
};

const PROMOTIONS = ["일시불", "페이케어", "렌탈"];
const DEFAULT_MULT = { "일시불": 1.3, "페이케어": 1.1, "렌탈": 1.0 };
const REGIONS_MAP = { "서울": ["강남점", "노원점", "명동점", "목동점"], "경기": ["광교점", "수원점", "동탄점", "분당점", "일산점"], "충청": ["대전둔산점", "천안점", "청주점"], "경상": ["대구수성점", "창원점", "부산센텀점"], "전라": ["광주점", "전주점", "순천점"] };
const ALL_STORES = Object.values(REGIONS_MAP).flat();
const STORE_REGION = {}; Object.entries(REGIONS_MAP).forEach(([r, ss]) => ss.forEach(s => { STORE_REGION[s] = r; }));
const POSITIONS = ["슈퍼바이저", "슈퍼매니저", "매니저", "파트타이머"];

const MOCK_EMP = [
  { id: "e1", name: "김민수", homeStore: "강남점", pos: "슈퍼매니저", isActive: true },
  { id: "e2", name: "이서연", homeStore: "강남점", pos: "매니저", isActive: true },
  { id: "e3", name: "박지훈", homeStore: "노원점", pos: "슈퍼바이저", isActive: true },
  { id: "e4", name: "최유진", homeStore: "명동점", pos: "매니저", isActive: true },
  { id: "e5", name: "정하늘", homeStore: "광교점", pos: "슈퍼매니저", isActive: true },
  { id: "e6", name: "강동현", homeStore: "수원점", pos: "파트타이머", isActive: true },
  { id: "e7", name: "윤서아", homeStore: "동탄점", pos: "슈퍼바이저", isActive: true },
  { id: "e8", name: "조민재", homeStore: "대전둔산점", pos: "매니저", isActive: true },
  { id: "e9", name: "한예슬", homeStore: "대구수성점", pos: "슈퍼매니저", isActive: true },
  { id: "e10", name: "임도윤", homeStore: "광주점", pos: "매니저", isActive: true },
  { id: "e11", name: "송태양", homeStore: "강남점", pos: "파트타이머", isActive: true },
  { id: "e12", name: "오지민", homeStore: "수원점", pos: "매니저", isActive: true },
];

const genSales = () => {
  const s = []; const now = new Date();
  for (let i = 0; i < 180; i++) {
    const emp = MOCK_EMP[Math.floor(Math.random() * MOCK_EMP.length)];
    const d = new Date(now); d.setDate(d.getDate() - Math.floor(Math.random() * 40));
    const promo = PROMOTIONS[Math.floor(Math.random() * 3)];
    const cat = Math.random() > 0.12 ? "판매" : "취소";
    const cnt = Math.floor(Math.random() * 4) + 1;
    s.push({ id: `s${i}`, reportDate: d.toISOString().split("T")[0], reportStore: emp.homeStore, homeStore: emp.homeStore, employeeName: emp.name, positionAtTime: emp.pos, promotion: promo, count: cnt, category: cat, score: Math.round(cnt * (DEFAULT_MULT[promo] || 1) * 10) / 10, region: STORE_REGION[emp.homeStore] || "기타", isDeleted: false });
  }
  return s.sort((a, b) => b.reportDate.localeCompare(a.reportDate));
};

const genSnaps = () => {
  const snaps = []; const now = new Date();
  for (let w = 0; w < 6; w++) { const d = new Date(now); d.setDate(d.getDate() - w * 7); const sr = {}; ALL_STORES.forEach(st => { sr[st] = Math.floor(Math.random() * ALL_STORES.length) + 1; }); snaps.push({ weekKey: `${d.getFullYear()}-W${String(w + 10).padStart(2, "0")}`, date: d.toISOString().split("T")[0], storeRanks: sr, closedAt: d.toISOString(), closedBy: "admin" }); }
  return snaps;
};

// ── Helpers ──
const today = () => new Date().toISOString().split("T")[0];
const getWeekRange = (ds) => { const p = ds.split("-"); const d = new Date(+p[0], +p[1] - 1, +p[2]); const day = d.getDay(); const diff = day === 0 ? 6 : day - 1; const mon = new Date(d); mon.setDate(d.getDate() - diff); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); return { start: mon.toISOString().split("T")[0], end: sun.toISOString().split("T")[0] }; };
const getWeekLabel = (ds) => { const w = getWeekRange(ds); const ms = new Date(w.start); return `${ms.getFullYear()}년 ${ms.getMonth() + 1}월 ${Math.ceil(ms.getDate() / 7)}주차`; };
const shiftWeek = (d, dir) => { const x = new Date(d); x.setDate(x.getDate() + dir * 7); return x.toISOString().split("T")[0]; };
const shiftMonth = (m, dir) => { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 1 + dir, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const shiftDay = (d, dir) => { const x = new Date(d); x.setDate(x.getDate() + dir); return x.toISOString().split("T")[0]; };

const filterByPeriod = (sales, period, opts = {}) => {
  const a = sales.filter(s => !s.isDeleted);
  if (period === "total") return a;
  if (period === "monthly") { const m = opts.month || today().slice(0, 7); return a.filter(s => s.reportDate.slice(0, 7) === m); }
  if (period === "weekly") { const w = getWeekRange(opts.weekRef || today()); return a.filter(s => s.reportDate >= w.start && s.reportDate <= w.end); }
  if (period === "daily") { const d = opts.date || today(); return a.filter(s => s.reportDate === d); }
  if (period === "custom" && opts.start && opts.end) return a.filter(s => s.reportDate >= opts.start && s.reportDate <= opts.end);
  return a;
};

const aggregate = (sales, includeCancel, groupBy, multipliers = DEFAULT_MULT) => {
  const map = {};
  sales.forEach(s => {
    const key = groupBy === "emp" ? `${s.employeeName}_${s.homeStore}` : groupBy === "store" ? s.reportStore : (s.region || "기타");
    if (!map[key]) map[key] = { name: groupBy === "emp" ? s.employeeName : (groupBy === "store" ? s.reportStore : (s.region || "기타")), store: s.homeStore, position: s.positionAtTime, region: s.region || "기타", cC: 0, cK: 0, cR: 0, sC: 0, sK: 0, sR: 0, xC: 0, xK: 0, xR: 0 };
    const m = map[key]; const isSale = s.category === "판매"; const p = s.promotion;
    if (isSale) { if (p === "일시불") { m.cC += s.count; m.sC += s.score; } else if (p.includes("페이케어")) { m.cK += s.count; m.sK += s.score; } else { m.cR += s.count; m.sR += s.score; } }
    else { if (p === "일시불") m.xC += s.count; else if (p.includes("페이케어")) m.xK += s.count; else m.xR += s.count; }
  });
  return Object.values(map).map(m => {
    m.countTotal = m.cC + m.cK + m.cR; m.scoreTotal = Math.round((m.sC + m.sK + m.sR) * 10) / 10;
    m.cancelCount = m.xC + m.xK + m.xR;
    m.netCount = m.countTotal - m.cancelCount;
    const mC = multipliers["일시불"] || 1; const mK = multipliers["페이케어"] || 1; const mR = multipliers["렌탈"] || 1;
    m.netScore = Math.round((m.sC + m.sK + m.sR - m.xC * mC - m.xK * mK - m.xR * mR) * 10) / 10;
    m.netScoreCash = Math.round((m.sC - m.xC * mC) * 10) / 10; m.netScoreCare = Math.round((m.sK - m.xK * mK) * 10) / 10; m.netScoreRental = Math.round((m.sR - m.xR * mR) * 10) / 10;
    m.netCountCash = m.cC - m.xC; m.netCountCare = m.cK - m.xK; m.netCountRental = m.cR - m.xR;
    return m;
  });
};

// ── UI Primitives ──
const Ic = ({ d, size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}</svg>;
const Badge = ({ children, color = "gray" }) => { const c = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", orange: "bg-amber-50 text-amber-700", red: "bg-rose-50 text-rose-700", gray: "bg-slate-100 text-slate-600", purple: "bg-violet-50 text-violet-700", cyan: "bg-cyan-50 text-cyan-700" }; return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${c[color]}`}>{children}</span>; };
const Btn = ({ children, onClick, v = "primary", size = "md", disabled, className = "" }) => { const vs = { primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm", secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50", danger: "bg-rose-600 text-white hover:bg-rose-700", ghost: "text-slate-600 hover:bg-slate-100", success: "bg-emerald-600 text-white hover:bg-emerald-700" }; const sz = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" }; return <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all gap-2 whitespace-nowrap select-none ${vs[v]} ${sz[size]} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${className}`}>{children}</button>; };
const Sel = ({ value, onChange, options, placeholder, className = "" }) => <div className="relative"><select value={value} onChange={e => onChange(e.target.value)} className={`w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 pr-10 ${className}`}>{placeholder && <option value="">{placeholder}</option>}{options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Ic d={ic.chevDown} size={14} /></div></div>;
const Inp = ({ value, onChange, placeholder, type = "text", className = "" }) => <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`} />;
const Card = ({ children, className = "", onClick }) => <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}>{children}</div>;
const Label = ({ children }) => <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase">{children}</label>;
const Stat = ({ label, value, sub, color = "slate" }) => { const g = { slate: "from-slate-700 to-slate-900", blue: "from-blue-600 to-blue-800", emerald: "from-emerald-600 to-emerald-800", amber: "from-amber-500 to-amber-700" }; return <div className={`bg-gradient-to-br ${g[color]} rounded-2xl p-5 text-white`}><p className="text-[11px] font-medium opacity-70 uppercase">{label}</p><p className="text-2xl font-extrabold mt-1">{value}</p>{sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}</div>; };
const Modal = ({ open, onClose, title, children }) => { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" /><div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><Ic d={ic.x} size={18} /></button></div><div className="p-5">{children}</div></div></div>; };
const Empty = ({ icon, title }) => <div className="flex flex-col items-center py-16 text-slate-400"><div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3"><Ic d={icon} size={24} /></div><p className="font-semibold text-slate-500 text-sm">{title}</p></div>;
const Toast = ({ message, onClose }) => { useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]); return <div className="fixed top-6 right-6 z-[100]" style={{ animation: "slideIn .3s ease-out" }}><div className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2"><Ic d={ic.check} size={16} />{message}</div></div>; };
const Toggle = ({ on, onToggle, labelOn, labelOff }) => <button onClick={onToggle} className="flex items-center gap-2 cursor-pointer select-none"><div className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} /></div><span className="text-sm font-medium text-slate-700">{on ? labelOn : labelOff}</span></button>;
const Tabs = ({ tabs, active, onChange }) => <div className="flex gap-1 bg-slate-100 rounded-xl p-1">{tabs.map(t => <button key={t.id} onClick={() => onChange(t.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${active === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{t.label}{t.badge > 0 && <span className="ml-1.5 text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{t.badge}</span>}</button>)}</div>;
const CB = ({ onClick, dir }) => <button onClick={onClick} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"><Ic d={dir === "l" ? ic.chevL : ic.chevR} size={16} /></button>;
const Spark = ({ data, w = 120, h = 32, color = "#3b82f6" }) => { if (!data || data.length < 2) return null; const mn = Math.min(...data); const mx = Math.max(...data) || 1; const r = mx - mn || 1; const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * h * 0.8 - h * 0.1}`).join(" "); return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>; };

// ══════════════════════════════════════
// 🏪 STORE: Dashboard
// ══════════════════════════════════════
const SDash = ({ myStore, sales, snapshots }) => {
  const ls = snapshots[0]; const ps = snapshots[1];
  const cr = ls?.storeRanks?.[myStore] || "-"; const pr = ps?.storeRanks?.[myStore] || null; const rc = pr ? pr - cr : 0;
  const td = snapshots.slice().reverse().map(sn => ALL_STORES.length - (sn.storeRanks?.[myStore] || ALL_STORES.length) + 1);
  const me = MOCK_EMP.filter(e => e.homeStore === myStore && e.isActive);
  const ms = sales.filter(s => !s.isDeleted && s.homeStore === myStore && s.reportDate.slice(0, 7) === today().slice(0, 7) && s.category === "판매");
  const msc = Math.round(ms.reduce((a, s) => a + s.score, 0) * 10) / 10;
  return <div>
    <h1 className="text-2xl font-bold text-slate-900 mb-1">{myStore} 대시보드</h1><p className="text-slate-500 text-sm mb-6">우리 매장 현황</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Stat label="이번달 점수" value={msc} color="blue" />
      <Stat label="이번달 건수" value={`${ms.reduce((a, s) => a + s.count, 0)}건`} color="emerald" />
      <Stat label="활성 직원" value={`${me.length}명`} color="slate" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-[11px] font-medium text-slate-500 uppercase">지난주 순위</p>
        <div className="flex items-baseline gap-2 mt-1"><span className="text-3xl font-extrabold">{cr}<span className="text-base font-normal text-slate-400">위</span></span>
          {rc !== 0 && <span className={`flex items-center gap-0.5 text-sm font-bold ${rc > 0 ? "text-emerald-600" : "text-rose-500"}`}><Ic d={rc > 0 ? ic.trendUp : ic.trendDown} size={14} />{rc > 0 ? "+" : ""}{rc}</span>}
        </div><p className="text-xs text-slate-400 mt-1">전체 {ALL_STORES.length}개 지점 중</p>
      </div>
    </div>
    <Card className="p-5 mb-6"><h2 className="font-bold mb-3">주간 순위 추이</h2><Spark data={td} w={200} h={40} color={rc >= 0 ? "#10b981" : "#ef4444"} /></Card>
    <Card className="p-5"><h2 className="font-bold mb-3">직원별 이번달</h2><div className="space-y-3">{me.map(emp => { const sc = ms.filter(s => s.employeeName === emp.name).reduce((a, s) => a + s.score, 0); return <div key={emp.id} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{emp.name[0]}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold text-sm">{emp.name}</span><span className="text-xs text-slate-400">{emp.pos}</span></div><div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((sc / Math.max(msc, 1)) * 100 * me.length, 100)}%` }} /></div></div><div className="text-sm font-bold tabular-nums">{Math.round(sc * 10) / 10}점</div></div>; })}</div></Card>
  </div>;
};

// ══════════════════════════════════════
// 🏪 STORE: Sales Input (GAS matrix)
// ══════════════════════════════════════
const SInput = ({ myStore, employees, multipliers, sales, onSubmit, onDeleteByDate }) => {
  const me = employees.filter(e => e.isActive && e.homeStore === myStore);
  const [date, setDate] = useState(today()); const [done, setDone] = useState(false);
  const init = () => { const m = {}; me.forEach(e => { m[e.id] = { s: { "일시불": 0, "페이케어": 0, "렌탈": 0 }, c: { "일시불": 0, "페이케어": 0, "렌탈": 0 } }; }); return m; };
  const [mx, setMx] = useState(() => init());
  useEffect(() => { setMx(init()); }, [myStore, employees]);
  const upd = (eid, type, p, val) => { const v = Math.max(0, parseInt(val) || 0); setMx(prev => ({ ...prev, [eid]: { ...prev[eid], [type]: { ...prev[eid][type], [p]: v } } })); };
  const dup = useMemo(() => sales.some(s => !s.isDeleted && s.reportStore === myStore && s.reportDate === date), [sales, myStore, date]);
  const tot = useMemo(() => { const t = { s: { "일시불": 0, "페이케어": 0, "렌탈": 0 }, c: { "일시불": 0, "페이케어": 0, "렌탈": 0 }, ts: 0, tc: 0, sc: 0 }; Object.values(mx).forEach(m => { PROMOTIONS.forEach(p => { t.s[p] += m.s[p]; t.c[p] += m.c[p]; t.ts += m.s[p]; t.tc += m.c[p]; t.sc += (m.s[p] - m.c[p]) * (multipliers[p] || 1); }); }); t.sc = Math.round(t.sc * 10) / 10; return t; }, [mx, multipliers]);
  const hasD = tot.ts > 0 || tot.tc > 0;
  const isFuture = date > today();
  const submit = () => {
    if (dup) onDeleteByDate(date, myStore);
    const batch = [];
    Object.entries(mx).forEach(([eid, m]) => { const emp = me.find(e => e.id === eid); if (!emp) return; PROMOTIONS.forEach(p => { for (let i = 0; i < (m.s[p] || 0); i++) batch.push({ reportDate: date, reportStore: myStore, homeStore: myStore, employeeName: emp.name, positionAtTime: emp.pos, promotion: p, count: 1, category: "판매", score: Math.round((multipliers[p] || 1) * 10) / 10, region: STORE_REGION[myStore] || "" }); for (let i = 0; i < (m.c[p] || 0); i++) batch.push({ reportDate: date, reportStore: myStore, homeStore: myStore, employeeName: emp.name, positionAtTime: emp.pos, promotion: p, count: 1, category: "취소", score: Math.round((multipliers[p] || 1) * 10) / 10, region: STORE_REGION[myStore] || "" }); }); });
    onSubmit(batch);
    setDone(true); setTimeout(() => { setMx(init()); setDone(false); }, 1500);
  };
  const NC = ({ value, onChange, hl }) => <input type="number" min="0" value={value || ""} placeholder="0" onChange={e => onChange(e.target.value)} className={`w-full text-center border rounded-lg px-1 py-2 text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400 ${value > 0 ? (hl === "s" ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-rose-50 border-rose-200 text-rose-700") : "bg-white border-slate-200 text-slate-400"}`} />;
  return <div>
    <h1 className="text-2xl font-bold text-slate-900 mb-1">판매 등록</h1><p className="text-slate-500 text-sm mb-6">{myStore} 판매 실적 입력</p>
    <Card className="p-4 mb-4"><div className="flex items-center gap-4 flex-wrap"><div><Label>판매일자</Label><Inp type="date" value={date} onChange={setDate} className="w-48" /></div><div className="pt-5">{isFuture ? <Badge color="red">미래 날짜 불가</Badge> : dup ? <Badge color="orange">이미 제출됨</Badge> : <Badge color="green">신규 제출 가능</Badge>}</div></div></Card>
    <Card className="overflow-hidden mb-4"><div className="overflow-x-auto"><table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200"><th colSpan={2} className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 bg-slate-50">직원</th><th colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold text-blue-700 bg-blue-50/50 border-l border-slate-200">판매</th><th colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold text-rose-600 bg-rose-50/50 border-l border-slate-200">취소</th><th className="px-3 py-2 text-center text-[11px] font-semibold bg-slate-50 border-l border-slate-200">점수</th></tr>
        <tr className="border-b border-slate-100"><th className="px-3 py-2 text-left text-[11px] text-slate-500 w-24">이름</th><th className="px-3 py-2 text-left text-[11px] text-slate-500 w-20">직급</th>{PROMOTIONS.map(p => <th key={`s${p}`} className="px-2 py-2 text-center text-[11px] text-blue-600 w-20 border-l border-slate-100">{p}</th>)}{PROMOTIONS.map(p => <th key={`c${p}`} className="px-2 py-2 text-center text-[11px] text-rose-500 w-20 border-l border-slate-100">{p}</th>)}<th className="px-3 py-2 text-center text-[11px] text-emerald-600 w-20 border-l border-slate-200">환산</th></tr>
      </thead>
      <tbody>{me.map(emp => { const m = mx[emp.id]; if (!m) return null; const sc = PROMOTIONS.reduce((a, p) => a + (m.s[p] - m.c[p]) * (multipliers[p] || 1), 0); return <tr key={emp.id} className="border-b border-slate-50"><td className="px-3 py-2 font-semibold">{emp.name}</td><td className="px-3 py-2 text-xs text-slate-500">{emp.pos}</td>{PROMOTIONS.map(p => <td key={`s${p}`} className="px-1 py-1.5 border-l border-slate-50"><NC value={m.s[p]} onChange={v => upd(emp.id, "s", p, v)} hl="s" /></td>)}{PROMOTIONS.map(p => <td key={`c${p}`} className="px-1 py-1.5 border-l border-slate-50"><NC value={m.c[p]} onChange={v => upd(emp.id, "c", p, v)} hl="c" /></td>)}<td className={`px-3 py-2 text-center font-bold tabular-nums border-l border-slate-100 ${sc > 0 ? "text-emerald-600" : sc < 0 ? "text-rose-500" : "text-slate-300"}`}>{sc !== 0 ? Math.round(sc * 10) / 10 : "-"}</td></tr>; })}</tbody>
      <tfoot><tr className="bg-slate-100 font-bold border-t-2 border-slate-300"><td colSpan={2} className="px-3 py-3">합계</td>{PROMOTIONS.map(p => <td key={`ts${p}`} className="px-3 py-3 text-center text-blue-700 tabular-nums border-l border-slate-200">{tot.s[p] || "-"}</td>)}{PROMOTIONS.map(p => <td key={`tc${p}`} className="px-3 py-3 text-center text-rose-600 tabular-nums border-l border-slate-200">{tot.c[p] || "-"}</td>)}<td className="px-3 py-3 text-center text-emerald-700 tabular-nums border-l border-slate-200">{tot.sc}</td></tr></tfoot>
    </table></div></Card>
    <Card className="p-5"><div className="flex items-center gap-6 text-sm mb-4"><span className="text-slate-500">판매: <strong className="text-blue-700">{tot.ts}건</strong></span><span className="text-slate-500">취소: <strong className="text-rose-600">{tot.tc}건</strong></span><span className="text-slate-500">점수: <strong className="text-emerald-700">{tot.sc}</strong></span></div><div className="flex gap-3">{!dup ? <Btn onClick={submit} className="flex-1" disabled={!hasD || done || isFuture}>{done ? "✓ 제출 완료" : "제출"}</Btn> : <Btn onClick={submit} v="secondary" className="flex-1" disabled={!hasD || done || isFuture}>{done ? "✓ 수정 완료" : "수정제출"}</Btn>}<Btn v="ghost" disabled={dup || isFuture}>0건 보고</Btn></div></Card>
  </div>;
};

// ══════════════════════════════════════
// 🏪 STORE: Sales Calendar (미입력일 병합)
// ══════════════════════════════════════
const SCal = ({ myStore, sales, employees, onDelete }) => {
  const [vm, setVm] = useState("monthly");
  const [cm, setCm] = useState(today().slice(0, 7));
  const [cw, setCw] = useState(today());
  const [sd, setSd] = useState(null);
  const [dm, setDm] = useState(null);
  const my = useMemo(() => sales.filter(s => !s.isDeleted && s.homeStore === myStore), [sales, myStore]);

  const ds = useMemo(() => {
    const map = {};
    my.forEach(s => { if (!map[s.reportDate]) map[s.reportDate] = { sc: 0, cc: 0, score: 0, recs: [] }; const d = map[s.reportDate]; d.recs.push(s); if (s.category === "판매") { d.sc += s.count; d.score += s.score; } else if (s.category === "취소") { d.cc += s.count; d.score -= s.score; } });
    Object.values(map).forEach(d => { d.score = Math.round(d.score * 10) / 10; });
    return map;
  }, [my]);

  const calDays = useMemo(() => {
    const [y, m] = cm.split("-").map(Number); const fd = new Date(y, m - 1, 1).getDay(); const dim = new Date(y, m, 0).getDate();
    const lead = fd === 0 ? 6 : fd - 1; const td = today(); const grid = [];
    for (let i = 0; i < lead; i++) grid.push(null);
    for (let d = 1; d <= dim; d++) { const dt = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; const dow = new Date(y, m - 1, d).getDay(); grid.push({ date: dt, day: d, isWE: dow === 0 || dow === 6, isToday: dt === td, isFut: dt > td, st: ds[dt] || null }); }
    return grid;
  }, [cm, ds]);

  const wkDays = useMemo(() => {
    const w = getWeekRange(cw); const days = []; const td = today(); const start = new Date(w.start);
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const dt = d.toISOString().split("T")[0]; const dow = d.getDay(); days.push({ date: dt, day: d.getDate(), dn: ["일", "월", "화", "수", "목", "금", "토"][dow], isWE: dow === 0 || dow === 6, isToday: dt === td, st: ds[dt] || null }); }
    return days;
  }, [cw, ds]);

  const dayDetail = useMemo(() => {
    if (!sd) return [];
    const recs = my.filter(s => s.reportDate === sd);
    const map = {};
    recs.forEach(s => { if (!map[s.employeeName]) map[s.employeeName] = { name: s.employeeName, pos: s.positionAtTime, recs: [], sales: {}, cancels: {}, ts: 0 }; const e = map[s.employeeName]; e.recs.push(s); if (s.category === "판매") { e.sales[s.promotion] = (e.sales[s.promotion] || 0) + s.count; e.ts += s.score; } else if (s.category === "취소") { e.cancels[s.promotion] = (e.cancels[s.promotion] || 0) + s.count; e.ts -= s.score; } });
    Object.values(map).forEach(e => { e.ts = Math.round(e.ts * 10) / 10; });
    return Object.values(map);
  }, [sd, my]);

  const mmiss = useMemo(() => { const [y, m] = cm.split("-").map(Number); const td = today(); let c = 0; const dim = new Date(y, m, 0).getDate(); for (let d = 1; d <= dim; d++) { const dt = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; if (dt > td) continue; const dow = new Date(y, m - 1, d).getDay(); if (dow === 0 || dow === 6) continue; if (!ds[dt]) c++; } return c; }, [cm, ds]);

  const ml = (() => { const [y, m] = cm.split("-"); return `${y}년 ${+m}월`; })();

  return <div>
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-slate-900 mb-1">판매내역</h1><p className="text-slate-500 text-sm">{myStore} 캘린더</p></div>{mmiss > 0 && vm === "monthly" && <Badge color="red">{mmiss}일 미입력</Badge>}</div>
    <Card className="p-4 mb-4"><div className="flex items-center justify-between flex-wrap gap-3">
      <Tabs tabs={[{ id: "monthly", label: "월간" }, { id: "weekly", label: "주간" }, { id: "daily", label: "일간" }]} active={vm} onChange={v => { setVm(v); if (v !== "daily") setSd(null); }} />
      <div className="flex items-center gap-2">
        {vm === "monthly" && <><CB onClick={() => setCm(p => shiftMonth(p, -1))} dir="l" /><span className="text-sm font-bold text-slate-800 min-w-[100px] text-center">{ml}</span><CB onClick={() => setCm(p => shiftMonth(p, 1))} dir="r" /></>}
        {vm === "weekly" && <><CB onClick={() => setCw(p => shiftWeek(p, -1))} dir="l" /><span className="text-sm font-bold text-slate-800 min-w-[140px] text-center">{getWeekLabel(cw)}</span><CB onClick={() => setCw(p => shiftWeek(p, 1))} dir="r" /><Btn v="ghost" size="sm" onClick={() => setCw(today())}>이번주</Btn></>}
        {vm === "daily" && <><CB onClick={() => setSd(p => shiftDay(p || today(), -1))} dir="l" /><Inp type="date" value={sd || today()} onChange={setSd} className="w-44" /><CB onClick={() => setSd(p => shiftDay(p || today(), 1))} dir="r" /><Btn v="ghost" size="sm" onClick={() => setSd(today())}>오늘</Btn></>}
      </div>
    </div></Card>

    {/* MONTHLY */}
    {vm === "monthly" && <Card className="overflow-hidden mb-4">
      <div className="grid grid-cols-7 border-b border-slate-200">{["월", "화", "수", "목", "금", "토", "일"].map(d => <div key={d} className={`px-2 py-2 text-center text-[11px] font-bold ${d === "토" || d === "일" ? "text-slate-400 bg-slate-50" : "text-slate-600 bg-slate-100"}`}>{d}</div>)}</div>
      <div className="grid grid-cols-7">{calDays.map((item, i) => {
        if (!item) return <div key={i} className="h-24 bg-slate-50/30 border-b border-r border-slate-50" />;
        const { date, day, isWE, isToday, isFut, st } = item; const miss = !isFut && !isWE && !st;
        return <div key={i} onClick={() => setSd(date)} className={`h-24 p-1.5 border-b border-r border-slate-100 cursor-pointer transition-all hover:bg-blue-50/50 ${isToday ? "ring-2 ring-inset ring-blue-400" : ""} ${sd === date ? "bg-blue-50" : ""} ${miss ? "bg-rose-50/60" : ""} ${isFut ? "opacity-40" : ""} ${isWE && !miss ? "bg-slate-50/50" : ""}`}>
          <div className={`text-xs font-bold mb-1 ${isToday ? "text-blue-600" : miss ? "text-rose-500" : isWE ? "text-slate-400" : "text-slate-600"}`}>{day}</div>
          {st ? <div><div className="text-[11px] font-bold text-emerald-600 tabular-nums">{st.score}점</div><div className="flex gap-1 mt-0.5"><span className="text-[10px] text-blue-600 bg-blue-50 rounded px-1">{st.sc}건</span>{st.cc > 0 && <span className="text-[10px] text-rose-500 bg-rose-50 rounded px-1">-{st.cc}</span>}</div></div> : (!isFut && !isWE && <div className="text-[10px] text-rose-400 font-semibold mt-1">미입력</div>)}
        </div>;
      })}</div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-6 text-sm flex-wrap">
        <span className="text-slate-500">입력: <strong>{Object.keys(ds).filter(d => d.startsWith(cm)).length}일</strong></span>
        <span className="text-slate-500">판매: <strong className="text-blue-700">{Object.entries(ds).filter(([d]) => d.startsWith(cm)).reduce((a, [, v]) => a + v.sc, 0)}건</strong></span>
        <span className="text-slate-500">점수: <strong className="text-emerald-700">{Math.round(Object.entries(ds).filter(([d]) => d.startsWith(cm)).reduce((a, [, v]) => a + v.score, 0) * 10) / 10}</strong></span>
        {mmiss > 0 && <span className="text-rose-500 font-semibold">미입력: {mmiss}일</span>}
      </div>
    </Card>}

    {/* WEEKLY */}
    {vm === "weekly" && <div className="grid grid-cols-7 gap-3 mb-4">{wkDays.map(day => {
      const miss = !day.isWE && day.date <= today() && !day.st;
      return <Card key={day.date} onClick={() => setSd(day.date)} className={`p-4 ${day.isToday ? "ring-2 ring-blue-400" : ""} ${sd === day.date ? "bg-blue-50 border-blue-200" : ""} ${miss ? "bg-rose-50 border-rose-200" : ""} ${day.isWE ? "opacity-60" : ""}`}>
        <div className="flex items-center justify-between mb-2"><span className={`text-xs font-bold ${day.isToday ? "text-blue-600" : miss ? "text-rose-500" : "text-slate-500"}`}>{day.dn}</span><span className="text-lg font-extrabold">{day.day}</span></div>
        {day.st ? <div><div className="text-lg font-extrabold text-emerald-600 tabular-nums">{day.st.score}<span className="text-xs font-normal text-slate-400">점</span></div><span className="text-[11px] font-semibold text-blue-600">{day.st.sc}건</span>{day.st.cc > 0 && <span className="text-[11px] font-semibold text-rose-500 ml-1">-{day.st.cc}</span>}</div>
          : <div className={`text-xs mt-2 font-semibold ${miss ? "text-rose-400" : "text-slate-300"}`}>{day.isWE ? "주말" : "미입력"}</div>}
      </Card>;
    })}</div>}

    {/* DAILY picker */}
    {vm === "daily" && !sd && <Card><Empty icon={ic.calendar} title="날짜를 선택하세요" /></Card>}

    {/* DAY DETAIL */}
    {sd && <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3"><h2 className="text-lg font-bold">{sd}</h2>{ds[sd] ? <Badge color="green">제출됨</Badge> : <Badge color="red">미입력</Badge>}{ds[sd] && <span className="text-sm text-slate-500">{ds[sd].sc}건 · {ds[sd].score}점</span>}</div>
        {vm !== "daily" && <button onClick={() => setSd(null)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">닫기 ✕</button>}
      </div>
      {dayDetail.length === 0 ? <Card className="p-8"><Empty icon={ic.list} title="기록 없음" /></Card> :
        <div className="space-y-3">{dayDetail.map(emp => <Card key={emp.name} className="overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{emp.name[0]}</div><span className="font-bold">{emp.name}</span><span className="text-xs text-slate-400">{emp.pos}</span></div><span className={`font-bold tabular-nums ${emp.ts >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{emp.ts}점</span></div>
          <div className="p-4"><div className="grid grid-cols-3 gap-3 mb-3">{PROMOTIONS.map(p => { const sc = emp.sales[p] || 0; const cc = emp.cancels[p] || 0; return <div key={p} className="text-center p-2 rounded-lg bg-slate-50"><div className="text-[11px] text-slate-500 font-semibold mb-1">{p}</div><div className="text-sm font-bold text-blue-700">{sc}건{cc > 0 && <span className="text-rose-500 ml-1">(-{cc})</span>}</div></div>; })}</div>
            <div className="space-y-1">{emp.recs.map(r => <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 group"><div className="flex items-center gap-2"><Badge color={r.category === "판매" ? "green" : "red"}>{r.category}</Badge><Badge color={r.promotion === "일시불" ? "blue" : r.promotion === "렌탈" ? "orange" : "purple"}>{r.promotion}</Badge><span className="text-xs text-slate-500">{r.count}건</span></div><button onClick={() => setDm(r)} className="p-1 rounded hover:bg-rose-100 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 cursor-pointer"><Ic d={ic.trash} size={14} /></button></div>)}</div>
          </div>
        </Card>)}</div>}
    </div>}
    <Modal open={!!dm} onClose={() => setDm(null)} title="삭제 확인">{dm && <div><p className="text-sm text-slate-600 mb-4"><strong>{dm.employeeName}</strong> / {dm.promotion} {dm.count}건</p><div className="flex gap-3 justify-end"><Btn v="secondary" onClick={() => setDm(null)}>취소</Btn><Btn v="danger" onClick={() => { onDelete(dm.id); setDm(null); }}>삭제</Btn></div></div>}</Modal>
  </div>;
};

// ══════════════════════════════════════
// 🏪 STORE: Employee Mgmt
// ══════════════════════════════════════
const SEmp = ({ myStore, employees, onRequest }) => {
  const [modal, setModal] = useState(null);
  const me = employees.filter(e => e.homeStore === myStore);
  const submit = () => { if (!modal) return; if (modal.type === "입사" && !modal.nn.trim()) return; onRequest({ id: `req_${Date.now()}`, type: modal.type, store: myStore, employeeName: modal.emp?.name || modal.nn.trim(), detail: modal.type === "직급변동" ? `${modal.emp?.pos} → ${modal.np}` : modal.type === "입사" ? `${modal.nn.trim()} / ${modal.np}` : "퇴사", reason: modal.reason, status: "pending", category: "직원변경", createdAt: new Date().toISOString() }); setModal(null); };
  return <div>
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-slate-900 mb-1">직원 관리</h1><p className="text-slate-500 text-sm">{myStore} 직원 변경 요청</p></div><Btn onClick={() => setModal({ type: "입사", emp: null, nn: "", np: "매니저", reason: "" })}><Ic d={ic.plus} size={16} />입사 요청</Btn></div>
    <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100">{["이름", "직급", "상태", "요청"].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead><tbody>{me.map(emp => <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{emp.name[0]}</div><span className="font-semibold">{emp.name}</span></div></td><td className="px-5 py-3 text-slate-600">{emp.pos}</td><td className="px-5 py-3"><Badge color={emp.isActive ? "green" : "red"}>{emp.isActive ? "재직" : "퇴직"}</Badge></td><td className="px-5 py-3"><div className="flex gap-2"><Btn v="ghost" size="sm" onClick={() => setModal({ type: "직급변동", emp, np: emp.pos, reason: "" })}>직급변동</Btn>{emp.isActive && <Btn v="ghost" size="sm" onClick={() => setModal({ type: "퇴사", emp, reason: "" })}>퇴사</Btn>}</div></td></tr>)}</tbody></table></Card>
    <Modal open={!!modal} onClose={() => setModal(null)} title={modal ? `${modal.type} 요청` : ""}>{modal && <div className="space-y-4">{modal.type === "입사" && <><div><Label>이름</Label><Inp value={modal.nn} onChange={v => setModal(p => ({ ...p, nn: v }))} /></div><div><Label>직급</Label><Sel value={modal.np} onChange={v => setModal(p => ({ ...p, np: v }))} options={POSITIONS} /></div></>}{modal.type === "직급변동" && <div><Label>{modal.emp?.name} 변경 직급</Label><Sel value={modal.np} onChange={v => setModal(p => ({ ...p, np: v }))} options={POSITIONS} /><p className="text-xs text-slate-400 mt-1">현재: {modal.emp?.pos}</p></div>}{modal.type === "퇴사" && <p className="text-sm"><strong>{modal.emp?.name}</strong> 퇴사 처리 요청</p>}<div><Label>사유</Label><Inp value={modal.reason} onChange={v => setModal(p => ({ ...p, reason: v }))} placeholder="사유" /></div><div className="flex gap-3 justify-end pt-2"><Btn v="secondary" onClick={() => setModal(null)}>취소</Btn><Btn onClick={submit}>요청 접수</Btn></div></div>}</Modal>
  </div>;
};

// ══════════════════════════════════════
// 🏢 HQ: Ranking
// ══════════════════════════════════════
const HRank = ({ sales, snapshots, multipliers }) => {
  const [period, setPeriod] = useState("total"); const [target, setTarget] = useState("emp"); const [ic2, setIc2] = useState(true); const [sc, setSc] = useState("score"); const [rf, setRf] = useState("");
  const [sm, setSm2] = useState(today().slice(0, 7)); const [sw, setSw] = useState(today()); const [sda, setSda] = useState(today()); const [cs, setCs] = useState(today()); const [ce, setCe] = useState(today());
  const po = useMemo(() => { if (period === "monthly") return { month: sm }; if (period === "weekly") return { weekRef: sw }; if (period === "daily") return { date: sda }; if (period === "custom") return { start: cs, end: ce }; return {}; }, [period, sm, sw, sda, cs, ce]);
  const fd = filterByPeriod(sales, period, po); let data = aggregate(fd, ic2, target, multipliers); if (rf) data = data.filter(d => d.region === rf);
  const sKey = ic2 ? "netScore" : "scoreTotal"; const cKey = ic2 ? "netCount" : "countTotal"; const sortKey = sc === "score" ? sKey : cKey;
  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey]); const mx = sorted[0]?.[sortKey] || 1;
  const pt = useMemo(() => { if (period === "total") return "전체 누적"; if (period === "monthly") { const [y, m] = sm.split("-"); return `${y}년 ${+m}월`; } if (period === "weekly") return getWeekLabel(sw); if (period === "daily") return sda; if (period === "custom") return `${cs} ~ ${ce}`; return ""; }, [period, sm, sw, sda, cs, ce]);
  const ps2 = snapshots[1]; const ls2 = snapshots[0];
  const mi = useMemo(() => { if (!ps2 || !ls2) return []; return Object.entries(ls2.storeRanks).map(([st, rk]) => ({ name: st, change: (ps2.storeRanks[st] || rk) - rk, current: rk })).filter(d => d.change > 0).sort((a, b) => b.change - a.change).slice(0, 3); }, [ps2, ls2]);
  const regions = [...new Set(sales.filter(s => !s.isDeleted).map(s => s.region).filter(Boolean))];

  return <div>
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-slate-900 mb-1">랭킹 조회</h1><p className="text-slate-500 text-sm">기간 × 대상별 순위</p></div><Toggle on={ic2} onToggle={() => setIc2(p => !p)} labelOn="취소 포함 (순)" labelOff="취소 미포함 (총)" /></div>
    {mi.length > 0 && <div className="mb-6"><h3 className="text-xs font-bold text-slate-500 uppercase mb-3">📈 전주 대비 최다 상승</h3><div className="grid grid-cols-3 gap-3">{mi.map(m => <Card key={m.name} className="p-4 border-emerald-100 bg-emerald-50/30"><div className="flex items-center justify-between"><span className="font-bold">{m.name}</span><span className="text-emerald-600 font-extrabold text-lg">+{m.change}</span></div><p className="text-xs text-slate-400 mt-1">현재 {m.current}위</p></Card>)}</div></div>}
    <div className="mb-4"><Tabs tabs={[{ id: "total", label: "총누적" }, { id: "monthly", label: "월간" }, { id: "weekly", label: "주간" }, { id: "daily", label: "일간" }, { id: "custom", label: "기간별" }]} active={period} onChange={setPeriod} /></div>
    {period !== "total" && <Card className="p-4 mb-4"><div className="flex items-center gap-3 flex-wrap">
      {period === "monthly" && <><CB onClick={() => setSm2(p => shiftMonth(p, -1))} dir="l" /><Inp type="month" value={sm} onChange={setSm2} className="w-44" /><CB onClick={() => setSm2(p => shiftMonth(p, 1))} dir="r" /></>}
      {period === "weekly" && <><CB onClick={() => setSw(p => shiftWeek(p, -1))} dir="l" /><div className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-semibold">{getWeekLabel(sw)}</div><CB onClick={() => setSw(p => shiftWeek(p, 1))} dir="r" /><span className="text-xs text-slate-400 ml-2">{(() => { const w = getWeekRange(sw); return `${w.start} ~ ${w.end}`; })()}</span><Btn v="ghost" size="sm" onClick={() => setSw(today())}>이번주</Btn></>}
      {period === "daily" && <><CB onClick={() => setSda(p => shiftDay(p, -1))} dir="l" /><Inp type="date" value={sda} onChange={setSda} className="w-44" /><CB onClick={() => setSda(p => shiftDay(p, 1))} dir="r" /><Btn v="ghost" size="sm" onClick={() => setSda(today())}>오늘</Btn></>}
      {period === "custom" && <><div><Label>시작</Label><Inp type="date" value={cs} onChange={setCs} className="w-44" /></div><span className="text-slate-400 font-bold pt-5">~</span><div><Label>종료</Label><Inp type="date" value={ce} onChange={setCe} className="w-44" /></div></>}
    </div></Card>}
    <div className="flex items-center gap-2 mb-4"><div className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">{pt}</div><span className="text-xs text-slate-400">{fd.length}건</span></div>
    <Card className="p-4 mb-4"><div className="flex items-center justify-between flex-wrap gap-3"><Tabs tabs={[{ id: "emp", label: "👤 개인" }, { id: "store", label: "🏪 지점" }, { id: "region", label: "🗺️ 권역" }]} active={target} onChange={setTarget} /><div className="flex items-center gap-3">{target !== "region" && <Sel value={rf} onChange={setRf} options={regions} placeholder="전체 권역" className="w-36" />}<div className="flex gap-1 bg-slate-100 rounded-lg p-0.5"><button onClick={() => setSc("score")} className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${sc === "score" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>점수순</button><button onClick={() => setSc("count")} className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${sc === "count" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>건수순</button></div></div></div></Card>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 bg-slate-50/50"><th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase w-12">#</th><th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">{target === "emp" ? "직원" : target === "store" ? "지점" : "권역"}</th>{target === "emp" && <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">소속</th>}{target === "emp" && <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">직급</th>}<th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase">일시불</th><th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase">페이케어</th><th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase">렌탈</th><th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase">{sc === "score" ? "총점수" : "총건수"}</th><th className="px-4 py-3 w-32" /></tr></thead><tbody>
      {sorted.length === 0 ? <tr><td colSpan={9}><Empty icon={ic.trophy} title="데이터 없음" /></td></tr> : sorted.map((r, i) => { const sv = sc === "score"; return <tr key={r.name + r.store} className="border-b border-slate-50 hover:bg-blue-50/30"><td className="px-4 py-3"><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</div></td><td className="px-4 py-3 font-bold">{r.name}</td>{target === "emp" && <td className="px-4 py-3"><Badge color="gray">{r.store}</Badge></td>}{target === "emp" && <td className="px-4 py-3 text-xs text-slate-500">{r.position}</td>}<td className="px-4 py-3 text-right tabular-nums">{sv ? (ic2 ? r.netScoreCash : r.sC) : (ic2 ? r.netCountCash : r.cC)}</td><td className="px-4 py-3 text-right tabular-nums">{sv ? (ic2 ? r.netScoreCare : r.sK) : (ic2 ? r.netCountCare : r.cK)}</td><td className="px-4 py-3 text-right tabular-nums">{sv ? (ic2 ? r.netScoreRental : r.sR) : (ic2 ? r.netCountRental : r.cR)}</td><td className="px-4 py-3 text-right font-extrabold text-emerald-600 tabular-nums">{r[sortKey]}</td><td className="px-4 py-3"><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${(r[sortKey] / mx) * 100}%` }} /></div></td></tr>; })}
    </tbody></table></div></Card>
  </div>;
};

// ══════════════════════════════════════
// 🏢 HQ: Weekly Close
// ══════════════════════════════════════
const HClose = ({ snapshots, setSnapshots, sales, multipliers }) => {
  const [cm, setCm] = useState(false); const wk = getWeekRange(today()); const wl = getWeekLabel(today());
  const doClose = () => { const sr = {}; const ws = sales.filter(s => !s.isDeleted && s.reportDate >= wk.start && s.reportDate <= wk.end); const sa = aggregate(ws, true, "store", multipliers).sort((a, b) => b.netScore - a.netScore); sa.forEach((s, i) => { sr[s.name] = i + 1; }); setSnapshots(prev => [{ weekKey: wl, date: today(), storeRanks: sr, closedAt: new Date().toISOString(), closedBy: "admin" }, ...prev]); setCm(false); };
  return <div>
    <h1 className="text-2xl font-bold text-slate-900 mb-1">주간 마감</h1><p className="text-slate-500 text-sm mb-6">랭킹 스냅샷 확정</p>
    <Card className="p-6 mb-6"><div className="flex items-center justify-between"><div><p className="text-sm">{wl}</p><p className="text-xs text-slate-400">{wk.start} ~ {wk.end}</p></div><Btn onClick={() => setCm(true)}><Ic d={ic.lock} size={16} />마감</Btn></div></Card>
    <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">이력</h2>
    <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100">{["주차", "마감일시", "상태"].map(h => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead><tbody>{snapshots.map(sn => <tr key={sn.weekKey} className="border-b border-slate-50"><td className="px-4 py-3 font-bold">{sn.weekKey}</td><td className="px-4 py-3 text-xs text-slate-500">{new Date(sn.closedAt).toLocaleString("ko-KR")}</td><td className="px-4 py-3"><Badge color="green">확정</Badge></td></tr>)}</tbody></table></Card>
    <Modal open={cm} onClose={() => setCm(false)} title="마감 확인"><p className="text-sm mb-4">{wl} 확정합니다.</p><div className="flex gap-3 justify-end"><Btn v="secondary" onClick={() => setCm(false)}>취소</Btn><Btn onClick={doClose}>확정</Btn></div></Modal>
  </div>;
};

// ══════════════════════════════════════
// 🏢 HQ: Approvals
// ══════════════════════════════════════
const HApprove = ({ requests, setRequests, employees, setEmployees }) => {
  const [tf, setTf] = useState("all"); const [sf, setSf] = useState("pending");
  const fd = requests.filter(r => (tf === "all" || r.category === tf) && (sf === "all" || r.status === sf));
  const pc = requests.filter(r => r.status === "pending").length;
  const approve = (req) => { setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "approved", processedAt: new Date().toISOString() } : r)); if (req.type === "퇴사") setEmployees(prev => prev.map(e => e.name === req.employeeName && e.homeStore === req.store ? { ...e, isActive: false } : e)); else if (req.type === "직급변동") { const np = req.detail.split(" → ")[1]; if (np) setEmployees(prev => prev.map(e => e.name === req.employeeName && e.homeStore === req.store ? { ...e, pos: np } : e)); } else if (req.type === "입사") { const [name, pos] = req.detail.split(" / "); setEmployees(prev => [...prev, { id: `e_${Date.now()}`, name, homeStore: req.store, pos: pos || "매니저", isActive: true }]); } };
  const reject = (req) => setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "rejected" } : r));
  return <div>
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-slate-900 mb-1">승인센터</h1><p className="text-slate-500 text-sm">가입 및 직원 변경 요청</p></div>{pc > 0 && <Badge color="red">{pc}건 대기</Badge>}</div>
    <Card className="p-4 mb-6"><div className="flex items-center gap-4 flex-wrap"><Tabs tabs={[{ id: "all", label: "전체", badge: pc }, { id: "가입승인", label: "가입" }, { id: "직원변경", label: "직원변경" }]} active={tf} onChange={setTf} /><div className="ml-auto"><Tabs tabs={[{ id: "pending", label: "대기" }, { id: "approved", label: "승인" }, { id: "rejected", label: "반려" }, { id: "all", label: "전체" }]} active={sf} onChange={setSf} /></div></div></Card>
    {fd.length === 0 ? <Card><Empty icon={ic.inbox} title="요청 없음" /></Card> : <div className="space-y-3">{fd.map(req => <Card key={req.id} className="p-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 mb-1 flex-wrap"><Badge color={req.category === "가입승인" ? "cyan" : "blue"}>{req.category}</Badge><Badge color={req.type === "입사" ? "green" : req.type === "퇴사" ? "red" : "purple"}>{req.type || req.category}</Badge><span className="font-bold">{req.employeeName}</span>{req.store && <Badge color="gray">{req.store}</Badge>}</div><p className="text-sm text-slate-600">{req.detail}</p>{req.reason && <p className="text-xs text-slate-400 mt-1">사유: {req.reason}</p>}</div><div className="flex gap-2 shrink-0 ml-4">{req.status === "pending" ? <><Btn v="success" size="sm" onClick={() => approve(req)}>승인</Btn><Btn v="danger" size="sm" onClick={() => reject(req)}>반려</Btn></> : <Badge color={req.status === "approved" ? "green" : "red"}>{req.status === "approved" ? "승인" : "반려"}</Badge>}</div></div></Card>)}</div>}
  </div>;
};

// ══════════════════════════════════════
// 🏢 HQ: Settings
// ══════════════════════════════════════
const HSet = ({ multipliers, setMultipliers }) => {
  const [d, setD] = useState({ ...multipliers }); const [sv, setSv] = useState(false);
  const save = () => { setMultipliers({ ...d }); setSv(true); setTimeout(() => setSv(false), 2000); };
  const ch = JSON.stringify(d) !== JSON.stringify(multipliers);
  return <div className="max-w-xl mx-auto">
    <h1 className="text-2xl font-bold text-slate-900 mb-1">환산점수 설정</h1><p className="text-slate-500 text-sm mb-6">프로모션별 계수</p>
    <Card className="p-6"><div className="space-y-6">{PROMOTIONS.map(p => <div key={p} className="flex items-center justify-between"><div><div className="font-bold">{p}</div><div className="text-xs text-slate-400">건수 × {d[p]}</div></div><div className="flex items-center gap-3"><input type="range" min="0.5" max="2.0" step="0.1" value={d[p]} onChange={e => setD(prev => ({ ...prev, [p]: parseFloat(e.target.value) }))} className="w-32 accent-slate-900" /><span className="text-2xl font-extrabold w-16 text-center">×{d[p]}</span></div></div>)}</div>
      <div className="mt-6 flex gap-3"><Btn onClick={save} disabled={!ch} className="flex-1">{sv ? "✓ 저장됨" : "저장"}</Btn>{ch && <Btn v="secondary" onClick={() => setD({ ...multipliers })}>초기화</Btn>}</div>
    </Card>
  </div>;
};

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
const SNAV = [{ id: "s-dash", label: "대시보드", icon: ic.home }, { id: "s-input", label: "판매 등록", icon: ic.plus }, { id: "s-cal", label: "판매내역", icon: ic.calendar }, { id: "s-emp", label: "직원 관리", icon: ic.users }];
const HNAV = [{ id: "h-rank", label: "랭킹 조회", icon: ic.trophy }, { id: "h-close", label: "주간 마감", icon: ic.lock }, { id: "h-approve", label: "승인센터", icon: ic.clipboard }, { id: "h-set", label: "환산점수", icon: ic.settings }];

export default function App() {
  const [role, setRole] = useState("store"); const [page, setPage] = useState("s-dash"); const [sideOpen, setSideOpen] = useState(false); const [toast, setToast] = useState(null);
  const [myStore, setMyStore] = useState("강남점"); const [mult, setMult] = useState({ ...DEFAULT_MULT });
  const [sales, setSales] = useState(() => genSales()); const [emps, setEmps] = useState(MOCK_EMP);
  const [reqs, setReqs] = useState([{ id: "r0", type: "가입", category: "가입승인", employeeName: "new@gmail.com", store: "강남점", detail: "접근 요청", reason: "신규", status: "pending", createdAt: new Date().toISOString() }]);
  const [snaps, setSnaps] = useState(() => genSnaps());
  const show = (msg) => setToast({ message: msg });
  const nav = role === "store" ? SNAV : HNAV;
  useEffect(() => { setPage(role === "store" ? "s-dash" : "h-rank"); }, [role]);
  const addSale = (batch) => { setSales(prev => [...batch.map((s, i) => ({ ...s, id: `s${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`, isDeleted: false })), ...prev]); };
  const delSale = (id) => { setSales(prev => prev.map(s => s.id === id ? { ...s, isDeleted: true } : s)); show("삭제 완료"); };
  const delSaleByDate = (date, store) => { setSales(prev => prev.map(s => (!s.isDeleted && s.reportStore === store && s.reportDate === date) ? { ...s, isDeleted: true } : s)); };
  const addReq = (r) => { setReqs(prev => [r, ...prev]); show("요청 접수"); };
  const pc = reqs.filter(r => r.status === "pending").length;

  const rp = () => {
    switch (page) {
      case "s-dash": return <SDash myStore={myStore} sales={sales} snapshots={snaps} />;
      case "s-input": return <SInput myStore={myStore} employees={emps} multipliers={mult} sales={sales} onSubmit={addSale} onDeleteByDate={delSaleByDate} />;
      case "s-cal": return <SCal myStore={myStore} sales={sales} employees={emps} onDelete={delSale} />;
      case "s-emp": return <SEmp myStore={myStore} employees={emps} onRequest={addReq} />;
      case "h-rank": return <HRank sales={sales} snapshots={snaps} multipliers={mult} />;
      case "h-close": return <HClose snapshots={snaps} setSnapshots={setSnaps} sales={sales} multipliers={mult} />;
      case "h-approve": return <HApprove requests={reqs} setRequests={setReqs} employees={emps} setEmployees={setEmps} />;
      case "h-set": return <HSet multipliers={mult} setMultipliers={setMult} />;
      default: return null;
    }
  };

  return <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif" }}>
    <div className={`fixed inset-y-0 left-0 z-40 w-60 transform transition-transform duration-300 lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"} ${role === "store" ? "bg-slate-900" : "bg-indigo-950"}`}>
      <div className="px-5 py-4 border-b border-white/10"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">{role === "store" ? "🏪" : "🏢"}</div><div><div className="text-white font-bold text-sm">{role === "store" ? myStore : "본사"}</div><div className="text-[10px] text-white/40 uppercase tracking-widest">{role === "store" ? "Store" : "HQ"}</div></div></div></div>
      <div className="px-3 py-3 border-b border-white/10"><div className="flex gap-1 bg-white/5 rounded-xl p-1">{[{ v: "store", l: "🏪 지점" }, { v: "hq", l: "🏢 본사" }].map(r => <button key={r.v} onClick={() => { setRole(r.v); setSideOpen(false); }} className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer ${role === r.v ? "bg-white/15 text-white" : "text-white/40"}`}>{r.l}</button>)}</div>{role === "store" && <select value={myStore} onChange={e => setMyStore(e.target.value)} className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none">{ALL_STORES.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}</select>}</div>
      <nav className="px-3 py-3 space-y-0.5">{nav.map(item => <button key={item.id} onClick={() => { setPage(item.id); setSideOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${page === item.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}><Ic d={item.icon} size={17} /><span>{item.label}</span>{item.id === "h-approve" && pc > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{pc}</span>}</button>)}</nav>
    </div>
    {sideOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSideOpen(false)} />}
    <div className="lg:ml-60">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100"><div className="flex items-center justify-between px-5 py-3"><div className="flex items-center gap-3"><button onClick={() => setSideOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer"><Ic d={ic.menu} size={20} /></button><div><h2 className="font-bold text-sm">{nav.find(n => n.id === page)?.label}</h2><p className="text-[11px] text-slate-400">{role === "store" ? myStore : "본사"}</p></div></div><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[11px] text-slate-400">Mock</span></div></div></header>
      <main className="p-5 max-w-6xl mx-auto">{rp()}</main>
    </div>
    {toast && <Toast {...toast} onClose={() => setToast(null)} />}
  </div>;
}
