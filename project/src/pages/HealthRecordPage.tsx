import { useEffect, useState } from 'react';
import { supabase, HealthRecord } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Heart, Save, CreditCard as Edit } from 'lucide-react';

export function HealthRecordPage() {
  const { user } = useAuth();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    allergies: [] as string[],
    existing_conditions: [] as string[],
    medical_history: '',
    blood_type: '',
    height: '',
    weight: '',
    emergency_notes: '',
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  useEffect(() => {
    loadHealthRecord();
  }, []);

  const loadHealthRecord = async () => {
    try {
      const { data, error } = await supabase.from('health_records').select('*').maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setRecord(data);
        setFormData({
          allergies: data.allergies || [],
          existing_conditions: data.existing_conditions || [],
          medical_history: data.medical_history || '',
          blood_type: data.blood_type || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          emergency_notes: data.emergency_notes || '',
        });
      } else {
        setEditing(true);
      }
    } catch (error) {
      console.error('Error loading health record:', error);
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
        allergies: formData.allergies,
        existing_conditions: formData.existing_conditions,
        medical_history: formData.medical_history,
        blood_type: formData.blood_type,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        emergency_notes: formData.emergency_notes,
      };

      if (record) {
        const { error } = await supabase
          .from('health_records')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('health_records').insert([data]);
        if (error) throw error;
      }

      setEditing(false);
      loadHealthRecord();
    } catch (error) {
      console.error('Error saving health record:', error);
    }
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setFormData({ ...formData, allergies: [...formData.allergies, allergyInput.trim()] });
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== index),
    });
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setFormData({
        ...formData,
        existing_conditions: [...formData.existing_conditions, conditionInput.trim()],
      });
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      existing_conditions: formData.existing_conditions.filter((_, i) => i !== index),
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Health Record</h1>
          <p className="text-gray-600 mt-2">Manage your health information</p>
        </div>
        {!editing && record && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add an allergy"
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Existing Conditions</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a condition"
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.existing_conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="hover:text-orange-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                <textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Notes</label>
                <textarea
                  value={formData.emergency_notes}
                  onChange={(e) => setFormData({ ...formData, emergency_notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              {record && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    loadHealthRecord();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : record ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Allergies</h3>
              {record.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {record.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None recorded</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Conditions</h3>
              {record.existing_conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {record.existing_conditions.map((condition, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None recorded</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Blood Type</h3>
              <p className="text-gray-900">{record.blood_type || 'Not specified'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Height</h3>
              <p className="text-gray-900">{record.height ? `${record.height} cm` : 'Not specified'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Weight</h3>
              <p className="text-gray-900">{record.weight ? `${record.weight} kg` : 'Not specified'}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Medical History</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{record.medical_history || 'None recorded'}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Notes</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{record.emergency_notes || 'None recorded'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No health record found</p>
        </div>
      )}
    </div>
  );
}
