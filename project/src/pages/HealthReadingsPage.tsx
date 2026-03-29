import { useEffect, useState } from 'react';
import { supabase, HealthReading } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Activity, Plus, TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';

export function HealthReadingsPage() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reading_date: format(new Date(), 'yyyy-MM-dd'),
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_sugar: '',
    temperature: '',
    heart_rate: '',
    notes: '',
  });

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('health_readings')
        .select('*')
        .order('reading_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      if (data) setReadings(data);
    } catch (error) {
      console.error('Error loading readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const data = {
        user_id: user.id,
        reading_date: formData.reading_date,
        blood_pressure_systolic: formData.blood_pressure_systolic
          ? parseInt(formData.blood_pressure_systolic)
          : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic
          ? parseInt(formData.blood_pressure_diastolic)
          : null,
        blood_sugar: formData.blood_sugar ? parseFloat(formData.blood_sugar) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        notes: formData.notes,
      };

      const { error } = await supabase.from('health_readings').insert([data]);

      if (error) throw error;

      setFormData({
        reading_date: format(new Date(), 'yyyy-MM-dd'),
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        blood_sugar: '',
        temperature: '',
        heart_rate: '',
        notes: '',
      });
      setShowForm(false);
      loadReadings();
    } catch (error) {
      console.error('Error adding reading:', error);
    }
  };

  const calculateAverage = (field: keyof HealthReading) => {
    const values = readings
      .map((r) => r[field])
      .filter((v): v is number => v !== null && typeof v === 'number');
    if (values.length === 0) return null;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getStatusColor = (type: string, value: number) => {
    switch (type) {
      case 'systolic':
        if (value < 120) return 'text-green-600';
        if (value < 140) return 'text-yellow-600';
        return 'text-red-600';
      case 'diastolic':
        if (value < 80) return 'text-green-600';
        if (value < 90) return 'text-yellow-600';
        return 'text-red-600';
      case 'sugar':
        if (value >= 70 && value <= 100) return 'text-green-600';
        if (value >= 100 && value <= 125) return 'text-yellow-600';
        return 'text-red-600';
      case 'temp':
        if (value >= 36.1 && value <= 37.2) return 'text-green-600';
        if (value >= 37.3 && value <= 38) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Readings</h1>
          <p className="text-gray-600 mt-2">Track your daily health metrics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Reading'}
        </button>
      </div>

      {readings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-medium text-gray-700">Avg BP (Systolic)</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {calculateAverage('blood_pressure_systolic') || '-'}
              {calculateAverage('blood_pressure_systolic') && (
                <span className="text-sm text-gray-600 ml-1">mmHg</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-700">Avg BP (Diastolic)</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {calculateAverage('blood_pressure_diastolic') || '-'}
              {calculateAverage('blood_pressure_diastolic') && (
                <span className="text-sm text-gray-600 ml-1">mmHg</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Avg Blood Sugar</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {calculateAverage('blood_sugar') || '-'}
              {calculateAverage('blood_sugar') && (
                <span className="text-sm text-gray-600 ml-1">mg/dL</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              <h3 className="text-sm font-medium text-gray-700">Avg Temperature</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {calculateAverage('temperature') || '-'}
              {calculateAverage('temperature') && (
                <span className="text-sm text-gray-600 ml-1">°C</span>
              )}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add Health Reading</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={formData.reading_date}
                onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure - Systolic (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) =>
                    setFormData({ ...formData, blood_pressure_systolic: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure - Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) =>
                    setFormData({ ...formData, blood_pressure_diastolic: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.blood_sugar}
                  onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="36.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="72"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Reading
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Readings</h2>
        </div>
        {readings.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No health readings yet</p>
            <p className="text-gray-400 text-sm mt-2">Add your first reading to start tracking</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BP (Systolic)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BP (Diastolic)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Sugar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heart Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(reading.reading_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reading.blood_pressure_systolic ? (
                        <span
                          className={`font-medium ${getStatusColor('systolic', reading.blood_pressure_systolic)}`}
                        >
                          {reading.blood_pressure_systolic} mmHg
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reading.blood_pressure_diastolic ? (
                        <span
                          className={`font-medium ${getStatusColor('diastolic', reading.blood_pressure_diastolic)}`}
                        >
                          {reading.blood_pressure_diastolic} mmHg
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reading.blood_sugar ? (
                        <span
                          className={`font-medium ${getStatusColor('sugar', reading.blood_sugar)}`}
                        >
                          {reading.blood_sugar} mg/dL
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reading.temperature ? (
                        <span
                          className={`font-medium ${getStatusColor('temp', reading.temperature)}`}
                        >
                          {reading.temperature} °C
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.heart_rate ? `${reading.heart_rate} BPM` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {reading.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
