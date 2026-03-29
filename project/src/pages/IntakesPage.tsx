import { useEffect, useState } from 'react';
import { supabase, Intake, Medicine } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { CircleCheck as CheckCircle, Circle as XCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function IntakesPage() {
  const { user } = useAuth();
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'taken' | 'missed' | 'pending'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [intakesRes, medicinesRes] = await Promise.all([
        supabase.from('intakes').select('*').order('scheduled_time', { ascending: false }),
        supabase.from('medicines').select('*').eq('is_active', true),
      ]);

      if (intakesRes.data) setIntakes(intakesRes.data);
      if (medicinesRes.data) setMedicines(medicinesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIntakeStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('intakes')
        .update({
          status,
          actual_time: status === 'taken' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating intake:', error);
    }
  };

  const getMedicineName = (medicineId: string) => {
    const medicine = medicines.find((m) => m.id === medicineId);
    return medicine ? medicine.name : 'Unknown Medicine';
  };

  const filteredIntakes = intakes.filter((intake) => {
    if (filter === 'all') return true;
    return intake.status === filter;
  });

  const stats = {
    total: intakes.length,
    taken: intakes.filter((i) => i.status === 'taken').length,
    missed: intakes.filter((i) => i.status === 'missed').length,
    pending: intakes.filter((i) => i.status === 'pending').length,
    adherenceRate: intakes.length > 0 ? Math.round((intakes.filter((i) => i.status === 'taken').length / intakes.length) * 100) : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Intake History</h1>
        <p className="text-gray-600 mt-2">Track your medication adherence</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Taken</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.taken}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Missed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.missed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Pending</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Adherence</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.adherenceRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {(['all', 'taken', 'missed', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredIntakes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No intake records found</p>
            <p className="text-gray-400 text-sm mt-2">Set up reminders to start tracking</p>
          </div>
        ) : (
          filteredIntakes.map((intake) => (
            <div
              key={intake.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {intake.status === 'taken' && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {intake.status === 'missed' && <XCircle className="w-6 h-6 text-red-500" />}
                    {intake.status === 'pending' && <Clock className="w-6 h-6 text-orange-500" />}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{getMedicineName(intake.medicine_id)}</h3>
                      <p className="text-sm text-gray-600">
                        Scheduled: {format(new Date(intake.scheduled_time), 'PPp')}
                      </p>
                      {intake.actual_time && (
                        <p className="text-sm text-gray-600">
                          Taken: {format(new Date(intake.actual_time), 'PPp')}
                        </p>
                      )}
                    </div>
                  </div>
                  {intake.notes && (
                    <p className="text-sm text-gray-600 mt-2 ml-9">Note: {intake.notes}</p>
                  )}
                </div>

                {intake.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateIntakeStatus(intake.id, 'taken')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Mark Taken
                    </button>
                    <button
                      onClick={() => updateIntakeStatus(intake.id, 'missed')}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Mark Missed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
