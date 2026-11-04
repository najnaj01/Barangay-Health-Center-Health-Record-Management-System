import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEY = "barangay-health-center-demo-v1";
const roles = ["Nurse", "Doctor", "Records Officer", "Admin"];

const makeDate = (offset, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date;
};
const localDateTime = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};
const dateOnly = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const yearsFrom = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return dateOnly(result);
};
const optionalText = (value) => {
  const text = String(value ?? "").trim();
  return text || null;
};

function createDemoData() {
  const today = makeDate(0);
  const tomorrow = makeDate(1, 10);
  return {
    patients: [
      { id: "BHC-2026-001", firstName: "Maria", lastName: "Santos", dob: "1988-04-15", gender: "Female", address: "Purok 2, Barangay San Isidro", contactNo: "09XX-XXX-0142", emergencyContactName: "Ramon Santos", emergencyContactPhone: "09XX-XXX-0143", createdAt: dateOnly(makeDate(-24)) },
      { id: "BHC-2026-002", firstName: "Jose", lastName: "Reyes", dob: "1976-11-02", gender: "Male", address: "Purok 4, Barangay San Isidro", contactNo: "09XX-XXX-0288", emergencyContactName: "Lina Reyes", emergencyContactPhone: "09XX-XXX-0289", createdAt: dateOnly(makeDate(-19)) },
      { id: "BHC-2026-003", firstName: "Angela", lastName: "Dela Cruz", dob: "2001-07-21", gender: "Female", address: "Purok 1, Barangay San Isidro", contactNo: "09XX-XXX-0331", emergencyContactName: "Luz Dela Cruz", emergencyContactPhone: "09XX-XXX-0332", createdAt: dateOnly(makeDate(-12)) },
      { id: "BHC-2026-004", firstName: "Pedro", lastName: "Garcia", dob: "1965-02-08", gender: "Male", address: "Purok 5, Barangay San Isidro", contactNo: "09XX-XXX-0475", emergencyContactName: "Ana Garcia", emergencyContactPhone: "09XX-XXX-0476", createdAt: dateOnly(makeDate(-8)) },
      { id: "BHC-2026-005", firstName: "Liza", lastName: "Mendoza", dob: "1993-09-30", gender: "Female", address: "Purok 3, Barangay San Isidro", contactNo: "09XX-XXX-0520", emergencyContactName: "Nora Mendoza", emergencyContactPhone: "09XX-XXX-0521", createdAt: dateOnly(makeDate(-3)) },
    ],
    staff: [
      { id: 1, name: "Dr. Elena Cruz", email: "doctor@example.test", role: "Doctor", active: true },
      { id: 2, name: "Nurse Ana Lim", email: "nurse@example.test", role: "Nurse", active: true },
      { id: 3, name: "R. Villanueva", email: "records@example.test", role: "Records Officer", active: true },
      { id: 4, name: "BHC Administrator", email: "admin@example.test", role: "Admin", active: true },
    ],
    appointments: [
      { id: 1, patientId: "BHC-2026-001", date: localDateTime(today), reason: "Follow-up visit", status: "Confirmed" },
      { id: 2, patientId: "BHC-2026-002", date: localDateTime(tomorrow), reason: "Routine check-up", status: "Pending" },
      { id: 3, patientId: "BHC-2026-003", date: localDateTime(makeDate(2, 13)), reason: "Health consultation", status: "Pending" },
    ],
    consultations: [
      { id: 1, patientId: "BHC-2026-001", doctorId: 1, appointmentId: null, visitDate: localDateTime(makeDate(-2, 10)), complaint: "Routine follow-up", bp: "118/76", temperature: "36.7", weight: "58.4", vitalsBy: 2, icd10: "Z00.0", diagnosis: "General examination", notes: "Follow-up documented for demonstration.", prescriptions: [] },
      { id: 2, patientId: "BHC-2026-004", doctorId: 1, appointmentId: null, visitDate: localDateTime(makeDate(-6, 14)), complaint: "Feeling unwell", bp: "126/82", temperature: "37.0", weight: "70.1", vitalsBy: 2, icd10: "Z71.1", diagnosis: "Consultation for explanation of examination findings", notes: "Example record only. Review the patient's history as appropriate.", prescriptions: [] },
    ],
    retention: [
      { id: 1, patientId: "BHC-2026-001", type: "Outpatient", schedule: "7 years after last consultation — verify locally", created: dateOnly(makeDate(-24)), expires: yearsFrom(makeDate(-2), 7), legalHold: false, status: "Active", reviewedBy: null },
      { id: 2, patientId: "BHC-2026-004", type: "Outpatient", schedule: "7 years after last consultation — verify locally", created: dateOnly(makeDate(-8)), expires: yearsFrom(makeDate(-6), 7), legalHold: true, status: "Archived", reviewedBy: 3 },
    ],
    audit: [
      { id: 1, userId: 2, patientId: "BHC-2026-005", action: "Viewed patient record", at: localDateTime(makeDate(0, 8)) },
      { id: 2, userId: 2, patientId: "BHC-2026-001", action: "Updated appointment", at: localDateTime(makeDate(-1, 15)) },
      { id: 3, userId: 3, patientId: "BHC-2026-004", action: "Reviewed retention status", at: localDateTime(makeDate(-2, 11)) },
    ],
  };
}

function loadDemoData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: createDemoData(), warning: "" };
    const data = JSON.parse(saved);
    if (!data || !Array.isArray(data.patients) || !Array.isArray(data.staff) || !Array.isArray(data.appointments) || !Array.isArray(data.consultations) || !Array.isArray(data.retention) || !Array.isArray(data.audit)) {
      throw new Error("Saved demo data has an unexpected structure.");
    }
    return { data, warning: "" };
  } catch {
    return { data: createDemoData(), warning: "Browser storage is unavailable or saved data could not be read. Changes may not persist." };
  }
}

