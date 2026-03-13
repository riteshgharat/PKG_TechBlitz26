import React, { useEffect, useMemo, useState } from 'react'
import { CalendarRange, Clock3, PencilLine, Plus, Trash2 } from 'lucide-react'
import { getDoctors, type Doctor } from '../api/doctors'
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
  type DoctorSchedule,
} from '../api/schedules'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toTimeInput(value: string) {
  const date = new Date(value)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

interface FormState {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: string
}

const defaultForm = (): FormState => ({
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '13:00',
  slotDuration: '30',
})

const ReceptionScheduleManager: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId]
  )

  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true)
      setError('')

      try {
        const data = await getDoctors()
        setDoctors(data)
        if (data.length > 0) {
          setSelectedDoctorId((current) => current || data[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load doctors.')
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [])

  useEffect(() => {
    if (!selectedDoctorId) return

    const loadSchedules = async () => {
      setLoadingSchedules(true)
      setError('')

      try {
        const data = await getSchedules(selectedDoctorId)
        setSchedules(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedules.')
      } finally {
        setLoadingSchedules(false)
      }
    }

    loadSchedules()
  }, [selectedDoctorId])

  const resetForm = () => {
    setEditingId(null)
    setForm(defaultForm())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctorId) return

    setSubmitting(true)
    setError('')

    try {
      if (editingId) {
        await updateSchedule(editingId, {
          startTime: form.startTime,
          endTime: form.endTime,
          slotDuration: Number(form.slotDuration),
        })
      } else {
        await createSchedule({
          doctorId: selectedDoctorId,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          slotDuration: Number(form.slotDuration),
        })
      }

      const data = await getSchedules(selectedDoctorId)
      setSchedules(data)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingId(schedule.id)
    setForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: toTimeInput(schedule.startTime),
      endTime: toTimeInput(schedule.endTime),
      slotDuration: String(schedule.slotDuration || 30),
    })
  }

  const handleDelete = async (id: string) => {
    setSubmitting(true)
    setError('')

    try {
      await deleteSchedule(id)
      const data = await getSchedules(selectedDoctorId)
      setSchedules(data)
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title">
        Doctor Schedule Manager
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>
          Reception can create, update, and remove shifts
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#b91c1c', padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <CalendarRange size={18} color="#7c3aed" />
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value)
                resetForm()
              }}
              disabled={loadingDoctors || doctors.length === 0}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #dbe2f0', background: '#f8fafc', fontFamily: 'inherit', fontWeight: 600 }}
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.specialization ? `• ${doctor.specialization}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {loadingSchedules ? (
              <div style={{ color: '#64748b', fontWeight: 600, padding: '18px 0' }}>Loading schedules…</div>
            ) : schedules.length === 0 ? (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 14, padding: 18, color: '#64748b', fontWeight: 600 }}>
                No schedules found for {selectedDoctor?.name || 'this doctor'}.
              </div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, background: '#fbfdff', display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{DAYS[schedule.dayOfWeek]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: '#475569', fontWeight: 600, fontSize: 13 }}>
                      <Clock3 size={14} />
                      {toTimeInput(schedule.startTime)} to {toTimeInput(schedule.endTime)}
                      <span style={{ color: '#94a3b8' }}>•</span>
                      {schedule.slotDuration || 30} min slots
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => handleEdit(schedule)} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: 10, padding: 10, cursor: 'pointer', color: '#2563eb' }}>
                      <PencilLine size={15} />
                    </button>
                    <button type="button" onClick={() => handleDelete(schedule.id)} style={{ border: '1px solid #fecaca', background: '#fff5f5', borderRadius: 10, padding: 10, cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ border: '1px solid #e2e8f0', borderRadius: 18, padding: 18, background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#7c3aed', fontWeight: 800, marginBottom: 8 }}>
            {editingId ? 'Update shift' : 'Create shift'}
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
            {selectedDoctor?.name || 'Select a doctor'}
          </h3>
          <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
            Build clean weekly availability blocks for doctors and keep appointment slot generation accurate.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Day
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm((current) => ({ ...current, dayOfWeek: Number(e.target.value) }))}
                disabled={Boolean(editingId)}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #dbe2f0', background: editingId ? '#f1f5f9' : 'white', fontFamily: 'inherit' }}
              >
                {DAYS.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                Start time
                <input type="time" value={form.startTime} onChange={(e) => setForm((current) => ({ ...current, startTime: e.target.value }))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #dbe2f0', fontFamily: 'inherit' }} />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                End time
                <input type="time" value={form.endTime} onChange={(e) => setForm((current) => ({ ...current, endTime: e.target.value }))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #dbe2f0', fontFamily: 'inherit' }} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Slot duration (minutes)
              <input type="number" min={5} step={5} value={form.slotDuration} onChange={(e) => setForm((current) => ({ ...current, slotDuration: e.target.value }))} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #dbe2f0', fontFamily: 'inherit' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button type="submit" disabled={submitting || !selectedDoctorId} style={{ flex: 1, padding: '13px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)', color: 'white', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {editingId ? <PencilLine size={15} /> : <Plus size={15} />}
              {submitting ? 'Saving…' : editingId ? 'Update schedule' : 'Add schedule'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '13px 16px', borderRadius: 12, border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReceptionScheduleManager