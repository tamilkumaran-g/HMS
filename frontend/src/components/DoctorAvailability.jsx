import { useState, useEffect, useCallback } from 'react';
import { motion as Motion } from 'framer-motion';
import { Activity, Stethoscope, UserRound } from 'lucide-react';
import { getDoctors } from '../api/client';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Skeleton from './ui/Skeleton';

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialization: '',
    available_only: false
  });
  const [sortBy, setSortBy] = useState('score'); // score, experience, availability

  const specializations = [
    'All',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Emergency Medicine'
  ];

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.specialization && filters.specialization !== 'All') {
        params.specialization = filters.specialization;
      }
      if (filters.available_only) {
        params.available_only = true;
      }
      
      const data = await getDoctors(params);
      setDoctors(data);
    } catch (err) {
      setError(err.message || 'Failed to load doctors');
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Sort doctors based on selected criteria
  const sortedDoctors = [...doctors].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'experience':
        return (b.experience_years || 0) - (a.experience_years || 0);
      case 'availability': {
        const availA = a.max_patients - a.current_patients;
        const availB = b.max_patients - b.current_patients;
        return availB - availA;
      }
      default:
        return 0;
    }
  });

  const getAvailabilityColor = (doctor) => {
    const availableSlots = doctor.max_patients - doctor.current_patients;
    if (!doctor.is_available || availableSlots <= 0) return 'bg-red-50 text-red-700';
    if (availableSlots <= 3) return 'bg-amber-50 text-amber-700';
    return 'bg-green-50 text-green-700';
  };

  const getAvailabilityStatus = (doctor) => {
    const availableSlots = doctor.max_patients - doctor.current_patients;
    if (!doctor.is_available) return 'Not Available';
    if (availableSlots <= 0) return 'Fully Booked';
    if (availableSlots <= 3) return `${availableSlots} Slots`;
    return 'Available';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Doctor Availability</h1>
          <p className="mt-1 text-sm text-slate-500">Live capacity and specialization matching across hospitals.</p>
        </div>
        <button
          onClick={loadDoctors}
          disabled={loading}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Card asMotion={false} className="rounded-2xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-48 flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-48 flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
            >
              <option value="score">Overall Score (High to Low)</option>
              <option value="experience">Experience (High to Low)</option>
              <option value="availability">Availability (High to Low)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available_only}
                onChange={(e) => setFilters({ ...filters, available_only: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-600">Available Only</span>
            </label>
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-56" />
          ))}
        </div>
      ) : sortedDoctors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
          No doctors found matching the selected filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDoctors.map((doctor, idx) => (
            <Motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
            >
              <Card className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800">{doctor.name}</h3>
                      <p className="text-sm text-indigo-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getAvailabilityColor(doctor)}`}>
                    {getAvailabilityStatus(doctor)}
                  </div>
                </div>

                {doctor.score !== undefined && (
                  <div className="mb-3 flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2">
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wider text-indigo-600">Overall Score</div>
                      <div className="text-2xl font-bold text-slate-800">{doctor.score.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Hospital:</span>
                    <span className="font-medium text-slate-700">{doctor.hospital_name}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-medium text-slate-700">{doctor.experience_years} years</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Patients:</span>
                    <span className="font-medium text-slate-700">
                      {doctor.current_patients} / {doctor.max_patients}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all ${
                          (doctor.current_patients / doctor.max_patients) >= 0.9
                            ? 'bg-red-500'
                            : (doctor.current_patients / doctor.max_patients) >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${(doctor.current_patients / doctor.max_patients) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Badge tone="accent" className="gap-1">
                      <Stethoscope className="h-3.5 w-3.5" /> {doctor.specialization}
                    </Badge>
                    <Badge tone="primary" className="gap-1">
                      <Activity className="h-3.5 w-3.5" /> {(doctor.max_patients - doctor.current_patients)} slots
                    </Badge>
                  </div>

                  {doctor.phone ? (
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-medium text-slate-700">{doctor.phone}</span>
                    </div>
                  ) : null}
                </div>
              </Card>
            </Motion.div>
          ))}
        </div>
      )}

      {!loading && sortedDoctors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card asMotion={false} className="rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-800">{sortedDoctors.length}</div>
            <div className="text-sm text-slate-400">Total Doctors</div>
          </Card>
          <Card asMotion={false} className="rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {sortedDoctors.filter(d => d.is_available && d.current_patients < d.max_patients).length}
            </div>
            <div className="text-sm text-slate-400">Available</div>
          </Card>
          <Card asMotion={false} className="rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {sortedDoctors.reduce((sum, d) => sum + (d.max_patients - d.current_patients), 0)}
            </div>
            <div className="text-sm text-slate-400">Total Slots</div>
          </Card>
        </div>
      )}
    </div>
  );
}