const tableDefinitions = [
  { name: "PATIENTS", pk: "patient_id", fk: "—", fields: "first_name, last_name, dob, gender, address, contact_no, emergency_contact_name, emergency_contact_phone, created_at" },
  { name: "STAFF_USERS", pk: "user_id", fk: "—", fields: "full_name, role, email (unique), password_hash, is_active" },
  { name: "APPOINTMENTS", pk: "appointment_id", fk: "patient_id → PATIENTS", fields: "appointment_date, reason_for_visit, status" },
  { name: "CONSULTATIONS", pk: "consultation_id", fk: "patient_id → PATIENTS; doctor_id → STAFF_USERS; appointment_id → APPOINTMENTS (optional, unique); vitals_recorded_by → STAFF_USERS (optional)", fields: "visit_date, chief_complaint, vitals_bp, vitals_temp, vitals_weight, diagnosis_icd10, diagnosis, clinical_notes" },
  { name: "PRESCRIPTIONS", pk: "prescription_id", fk: "consultation_id → CONSULTATIONS", fields: "medicine_name, dosage, frequency, duration_days" },
  { name: "AUDIT_LOGS", pk: "log_id", fk: "user_id → STAFF_USERS; patient_id → PATIENTS (optional)", fields: "action_taken, action_at" },
  { name: "MEDICAL_RECORDS_RETENTION", pk: "retention_id", fk: "patient_id → PATIENTS; reviewed_by → STAFF_USERS (optional)", fields: "record_type, retention_schedule, record_creation_date, retention_expiration_date, legal_hold, status" },
];

const demoIcd10Reference = [
  { code: "Z00.0", description: "General examination" },
  { code: "Z71.1", description: "Consultation for explanation of examination findings" },
];

const relationships = [
  ["PATIENTS", "APPOINTMENTS", "1 : N", "Appointment requires one patient; a patient may have none or many."],
  ["PATIENTS", "CONSULTATIONS", "1 : N", "Consultation requires one patient; a patient may have none or many."],
  ["STAFF_USERS (Doctor)", "CONSULTATIONS", "1 : N", "Consultation requires one responsible doctor."],
  ["STAFF_USERS (Recorder)", "CONSULTATIONS", "1 : N", "Vital-sign recorder is optional."],
  ["APPOINTMENTS", "CONSULTATIONS", "1 : 0..1", "Appointment link is optional and unique per consultation."],
  ["CONSULTATIONS", "PRESCRIPTIONS", "1 : N", "Prescription requires one consultation."],
  ["STAFF_USERS", "AUDIT_LOGS", "1 : N", "Log entry requires one staff account."],
  ["PATIENTS", "AUDIT_LOGS", "1 : N", "Patient reference on a log entry is optional."],
  ["PATIENTS", "MEDICAL_RECORDS_RETENTION", "1 : N", "Retention entry requires one patient."],
  ["STAFF_USERS (Reviewer)", "MEDICAL_RECORDS_RETENTION", "1 : N", "Retention reviewer is optional."],
];

