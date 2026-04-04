import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, writeBatch, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Collections ──
const salesCol = collection(db, "salesRecords");
const empCol = collection(db, "employees");
const storesCol = collection(db, "stores");
const configCol = collection(db, "config");

// ══════════════════════════════════════
// Sales Records
// ══════════════════════════════════════
export function subscribeSales(callback) {
  const q = query(salesCol, orderBy("reportDate", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

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
// Employees
// ══════════════════════════════════════
export function subscribeEmployees(callback) {
  return onSnapshot(empCol, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

export async function updateEmployee(id, updates) {
  await updateDoc(doc(db, "employees", id), updates);
}

export async function addEmployee(emp) {
  return await addDoc(empCol, { ...emp, isActive: true });
}

// ══════════════════════════════════════
// Stores (config per store + user mapping)
// ══════════════════════════════════════
export function subscribeStores(callback) {
  return onSnapshot(storesCol, (snap) => {
    const data = {};
    snap.docs.forEach(d => { data[d.id] = d.data(); });
    callback(data);
  });
}

export async function getUserStore(email) {
  const q = query(storesCol);
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const store = d.data();
    if (store.managers && store.managers.includes(email)) {
      return { storeId: d.id, ...store };
    }
  }
  return null;
}

// ══════════════════════════════════════
// Config (multipliers, snapshots, requests)
// ══════════════════════════════════════
export function subscribeConfig(callback) {
  const ref = doc(db, "config", "settings");
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function saveConfig(data) {
  await setDoc(doc(db, "config", "settings"), data, { merge: true });
}

// ── Snapshots (weekly close) ──
const snapsCol = collection(db, "config", "settings", "snapshots");

export function subscribeSnapshots(callback) {
  const q = query(snapsCol, orderBy("closedAt", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

export async function addSnapshot(snapData) {
  return await addDoc(snapsCol, snapData);
}

// ── Requests (approvals) ──
const reqsCol = collection(db, "config", "settings", "requests");

export function subscribeRequests(callback) {
  const q = query(reqsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

export async function addRequest(req) {
  return await addDoc(reqsCol, { ...req, createdAt: new Date().toISOString() });
}

export async function updateRequest(id, updates) {
  await updateDoc(doc(db, "config", "settings", "requests", id), updates);
}
