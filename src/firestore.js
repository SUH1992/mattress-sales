import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, onSnapshot, writeBatch, getDoc, setDoc, limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Collections ──
const salesCol = collection(db, "salesRecords");
const empCol = collection(db, "employees");
const storesCol = collection(db, "stores");
const configCol = collection(db, "config");

// ══════════════════════════════════════
// Sales Records — query-based loading
// ══════════════════════════════════════

// Convert "YYYY-MM-DD" string to Date for Firestore Timestamp comparison
const toDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const toDateEnd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 23, 59, 59, 999); };

/**
 * Subscribe to sales with server-side filters.
 * Only 2 query patterns (matching 2 composite indexes):
 *   Pattern A: isDeleted + reportDate range + orderBy(reportDate desc)
 *   Pattern B: isDeleted + reportStore + reportDate range + orderBy(reportDate desc)
 *
 * @param {Object} filters - { startDate, endDate, store?, limitCount? }
 * @param {Function} callback - receives array of sales docs
 * @returns {Function} unsubscribe
 */
export function subscribeSalesQuery(filters, callback) {
  const constraints = [where("isDeleted", "==", false)];

  if (filters.store) {
    constraints.push(where("reportStore", "==", filters.store));
  }

  const start = filters.startDate || "2000-01-01";
  const end = filters.endDate || "2099-12-31";
  constraints.push(where("reportDate", ">=", toDate(start)));
  constraints.push(where("reportDate", "<=", toDateEnd(end)));
  constraints.push(orderBy("reportDate", "desc"));

  if (filters.limitCount) {
    constraints.push(firestoreLimit(filters.limitCount));
  }

  const q = query(salesCol, ...constraints);
  console.log("[Firestore] subscribeSalesQuery →", { store: filters.store || "(전체)", field: filters.store ? "reportStore" : "(none)", startDate: start, endDate: end, startAsDate: toDate(start).toISOString(), endAsDate: toDateEnd(end).toISOString() });
  return onSnapshot(q, (snap) => {
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`[Firestore] 쿼리 결과: ${results.length}건`, results.length === 0 ? "⚠️ 데이터 없음" : `첫 번째: ${JSON.stringify({ reportDate: results[0].reportDate, reportStore: results[0].reportStore, homeStore: results[0].homeStore })}`);
    callback(results);
  }, (error) => {
    console.error("[Firestore] ❌ 쿼리 에러:", error.message, { store: filters.store, startDate: filters.startDate, endDate: filters.endDate });
  });
}

/**
 * Check if sales exist for a given date + store (one-off query).
 * @returns {Promise<boolean>}
 */
export async function checkDuplicate(date, store) {
  const q = query(
    salesCol,
    where("isDeleted", "==", false),
    where("reportStore", "==", store),
    where("reportDate", ">=", toDate(date)),
    where("reportDate", "<=", toDateEnd(date)),
    firestoreLimit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ── Write operations ──

export async function addSalesBatch(records) {
  const batch = writeBatch(db);
  records.forEach((rec) => {
    const ref = doc(salesCol);
    batch.set(ref, { ...rec, isDeleted: false, createdAt: new Date().toISOString() });
  });
  await batch.commit();
}

export async function softDeleteSale(id) {
  await updateDoc(doc(db, "salesRecords", id), { isDeleted: true });
}

export async function softDeleteSalesByDate(date, store) {
  const q = query(salesCol, where("isDeleted", "==", false), where("reportStore", "==", store), where("reportDate", ">=", toDate(date)), where("reportDate", "<=", toDateEnd(date)));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { isDeleted: true }));
  await batch.commit();
}

// ══════════════════════════════════════
// Employees — one-time load + manual refresh
// ══════════════════════════════════════

