import { useEffect, useState } from 'react';
import { supabase, Reminder, Medicine } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Plus, Bell, CreditCard as Edit, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    medicine_id: '',
    reminder_times: [''],
    frequency: 'daily',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [remindersRes, medicinesRes] = await Promise.all([
        supabase.from('reminders').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('medicines').select('*').eq('is_active', true),
      ]);

      if (remindersRes.data) setReminders(remindersRes.data);
      if (medicinesRes.data) setMedicines(medicinesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const data = {
        ...formData,
        reminder_times: formData.reminder_times.filter((t) => t !== ''),
        user_id: user.id,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('reminders')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('reminders').insert([data]);
        if (error) throw error;
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setFormData({
      medicine_id: reminder.medicine_id,
      reminder_times: reminder.reminder_times.length > 0 ? reminder.reminder_times : [''],
      frequency: reminder.frequency,
      start_date: format(new Date(reminder.start_date), 'yyyy-MM-dd'),
      end_date: reminder.end_date ? format(new Date(reminder.end_date), 'yyyy-MM-dd') : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      medicine_id: '',
      reminder_times: [''],
      frequency: 'daily',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addTimeSlot = () => {
    setFormData({ ...formData, reminder_times: [...formData.reminder_times, ''] });
  };

  const removeTimeSlot = (index: number) => {
    setFormData({
      ...formData,
      reminder_times: formData.reminder_times.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...formData.reminder_times];
    newTimes[index] = value;
    setFormData({ ...formData, reminder_times: newTimes });
  };

  const getMedicineName = (medicineId: string) => {
    const medicine = medicines.find((m) => m.id === medicineId);
    return medicine ? medicine.name : 'Unknown Medicine';
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
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600 mt-2">Set up medication reminders</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-teal-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Reminder' : 'Add New Reminder'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine *</label>
                <select
                  value={formData.medicine_id}
                  onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a medicine</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} ({med.dosage} {med.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Times *</label>
                <div className="space-y-2">
                  {formData.reminder_times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                      {formData.reminder_times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="text-teal-500 hover:text-teal-600 text-sm font-medium"
                  >
                    + Add Time Slot
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Reminder
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reminders set yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Reminder" to get started</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{getMedicineName(reminder.medicine_id)}</h3>
                  <p className="text-sm text-gray-600 mt-1 capitalize">{reminder.frequency}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-teal-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-900">Times</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reminder.reminder_times.map((time, index) => (
                      <span key={index} className="px-2 py-1 bg-white text-teal-700 text-sm rounded">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Starts: <span className="font-medium">{format(new Date(reminder.start_date), 'PP')}</span>
                  </p>
                  {reminder.end_date && (
                    <p className="mt-1">
                      Ends: <span className="font-medium">{format(new Date(reminder.end_date), 'PP')}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
