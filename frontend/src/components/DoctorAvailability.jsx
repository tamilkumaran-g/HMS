import { useState, useEffect } from 'react';
import { getDoctors } from '../api/client';

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

  useEffect(() => {
    loadDoctors();
  }, [filters]);

  const loadDoctors = async () => {
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
  };

  // Sort doctors based on selected criteria
  const sortedDoctors = [...doctors].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'experience':
        return (b.experience_years || 0) - (a.experience_years || 0);
      case 'availability':
        const availA = a.max_patients - a.current_patients;
        const availB = b.max_patients - b.current_patients;
        return availB - availA;
      default:
        return 0;
    }
  });

  const getAvailabilityColor = (doctor) => {
    const availableSlots = doctor.max_patients - doctor.current_patients;
    if (!doctor.is_available || availableSlots <= 0) return 'bg-red-500/20 text-red-300';
    if (availableSlots <= 3) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-green-500/20 text-green-300';
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
        <h1 className="text-3xl font-bold">👨‍⚕️ Doctor Availability</h1>
        <button
          onClick={loadDoctors}
          disabled={loading}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/15 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec} className="bg-gray-800">
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              <option value="score" className="bg-gray-800">Overall Score (High to Low)</option>
              <option value="experience" className="bg-gray-800">Experience (High to Low)</option>
              <option value="availability" className="bg-gray-800">Availability (High to Low)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available_only}
                onChange={(e) => setFilters({ ...filters, available_only: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Available Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {/* Doctors Grid */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-200">
          Loading doctors...
        </div>
      ) : sortedDoctors.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-200">
          No doctors found matching the selected filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{doctor.name}</h3>
                  <p className="text-sm text-blue-300">{doctor.specialization}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getAvailabilityColor(doctor)}`}>
                  {getAvailabilityStatus(doctor)}
                </div>
              </div>

              {/* Score Badge */}
              {doctor.score !== undefined && (
                <div className="mb-3 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 px-4 py-2">
                  <div className="text-center">
                    <div className="text-xs text-blue-300 uppercase tracking-wider">Overall Score</div>
                    <div className="text-2xl font-bold text-white">{doctor.score.toFixed(2)}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Hospital:</span>
                  <span className="font-medium text-slate-200">{doctor.hospital_name}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-medium text-slate-200">{doctor.experience_years} years</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Patients:</span>
                  <span className="font-medium text-slate-200">
                    {doctor.current_patients} / {doctor.max_patients}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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

                {doctor.phone && (
                  <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-200">{doctor.phone}</span>
                  </div>
                )}

                {doctor.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-blue-300 truncate ml-2">{doctor.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && sortedDoctors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-3xl font-bold text-white">{sortedDoctors.length}</div>
            <div className="text-sm text-slate-400">Total Doctors</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {sortedDoctors.filter(d => d.is_available && d.current_patients < d.max_patients).length}
            </div>
            <div className="text-sm text-slate-400">Available</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {sortedDoctors.reduce((sum, d) => sum + (d.max_patients - d.current_patients), 0)}
            </div>
            <div className="text-sm text-slate-400">Total Slots</div>
          </div>
        </div>
      )}
    </div>
  );
}
