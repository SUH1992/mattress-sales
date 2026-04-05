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

/**
 * Subscribe to sales with server-side filters.
 * @param {Object} filters - { startDate?, endDate?, store?, storeField?, limitCount? }
 * @param {Function} callback - receives array of sales docs
 * @returns {Function} unsubscribe
 */
export function subscribeSalesQuery(filters, callback) {
  const constraints = [where("isDeleted", "==", false)];

  if (filters.store && filters.storeField) {
    constraints.push(where(filters.storeField, "==", filters.store));
  }
  if (filters.startDate) {
    constraints.push(where("reportDate", ">=", filters.startDate));
  }
  if (filters.endDate) {
    constraints.push(where("reportDate", "<=", filters.endDate));
  }

  constraints.push(orderBy("reportDate", "desc"));

  if (filters.limitCount) {
    constraints.push(firestoreLimit(filters.limitCount));
  }

  const q = query(salesCol, ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    where("reportDate", "==", date),
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
  const q = query(salesCol, where("reportDate", "==", date), where("reportStore", "==", store), where("isDeleted", "==", false));
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
  for (const d of snap.docs) {
    const store = d.data();
    if (store.managers && store.managers.includes(email)) {
      return { storeId: d.id, ...store };
    }
  }
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