export async function loadEmployees() {
  const snap = await getDocs(empCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateEmployee(id, updates) {
  await updateDoc(doc(db, "employees", id), updates);
}

export async function addEmployee(emp) {
  return await addDoc(empCol, { ...emp, isActive: true });
}

// ══════════════════════════════════════
// Stores — CRUD
// ══════════════════════════════════════

export async function loadStores() {
  const snap = await getDocs(storesCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addStore(data) {
  return await addDoc(storesCol, { ...data, isActive: true });
}

export async function updateStore(id, updates) {
  await updateDoc(doc(db, "stores", id), updates);
}

// ══════════════════════════════════════
// Change Logs — audit trail
// ══════════════════════════════════════
const changeLogsCol = collection(db, "changeLogs");

export async function addChangeLog(entry) {
  await addDoc(changeLogsCol, { ...entry, createdAt: new Date().toISOString() });
}

export async function getUserStore(email) {
  const snap = await getDocs(storesCol);
  console.log(`[getUserStore] 이메일: ${email}, stores 문서 수: ${snap.docs.length}`);
  for (const d of snap.docs) {
    const store = d.data();
    console.log(`[getUserStore] 문서 ID: "${d.id}", name: "${store.name || "(없음)}", email: "${store.email || "(없음)}", managers: [${(store.managers || []).join(", ")}]`);
    if (store.email === email || (store.managers && store.managers.includes(email))) {
      const storeName = store.name || d.id;
      console.log(`[getUserStore] ✅ 매칭! storeId: "${d.id}", storeName: "${storeName}"`);
      return { storeId: d.id, storeName, ...store };
    }
  }
  console.log(`[getUserStore] ❌ 매칭되는 지점 없음`);
  return null;
}

// ══════════════════════════════════════
// Admin emails — check HQ role
// ══════════════════════════════════════

export async function loadAdminEmails() {
  const snap = await getDoc(doc(db, "config", "admin"));
  if (snap.exists() && snap.data().adminEmails) return snap.data().adminEmails;
  return [];
}

// ══════════════════════════════════════
// Approval Requests (가입 요청)
// ══════════════════════════════════════
const approvalCol = collection(db, "approvalRequests");

export async function checkPendingApproval(email) {
  const q = query(approvalCol, where("requestorEmail", "==", email), where("status", "==", "pending"), firestoreLimit(1));
  const snap = await getDocs(q);
  return !snap.empty ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
}

export async function submitApprovalRequest(data) {
  return await addDoc(approvalCol, { ...data, status: "pending", createdAt: new Date().toISOString() });
}

export function subscribeApprovalRequests(callback) {
  const q = query(approvalCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function updateApprovalRequest(id, updates) {
  await updateDoc(doc(db, "approvalRequests", id), updates);
}

export async function addStoreManager(storeId, email) {
  const ref = doc(db, "stores", storeId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const current = snap.data().managers || [];
    if (!current.includes(email)) {
      await updateDoc(ref, { managers: [...current, email] });
    }
  }
}

// ══════════════════════════════════════
// Config — one-time load + save
// ══════════════════════════════════════

export async function loadConfig() {
  const snap = await getDoc(doc(db, "config", "settings"));
  return snap.exists() ? snap.data() : {};
}

export async function saveConfig(data) {
  await setDoc(doc(db, "config", "settings"), data, { merge: true });
}

// ── Snapshots (weekly close) — real-time ──
const snapsCol = collection(db, "config", "settings", "snapshots");

export function subscribeSnapshots(callback) {
  const q = query(snapsCol, orderBy("closedAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addSnapshot(snapData) {
  return await addDoc(snapsCol, snapData);
}

// ── Requests (approvals) — real-time ──
const reqsCol = collection(db, "config", "settings", "requests");

export function subscribeRequests(callback) {
  const q = query(reqsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addRequest(req) {
  return await addDoc(reqsCol, { ...req, createdAt: new Date().toISOString() });
}

export async function updateRequest(id, updates) {
  await updateDoc(doc(db, "config", "settings", "requests", id), updates);
}