const navigation = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "patients", label: "Patients", icon: "people" },
  { id: "appointments", label: "Appointments", icon: "calendar" },
  { id: "consultations", label: "Consultations", icon: "clipboard", roles: ["Nurse", "Doctor"] },
  { id: "records", label: "Record lifecycle", icon: "archive", roles: ["Records Officer", "Admin"] },
  { id: "database", label: "Database design", icon: "database" },
  { id: "staff", label: "Staff & audit", icon: "shield", roles: ["Admin"] },
];

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" /></>,
    archive: <><path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function App() {
  const [loaded] = useState(loadDemoData);
  const [data, setData] = useState(loaded.data);
  const dataRef = useRef(loaded.data);
  const [storageWarning, setStorageWarning] = useState(loaded.warning);
  const [page, setPage] = useState("overview");
  const [role, setRole] = useState("Nurse");
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [modal, setModal] = useState("");
  const [editingConsultationId, setEditingConsultationId] = useState(null);
  const [notice, setNotice] = useState("");

  const updateData = (updater) => {
    const next = updater(dataRef.current);
    dataRef.current = next;
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setStorageWarning("This browser could not save the demo data. Changes will be lost when you close this tab.");
    }
  };

  const logAction = (action, patientId = null) => {
    updateData((current) => ({
      ...current,
      audit: [{ id: Date.now(), userId: current.staff.find((member) => member.role === role)?.id || 1, patientId, action, at: localDateTime(new Date()) }, ...current.audit],
    }));
  };
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3800);
  };
  const patientName = (id) => {
    const patient = data.patients.find((item) => item.id === id);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient";
  };
  const staffName = (id) => data.staff.find((item) => item.id === Number(id))?.name || "Unassigned";
  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.patients.filter((patient) => !term || `${patient.id} ${patient.firstName} ${patient.lastName} ${patient.contactNo}`.toLowerCase().includes(term));
  }, [data.patients, search]);
  const selectedPatient = data.patients.find((patient) => patient.id === selectedPatientId);
  const upcomingAppointments = data.appointments.filter((item) => item.status !== "Cancelled" && new Date(item.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const openPage = (next) => {
    setPage(next);
    setSearch("");
    setSelectedPatientId("");
    setModal("");
  };

  const addPatient = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName")).trim();
    const lastName = String(form.get("lastName")).trim();
    const dob = String(form.get("dob"));
    const duplicate = data.patients.find((patient) => patient.firstName.toLowerCase() === firstName.toLowerCase() && patient.lastName.toLowerCase() === lastName.toLowerCase() && patient.dob === dob);
    if (duplicate) {
      showNotice(`Possible duplicate found: ${duplicate.id}. Check that record before registering again.`);
      return;
    }
    const id = `BHC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const newPatient = {
      id, firstName, lastName, dob, gender: optionalText(form.get("gender")), address: optionalText(form.get("address")),
      contactNo: optionalText(form.get("contactNo")), emergencyContactName: optionalText(form.get("emergencyContactName")),
      emergencyContactPhone: optionalText(form.get("emergencyContactPhone")), createdAt: dateOnly(new Date()),
    };
    updateData((current) => ({ ...current, patients: [newPatient, ...current.patients] }));
    logAction("Registered patient", id);
    setModal("");
    setSelectedPatientId(id);
    showNotice("Patient record added to this demo workspace.");
  };

  const addAppointment = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    if (new Date(date) < new Date()) {
      showNotice("Choose a date and time that is not in the past.");
      return;
    }
    const item = { id: Date.now(), patientId: String(form.get("patientId")), date, reason: String(form.get("reason")).trim(), status: "Pending" };
    updateData((current) => ({ ...current, appointments: [item, ...current.appointments] }));
    logAction("Scheduled appointment", item.patientId);
    setModal("");
    showNotice("Appointment scheduled with Pending status.");
  };

  const addConsultation = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (role === "Nurse" && !String(form.get("bp") || form.get("temperature") || form.get("weight")).trim()) {
      showNotice("Enter at least one vital sign before saving.");
      return;
    }
    const existing = data.consultations.find((item) => item.id === editingConsultationId);
    const assignedDoctorId = role === "Doctor" ? data.staff.find((member) => member.role === "Doctor" && member.active)?.id : Number(form.get("doctorId"));
    if (!data.staff.some((member) => member.id === assignedDoctorId && member.role === "Doctor" && member.active)) {
      showNotice("An active Doctor account is required to document a consultation.");
      return;
    }
    const consultation = {
      id: existing?.id || Date.now(), patientId: existing?.patientId || String(form.get("patientId")), doctorId: existing?.doctorId || assignedDoctorId,
      appointmentId: existing?.appointmentId || (form.get("appointmentId") ? Number(form.get("appointmentId")) : null),
      visitDate: existing?.visitDate || localDateTime(new Date()), complaint: role === "Doctor" ? String(form.get("complaint") || "").trim() : existing?.complaint || "",
      bp: optionalText(form.get("bp") || existing?.bp), temperature: optionalText(form.get("temperature") || existing?.temperature), weight: optionalText(form.get("weight") || existing?.weight),
      vitalsBy: existing?.vitalsBy || ((form.get("bp") || form.get("temperature") || form.get("weight")) ? data.staff.find((member) => member.role === role && member.active)?.id : null),
      icd10: role === "Doctor" ? optionalText(form.get("icd10")) : existing?.icd10 || null,
      diagnosis: role === "Doctor" ? optionalText(form.get("diagnosis")) : existing?.diagnosis || null,
      notes: role === "Doctor" ? optionalText(form.get("notes")) : existing?.notes || null,
      prescriptions: role === "Doctor" && form.get("medicine") ? [{ medicine: String(form.get("medicine")).trim(), dosage: optionalText(form.get("dosage")), frequency: optionalText(form.get("frequency")), duration: optionalText(form.get("duration")) }] : existing?.prescriptions || [],
    };
    updateData((current) => {
      const consultations = existing ? current.consultations.map((item) => item.id === existing.id ? consultation : item) : [consultation, ...current.consultations];
      const next = { ...current, consultations };
      if (!existing && !current.retention.some((entry) => entry.patientId === consultation.patientId)) {
        const now = new Date();
        next.retention = [{ id: Date.now() + 1, patientId: consultation.patientId, type: "Outpatient", schedule: "Facility schedule to be confirmed", created: dateOnly(now), expires: yearsFrom(now, 7), legalHold: false, status: "Active", reviewedBy: null }, ...current.retention];
      }
      if (consultation.appointmentId) {
        next.appointments = current.appointments.map((appointment) => appointment.id === consultation.appointmentId ? { ...appointment, status: "Completed" } : appointment);
      }
      return next;
    });
    logAction(existing ? "Completed consultation documentation" : role === "Nurse" ? "Recorded vital signs" : "Encoded consultation", consultation.patientId);
    setModal("");
    setEditingConsultationId(null);
    showNotice(existing ? "Doctor documentation saved to the consultation." : role === "Nurse" ? "Vital signs recorded and assigned to a Doctor for documentation." : "Consultation saved to the demo record.");
  };

  const updateAppointment = (appointmentId, status) => {
    updateData((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === appointmentId ? { ...item, status } : item) }));
    const item = data.appointments.find((appointment) => appointment.id === appointmentId);
    logAction(`Appointment status changed to ${status}`, item?.patientId);
    showNotice(`Appointment marked ${status.toLowerCase()}.`);
  };

  const updateRetention = (entry, changes) => {
    if (changes.status === "Scheduled_For_Destruction" && (entry.legalHold || entry.expires > dateOnly(new Date()))) {
      showNotice(entry.legalHold ? "A legal hold prevents scheduling this record for destruction." : "The retention expiration date has not passed. Keep the record active or archived.");
      return;
    }
    const reviewer = data.staff.find((member) => member.role === role)?.id || null;
    updateData((current) => ({ ...current, retention: current.retention.map((item) => item.id === entry.id ? { ...item, ...changes, reviewedBy: reviewer } : item) }));
    logAction("Reviewed record lifecycle status", entry.patientId);
    showNotice("Lifecycle review saved. Records are never destroyed automatically.");
  };

  const toggleStaff = (id) => {
    const member = data.staff.find((item) => item.id === id);
    if (!member) return;
    updateData((current) => ({ ...current, staff: current.staff.map((item) => item.id === id ? { ...item, active: !item.active } : item) }));
    logAction(`${member.active ? "Deactivated" : "Reactivated"} staff account`);
    showNotice(`Staff account ${member.active ? "deactivated" : "reactivated"}.`);
  };

  const addStaff = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    if (data.staff.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      showNotice("That email address is already in the demo staff list.");
      return;
    }
    const member = { id: Date.now(), name: String(form.get("name")).trim(), email, role: String(form.get("role")), active: true };
    updateData((current) => ({ ...current, staff: [...current.staff, member] }));
    logAction("Created staff account");
    setModal("");
    showNotice("Demo staff entry created. Production account setup requires secure server-side handling.");
  };

  const resetDemo = () => {
    if (!window.confirm("Restore the sample workspace? All locally saved demo changes will be replaced.")) return;
    updateData(() => createDemoData());
    setStorageWarning("");
    setSelectedPatientId("");
    showNotice("Sample workspace restored.");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); openPage("overview"); }}>
          <span className="brand-mark"><span /></span>
          <span><strong>Barangay Health Center</strong><small>Health Record Management System</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.filter((item) => !item.roles || item.roles.includes(role)).map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => openPage(item.id)} aria-current={page === item.id ? "page" : undefined}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><span className="privacy-icon"><Icon name="shield" size={17} /></span><strong>Demo workspace</strong><p>Use fictional data only. This prototype is not a production health-record system.</p></div>
          <button className="reset-button" onClick={resetDemo}>Restore sample data</button>
          <div className="side-footer">Academic prototype <span>·</span> v1.0</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Health Center</span><span className="crumb-slash">/</span><strong>{navigation.find((item) => item.id === page)?.label}</strong></div>
          <div className="topbar-actions">
            <label className="role-picker"><span>Demo role</span><select value={role} onChange={(event) => { const nextRole = event.target.value; setRole(nextRole); if (navigation.find((item) => item.id === page)?.roles && !navigation.find((item) => item.id === page).roles.includes(nextRole)) openPage("overview"); }} aria-label="Select demo role">{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
            <span className="avatar" aria-hidden="true">{role.slice(0, 1)}</span>
          </div>
        </header>

        <section className="page-content">
          <div className="demo-banner"><span className="banner-dot" /><span><strong>Prototype mode</strong> · Fictional sample records are stored in this browser only.</span><span className="banner-separator">|</span><span>Not certified for clinical use</span></div>
          {storageWarning && <div className="inline-alert" role="status">{storageWarning}</div>}
          {notice && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={16} /></span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><Icon name="close" size={16} /></button></div>}
          {page === "overview" && <Overview data={data} upcoming={upcomingAppointments} patientName={patientName} staffName={staffName} go={openPage} />}
          {page === "patients" && <Patients patients={filteredPatients} total={data.patients.length} search={search} setSearch={setSearch} selected={selectedPatient} onSelect={setSelectedPatientId} data={data} staffName={staffName} onAdd={() => setModal("patient")} onHistory={() => { if (selectedPatient) { logAction("Viewed medical history", selectedPatient.id); showNotice("History access recorded in the demo audit log."); } }} role={role} />}
          {page === "appointments" && <Appointments items={data.appointments} patientName={patientName} onAdd={() => setModal("appointment")} onStatus={updateAppointment} />}
          {page === "consultations" && <Consultations items={data.consultations} patientName={patientName} staffName={staffName} onAdd={() => { setEditingConsultationId(null); setModal("consultation"); }} onComplete={(id) => { setEditingConsultationId(id); setModal("consultation"); }} role={role} />}
          {page === "records" && <Records items={data.retention} patientName={patientName} role={role} onUpdate={updateRetention} />}
          {page === "database" && <DatabaseDesign />}
          {page === "staff" && <StaffAndAudit data={data} staffName={staffName} patientName={patientName} onToggle={toggleStaff} onAdd={() => setModal("staff")} />}
        </section>
        <footer className="page-footer"><span>University of the Immaculate Conception · College of Computer Studies</span><span>Academic prototype · Verify retention rules with the health center</span></footer>
      </main>

      {modal && <Modal title={{ patient: "Register patient", appointment: "Schedule appointment", consultation: role === "Nurse" ? "Record vital signs" : editingConsultationId ? "Complete consultation" : "New consultation", staff: "Add staff account" }[modal]} onClose={() => { setModal(""); setEditingConsultationId(null); }}>
        {modal === "patient" && <PatientForm onSubmit={addPatient} onCancel={() => setModal("")} />}
        {modal === "appointment" && <AppointmentForm patients={data.patients} onSubmit={addAppointment} onCancel={() => setModal("")} />}
        {modal === "consultation" && <ConsultationForm patients={data.patients} appointments={data.appointments} role={role} existing={data.consultations.find((item) => item.id === editingConsultationId)} staff={data.staff} onSubmit={addConsultation} onCancel={() => { setModal(""); setEditingConsultationId(null); }} />}
        {modal === "staff" && <StaffForm onSubmit={addStaff} onCancel={() => setModal("")} />}
      </Modal>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Overview({ data, upcoming, patientName, staffName, go }) {
  const dayLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  const stats = [
    { title: "Registered patients", value: data.patients.length, sub: "Across this demo workspace", icon: "people", color: "mint" },
    { title: "Appointments today", value: data.appointments.filter((item) => dateOnly(new Date(item.date)) === dateOnly(new Date()) && item.status !== "Cancelled").length, sub: "Scheduled for today", icon: "calendar", color: "blue" },
    { title: "Consultations", value: data.consultations.length, sub: "Documented in the prototype", icon: "clipboard", color: "purple" },
    { title: "Needs retention review", value: data.retention.filter((item) => !item.legalHold && item.expires <= dateOnly(new Date())).length, sub: "Review only · no auto-disposal", icon: "archive", color: "amber" },
  ];
  return <>
    <PageHeading eyebrow={`${dayLabel} · HEALTH CENTER OVERVIEW`} title="Good day, team" description="A clear picture of today's care and the records that need attention." action={<button className="button button-primary" onClick={() => go("patients")}><Icon name="people" /> View patients</button>} />
    <div className="stat-grid">{stats.map((stat) => <article className="stat-card" key={stat.title}><div className={`stat-icon ${stat.color}`}><Icon name={stat.icon} /></div><div className="stat-title">{stat.title}</div><div className="stat-value">{stat.value}</div><div className="stat-sub">{stat.sub}</div></article>)}</div>
    <div className="overview-grid">
      <section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Upcoming appointments</h2><p>Your next scheduled patient visits</p></div><button className="text-button" onClick={() => go("appointments")}>All appointments <Icon name="arrow" size={15} /></button></div>
        {upcoming.length ? <div className="appointment-list">{upcoming.slice(0, 4).map((appointment) => <div className="appointment-row" key={appointment.id}><div className="date-tile"><strong>{new Date(appointment.date).toLocaleDateString("en", { day: "2-digit" })}</strong><span>{new Date(appointment.date).toLocaleDateString("en", { month: "short" })}</span></div><div className="appointment-info"><strong>{patientName(appointment.patientId)}</strong><span>{appointment.reason || "Visit"} · {new Date(appointment.date).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</span></div><StatusBadge value={appointment.status} /></div>)}</div> : <EmptyState title="No upcoming appointments" text="New appointments will appear here." />}
      </section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Common tasks for your care team</p></div></div><div className="quick-actions"><button onClick={() => go("patients")}><span className="quick-icon quick-mint"><Icon name="people" /></span><span><strong>Find a patient</strong><small>Search the patient directory</small></span><Icon name="arrow" size={16} /></button><button onClick={() => go("appointments")}><span className="quick-icon quick-blue"><Icon name="calendar" /></span><span><strong>Manage appointments</strong><small>Review or schedule a visit</small></span><Icon name="arrow" size={16} /></button><button onClick={() => go("database")}><span className="quick-icon quick-purple"><Icon name="database" /></span><span><strong>Explore database design</strong><small>See entities and relationships</small></span><Icon name="arrow" size={16} /></button></div></section>
    </div>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest actions recorded in the demo audit trail</p></div>{data.audit.length > 0 && <span className="subtle-count">{data.audit.length} events</span>}</div><div className="activity-list">{data.audit.slice(0, 4).map((entry) => <div className="activity-row" key={entry.id}><span className="activity-dot" /><div className="activity-copy"><strong>{entry.action}</strong><span>{entry.patientId ? `${patientName(entry.patientId)} · ` : ""}{staffName(entry.userId)}</span></div><time>{new Date(entry.at).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></div>)}</div></section>
    <div className="notice-strip"><span className="notice-icon"><Icon name="shield" /></span><p><strong>Privacy first.</strong> Sample entries are fictional and saved locally. This prototype does not provide production authentication, encryption, or clinical decision support.</p></div>
  </>;
}

function StatusBadge({ value }) {
  const statusClass = String(value).toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
  const label = String(value).replaceAll("_", " ");
  return <span className={`status-badge status-${statusClass}`}><i />{label}</span>;
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><span className="empty-mark"><Icon name="clipboard" size={21} /></span><strong>{title}</strong><span>{text}</span></div>;
}

function Patients({ patients, total, search, setSearch, selected, onSelect, data, staffName, onAdd, onHistory, role }) {
  const history = selected ? data.consultations.filter((item) => item.patientId === selected.id).sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)) : [];
  return <>
    <PageHeading eyebrow="PATIENT DIRECTORY" title="Patients" description={`${total} registered records · Patient identity and contact details for authorized staff.`} action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" /> Register patient</button>} />
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Patient records</h2><p>Search by name, patient ID, or contact number.</p></div><label className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients" aria-label="Search patients" /><kbd>⌕</kbd></label></div>
      {patients.length ? <div className="table-scroll"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Date of birth</th><th>Contact</th><th>Registered</th><th><span className="sr-only">Open record</span></th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id} className={selected?.id === patient.id ? "selected-row" : ""}><td><button className="patient-cell" onClick={() => onSelect(selected?.id === patient.id ? "" : patient.id)}><span className="patient-avatar">{patient.firstName[0]}{patient.lastName[0]}</span><span><strong>{patient.firstName} {patient.lastName}</strong><small>{patient.gender || "Gender not recorded"}</small></span></button></td><td><span className="mono-id">{patient.id}</span></td><td>{new Date(`${patient.dob}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td><td>{patient.contactNo || "—"}</td><td>{new Date(`${patient.createdAt}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td><td><button className="icon-button" onClick={() => onSelect(patient.id)} aria-label={`Open ${patient.firstName} ${patient.lastName} record`}><Icon name="arrow" size={17} /></button></td></tr>)}</tbody></table></div> : <EmptyState title="No matching patients" text="Try another search or register a new patient." />}
      <div className="table-foot"><span>Showing <strong>{patients.length}</strong> of <strong>{total}</strong> patient records</span><span>Records are archived, not deleted.</span></div>
    </section>
    {selected && <section className="panel patient-detail"><div className="detail-heading"><div className="patient-large-avatar">{selected.firstName[0]}{selected.lastName[0]}</div><div><div className="eyebrow">PATIENT PROFILE</div><h2>{selected.firstName} {selected.lastName}</h2><span className="mono-id">{selected.id}</span></div><button className="button button-secondary detail-history" onClick={onHistory}><Icon name="clipboard" size={16} /> Record history access</button></div>
      <div className="detail-grid"><Detail label="Date of birth" value={new Date(`${selected.dob}T12:00:00`).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })} /><Detail label="Gender" value={selected.gender || "Not recorded"} /><Detail label="Contact" value={selected.contactNo || "Not recorded"} /><Detail label="Address" value={selected.address || "Not recorded"} /><Detail label="Emergency contact" value={selected.emergencyContactName || "Not recorded"} /><Detail label="Emergency phone" value={selected.emergencyContactPhone || "Not recorded"} /></div>
      <div className="history-heading"><h3>Consultation history</h3><span>{history.length} {history.length === 1 ? "visit" : "visits"}</span></div>
      {history.length ? <div className="history-list">{history.map((item) => <div className="history-row" key={item.id}><time>{new Date(item.visitDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</time><div><strong>{item.diagnosis || item.complaint || "Vital signs recorded"}</strong><span>{item.icd10 ? `ICD-10 ${item.icd10} · ` : ""}{staffName(item.doctorId)}</span></div><span className="vitals-summary">{item.bp ? `BP ${item.bp}` : ""}{item.temperature ? ` · ${item.temperature}°C` : ""}{item.weight ? ` · ${item.weight} kg` : ""}</span></div>)}</div> : <EmptyState title="No previous consultations" text="Visit history will appear here when recorded." />}
      {role !== "Doctor" && <p className="helper-text history-note">Clinical history access should be limited by role and recorded in the audit trail.</p>}
    </section>}
  </>;
}

function Detail({ label, value }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}

function Appointments({ items, patientName, onAdd, onStatus }) {
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  return <>
    <PageHeading eyebrow="VISIT COORDINATION" title="Appointments" description="Schedule and track patient visits. New appointments start as Pending." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" /> Schedule appointment</button>} />
    <div className="metric-row"><div className="metric-card"><span className="metric-label">All appointments</span><strong>{items.length}</strong></div><div className="metric-card"><span className="metric-label">Pending</span><strong>{items.filter((item) => item.status === "Pending").length}</strong></div><div className="metric-card"><span className="metric-label">Confirmed</span><strong>{items.filter((item) => item.status === "Confirmed").length}</strong></div><div className="metric-card"><span className="metric-label">Completed</span><strong>{items.filter((item) => item.status === "Completed").length}</strong></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Appointment schedule</h2><p>Availability conflicts should be checked by staff.</p></div><span className="legend-note"><i /> Local demo schedule</span></div>
      {sorted.length ? <div className="table-scroll"><table><thead><tr><th>Date & time</th><th>Patient</th><th>Reason for visit</th><th>Status</th><th>Update status</th></tr></thead><tbody>{sorted.map((item) => <tr key={item.id}><td><strong>{new Date(item.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</strong><small className="cell-sub">{new Date(item.date).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</small></td><td><strong>{patientName(item.patientId)}</strong><small className="cell-sub">{item.patientId}</small></td><td>{item.reason || "—"}</td><td><StatusBadge value={item.status} /></td><td><select className="table-select" aria-label={`Update appointment for ${patientName(item.patientId)}`} value={item.status} onChange={(event) => onStatus(item.id, event.target.value)}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></td></tr>)}</tbody></table></div> : <EmptyState title="No appointments yet" text="Schedule a visit for a registered patient." />}
      <div className="table-foot"><span>Appointments are linked to a registered patient.</span><span>No automatic slot-conflict checking.</span></div>
    </section>
  </>;
}

function Consultations({ items, patientName, staffName, onAdd, onComplete, role }) {
  return <>
    <PageHeading eyebrow="CLINICAL DOCUMENTATION" title="Consultations" description="Record visit details, vital signs, and diagnosis coding within the documented staff roles." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" /> {role === "Nurse" ? "Record vital signs" : "New consultation"}</button>} />
    <div className="notice-strip role-notice"><span className="notice-icon"><Icon name="shield" /></span><p><strong>{role} workspace.</strong> Nurses may enter vital signs. Doctors document the diagnosis, clinical notes, and prescriptions. This role preview is not a substitute for server-enforced access controls.</p></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Visit records</h2><p>Medical history is shown for the selected demo dataset.</p></div><span className="subtle-count">{items.length} records</span></div>
      {items.length ? <div className="table-scroll"><table><thead><tr><th>Visit date</th><th>Patient</th><th>Chief complaint / diagnosis</th><th>ICD-10</th><th>Vitals</th><th>Responsible doctor</th><th>Status</th>{role === "Doctor" && <th>Action</th>}</tr></thead><tbody>{items.map((item) => { const documented = Boolean(item.diagnosis && item.icd10); return <tr key={item.id}><td>{new Date(item.visitDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}<small className="cell-sub">{new Date(item.visitDate).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</small></td><td><strong>{patientName(item.patientId)}</strong><small className="cell-sub">{item.patientId}</small></td><td>{item.diagnosis || item.complaint || "Vital signs recorded"}{item.notes && <small className="cell-sub">{item.notes}</small>}</td><td>{item.icd10 ? <span className="code-chip">{item.icd10}</span> : "—"}</td><td className="vitals-summary">{item.bp ? `BP ${item.bp}` : "—"}{item.temperature ? ` · ${item.temperature}°C` : ""}{item.weight ? ` · ${item.weight} kg` : ""}</td><td>{staffName(item.doctorId)}</td><td><StatusBadge value={documented ? "Completed" : "Awaiting documentation"} /></td>{role === "Doctor" && <td>{!documented && <button className="button button-small button-secondary" onClick={() => onComplete(item.id)}>Complete record</button>}</td>}</tr>; })}</tbody></table></div> : <EmptyState title="No consultations documented" text="Use the action above to add the first visit record." />}
      <div className="table-foot"><span>ICD-10 diagnosis code and description are stored together.</span><span>Missing values remain blank, not zero.</span></div>
    </section>
  </>;
}

function Records({ items, patientName, role, onUpdate }) {
  return <>
    <PageHeading eyebrow="RECORDS MANAGEMENT" title="Record lifecycle" description="Review retention details, legal holds, and authorized record status changes." />
    <div className="notice-strip retention-notice"><span className="notice-icon"><Icon name="shield" /></span><p><strong>No automatic destruction.</strong> The DOH schedule must be verified for the health center. A legal hold blocks destruction scheduling; confirm local policy before changing any status.</p></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Retention register</h2><p>{items.length} tracked record groups · Review dates and legal holds carefully.</p></div><span className="status-badge status-active"><i /> Review required by staff</span></div>
      {items.length ? <div className="table-scroll"><table><thead><tr><th>Patient</th><th>Record type / schedule</th><th>Created</th><th>Review date</th><th>Legal hold</th><th>Current status</th><th>Update</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{patientName(item.patientId)}</strong><small className="cell-sub">{item.patientId}</small></td><td><strong>{item.type}</strong><small className="cell-sub">{item.schedule}</small></td><td>{new Date(`${item.created}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td><td>{new Date(`${item.expires}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td><td><label className="hold-toggle"><input type="checkbox" checked={item.legalHold} onChange={(event) => onUpdate(item, { legalHold: event.target.checked })} disabled={!["Records Officer", "Admin"].includes(role)} /><span>{item.legalHold ? "On hold" : "No hold"}</span></label></td><td><StatusBadge value={item.status} /></td><td><select className="table-select" aria-label={`Update retention status for ${patientName(item.patientId)}`} value={item.status} onChange={(event) => onUpdate(item, { status: event.target.value })} disabled={!["Records Officer", "Admin"].includes(role)}><option value="Active">Active</option><option value="Archived">Archived</option><option value="Scheduled_For_Destruction">Scheduled for destruction</option></select></td></tr>)}</tbody></table></div> : <EmptyState title="No retention records" text="Retention entries will appear when patient records are created." />}
      {!["Records Officer", "Admin"].includes(role) && <div className="table-foot"><span>Switch the demo role to Records Officer or Admin to preview lifecycle controls.</span></div>}
      <div className="table-foot"><span>Retention schedules shown are examples, not legal determinations.</span><span>Destruction is always a separate authorized process.</span></div>
    </section>
  </>;
}

function DatabaseDesign() {
  return <>
    <PageHeading eyebrow="RELATIONAL MODEL" title="Database design" description="Seven core entities, primary and foreign keys, and their cardinality constraints." />
    <div className="erd-summary"><span className="erd-summary-icon"><Icon name="database" /></span><div><strong>Barangay health center record model</strong><p>MySQL / MariaDB schema · 7 tables · no cascade deletion</p></div><span className="erd-key"><b>PK</b> Primary key <b>FK</b> Foreign key</span></div>
    <div className="entity-grid">{tableDefinitions.map((table, index) => <article className={`entity-card entity-${index + 1}`} key={table.name}><div className="entity-head"><span className="entity-symbol"><Icon name={index === 0 ? "people" : index === 1 ? "shield" : index === 2 ? "calendar" : index === 3 ? "clipboard" : index === 4 ? "plus" : index === 5 ? "database" : "archive"} size={16} /></span><h2>{table.name}</h2></div><div className="entity-key"><span className="key-pill pk-pill">PK</span><code>{table.pk}</code></div>{table.fk !== "—" && <div className="entity-key entity-fk"><span className="key-pill fk-pill">FK</span><span>{table.fk}</span></div>}<div className="entity-fields"><span>KEY ATTRIBUTES</span><p>{table.fields}</p></div></article>)}</div>
    <section className="panel relationship-panel"><div className="panel-heading"><div><h2>Relationships & participation</h2><p>Each child-side foreign key points to its required or optional parent.</p></div><span className="erd-key"><b>1 : N</b> One-to-many</span></div><div className="relationship-grid">{relationships.map(([from, to, cardinality, description]) => <div className="relationship-item" key={`${from}-${to}`}><div className="relationship-nodes"><span>{from}</span><i /><b>{cardinality}</b><i /><span>{to}</span></div><p>{description}</p></div>)}</div></section>
    <div className="notice-strip"><span className="notice-icon"><Icon name="shield" /></span><p><strong>Schema notes.</strong> Staff role checks and ICD-10 validation must be enforced by the application. Patient and staff rows are deactivated or archived; records are not deleted by cascade.</p></div>
  </>;
}

function StaffAndAudit({ data, staffName, patientName, onToggle, onAdd }) {
  return <>
    <PageHeading eyebrow="ACCESS & ACCOUNTABILITY" title="Staff & audit" description="Manage demo staff entries and review the local activity trail." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" /> Add staff member</button>} />
    <div className="notice-strip role-notice"><span className="notice-icon"><Icon name="shield" /></span><p><strong>Prototype limitation.</strong> Account changes here are local demonstrations. Passwords, secure sign-in, lockout, and server-side authorization are not implemented.</p></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Staff accounts</h2><p>Deactivation preserves account history; demo entries contain no passwords.</p></div><span className="subtle-count">{data.staff.length} staff members</span></div><div className="table-scroll"><table><thead><tr><th>Staff member</th><th>Email</th><th>Role</th><th>Status</th><th>Access</th></tr></thead><tbody>{data.staff.map((member) => <tr key={member.id}><td><span className="staff-cell"><span className="staff-avatar">{member.name.split(" ").slice(-1)[0][0]}</span><strong>{member.name}</strong></span></td><td>{member.email}</td><td><span className="role-chip">{member.role}</span></td><td><StatusBadge value={member.active ? "Active" : "Inactive"} /></td><td><button className={`button button-small ${member.active ? "button-secondary" : "button-success"}`} onClick={() => onToggle(member.id)}>{member.active ? "Deactivate" : "Reactivate"}</button></td></tr>)}</tbody></table></div><div className="table-foot"><span>Unique email addresses · four defined staff roles</span><span>Never delete accounts that appear in audit history.</span></div></section>
    <section className="panel audit-panel"><div className="panel-heading"><div><h2>Audit trail</h2><p>Actions recorded for this local demo dataset.</p></div><span className="subtle-count">{data.audit.length} events</span></div>{data.audit.length ? <div className="audit-table-wrap"><table><thead><tr><th>Action</th><th>Staff account</th><th>Patient</th><th>Timestamp</th></tr></thead><tbody>{data.audit.map((entry) => <tr key={entry.id}><td><strong>{entry.action}</strong></td><td>{staffName(entry.userId)}</td><td>{entry.patientId ? patientName(entry.patientId) : "—"}</td><td>{new Date(entry.at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</td></tr>)}</tbody></table></div> : <EmptyState title="No audit events" text="Staff actions will appear here." />}<div className="table-foot"><span>Logs are visible to Admin role in this demo interface.</span><span>Production logs must be protected from modification.</span></div></section>
  </>;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handleKey = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">HEALTH CENTER WORKSPACE</div><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div>{children}</section></div>;
}

function Field({ label, name, required = false, hint, type = "text", children, ...props }) {
  const hintId = hint ? `${name}-hint` : undefined;
  return <div className="form-field"><label htmlFor={name}>{label}{required && <span className="required-mark"> *</span>}</label>{children || <input id={name} name={name} type={type} required={required} aria-describedby={hintId} {...props} />}{hint && <small id={hintId} className="field-hint">{hint}</small>}</div>;
}

function FormActions({ onCancel, submitLabel }) {
  return <div className="form-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary">{submitLabel}</button></div>;
}

function PatientForm({ onSubmit, onCancel }) {
  return <form className="form-content" onSubmit={onSubmit}><p className="form-intro">Create a demographic record for a new patient. Please use fictional information in this prototype.</p><div className="form-grid"><Field label="First name" name="firstName" required autoFocus /><Field label="Last name" name="lastName" required /><Field label="Date of birth" name="dob" type="date" required /><Field label="Gender" name="gender"><select id="gender" name="gender" defaultValue=""><option value="">Select if recorded</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></Field><Field label="Contact number" name="contactNo" hint="Use only test contact details." /><Field label="Address" name="address" /><Field label="Emergency contact name" name="emergencyContactName" /><Field label="Emergency contact phone" name="emergencyContactPhone" /></div><div className="privacy-consent"><Icon name="shield" size={16} /><span>Collect only information needed for this demonstration. A privacy notice and lawful processing basis must be established before real data is used.</span></div><FormActions onCancel={onCancel} submitLabel="Save patient record" /></form>;
}

function AppointmentForm({ patients, onSubmit, onCancel }) {
  const minDate = localDateTime(new Date()).slice(0, 16);
  if (!patients.length) return <div className="form-content"><EmptyState title="Register a patient first" text="Appointments must be linked to an existing patient record." /><div className="form-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Close</button></div></div>;
  return <form className="form-content" onSubmit={onSubmit}><p className="form-intro">Select an existing patient and choose a future date and time. New visits begin as Pending.</p><div className="form-grid"><Field label="Patient" name="patientId" required><select id="patientId" name="patientId" required defaultValue=""><option value="" disabled>Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} · {patient.id}</option>)}</select></Field><Field label="Appointment date and time" name="date" type="datetime-local" required min={minDate} /><div className="form-span"><Field label="Reason for visit" name="reason" required><textarea id="reason" name="reason" rows="3" required placeholder="Brief reason for the visit" /></Field></div></div><p className="field-hint appointment-help">Please verify doctor and room availability manually; slot conflict checking is not part of this prototype.</p><FormActions onCancel={onCancel} submitLabel="Schedule appointment" /></form>;
}

function ConsultationForm({ patients, appointments, role, existing, staff, onSubmit, onCancel }) {
  const [patientId, setPatientId] = useState(existing?.patientId || "");
  const doctors = staff.filter((member) => member.role === "Doctor" && member.active);
  const matchingAppointments = appointments.filter((item) => item.patientId === patientId && !["Completed", "Cancelled"].includes(item.status));
  if (!patients.length) return <div className="form-content"><EmptyState title="Register a patient first" text="Consultations must be linked to an existing patient." /><div className="form-actions"><button className="button button-secondary" onClick={onCancel}>Close</button></div></div>;
  return <form className="form-content" onSubmit={onSubmit}>
    <p className="form-intro">{role === "Nurse" ? "Record permitted vital signs and assign the visit to its responsible Doctor." : existing ? "Complete this visit's clinical record. Vital signs already entered by the Nurse are included." : "Document the consultation and optional prescription. An appointment can be linked when applicable."}</p>
    <div className="form-grid">
      <Field label="Patient" name="patientId" required>
        <select id="patientId" name="patientId" required value={patientId} disabled={Boolean(existing)} onChange={(event) => setPatientId(event.target.value)}>
          <option value="" disabled>Select a patient</option>
          {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} · {patient.id}</option>)}
        </select>
      </Field>
      {!existing && <Field label="Link appointment" name="appointmentId" hint="Optional. Each appointment can link to at most one consultation.">
        <select id="appointmentId" name="appointmentId" defaultValue=""><option value="">No appointment linked</option>{matchingAppointments.map((item) => <option key={item.id} value={item.id}>{new Date(item.date).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })} · {item.reason}</option>)}</select>
      </Field>}
      {role === "Nurse" && !existing && <Field label="Responsible Doctor" name="doctorId" required hint="The consultation must have an active Doctor assigned.">
        <select id="doctorId" name="doctorId" required defaultValue=""><option value="" disabled>Select an active Doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select>
      </Field>}
      <div className="form-section-title form-span">Vital signs <span>Optional fields · leave blank if not measured</span></div>
      <Field label="Blood pressure" name="bp" placeholder="e.g. 120/80" defaultValue={existing?.bp || ""} />
      <Field label="Temperature (°C)" name="temperature" type="number" step="0.1" min="25" max="45" placeholder="e.g. 36.8" defaultValue={existing?.temperature || ""} />
      <Field label="Weight (kg)" name="weight" type="number" step="0.01" min="0" placeholder="e.g. 62.5" defaultValue={existing?.weight || ""} />
      {role === "Doctor" && <>
        <div className="form-section-title form-span">Doctor documentation <span>ICD-10 diagnosis code and description</span></div>
        <Field label="Chief complaint" name="complaint" required defaultValue={existing?.complaint || ""} />
        <Field label="ICD-10 code" name="icd10" required hint="Only example codes are included. Production use requires the approved, complete ICD-10 reference list.">
          <select id="icd10" name="icd10" required defaultValue={existing?.icd10 || ""}><option value="" disabled>Select an example ICD-10 code</option>{demoIcd10Reference.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.description}</option>)}</select>
        </Field>
        <div className="form-span"><Field label="Diagnosis description" name="diagnosis" required><textarea id="diagnosis" name="diagnosis" rows="2" required defaultValue={existing?.diagnosis || ""} placeholder="Diagnosis description" /></Field></div>
        <div className="form-span"><Field label="Clinical notes" name="notes"><textarea id="notes" name="notes" rows="3" defaultValue={existing?.notes || ""} placeholder="Relevant visit documentation" /></Field></div>
        <div className="form-section-title form-span">Prescription <span>Optional</span></div>
        <Field label="Medicine name" name="medicine" defaultValue={existing?.prescriptions?.[0]?.medicine || ""} />
        <Field label="Dosage" name="dosage" placeholder="e.g. 500 mg" defaultValue={existing?.prescriptions?.[0]?.dosage || ""} />
        <Field label="Frequency" name="frequency" placeholder="e.g. As prescribed" defaultValue={existing?.prescriptions?.[0]?.frequency || ""} />
        <Field label="Duration (days)" name="duration" type="number" min="1" defaultValue={existing?.prescriptions?.[0]?.duration || ""} />
      </>}
    </div>
    <FormActions onCancel={onCancel} submitLabel={role === "Nurse" ? "Save vital signs" : existing ? "Complete consultation" : "Save consultation"} />
  </form>;
}

function StaffForm({ onSubmit, onCancel }) {
  return <form className="form-content" onSubmit={onSubmit}><p className="form-intro">Add a fictional account entry for role-workflow demonstration. Do not enter real credentials.</p><div className="form-grid"><Field label="Full name" name="name" required /><Field label="Email address" name="email" type="email" required /><Field label="Role" name="role" required><select id="role" name="role" required defaultValue=""><option value="" disabled>Select a role</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div className="privacy-consent"><Icon name="shield" size={16} /><span>This demo does not create passwords or enforce account permissions on a server.</span></div><FormActions onCancel={onCancel} submitLabel="Add demo staff entry" /></form>;
}

export default App;
