import { useEffect, useState } from 'react';
import { supabase, Medicine } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Plus, Package, CreditCard as Edit, Trash2, Calendar, CircleAlert as AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function MedicinesPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dosage: '',
    unit: 'mg',
    frequency: '',
    form: 'tablet',
    manufacturer: '',
    expiry_date: '',
    instructions: '',
    side_effects: '',
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from('medicines')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('medicines').insert([
          {
            ...formData,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      resetForm();
      loadMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingId(medicine.id);
    setFormData({
      name: medicine.name,
      description: medicine.description,
      dosage: medicine.dosage,
      unit: medicine.unit,
      frequency: medicine.frequency,
      form: medicine.form,
      manufacturer: medicine.manufacturer,
      expiry_date: medicine.expiry_date ? format(new Date(medicine.expiry_date), 'yyyy-MM-dd') : '',
      instructions: medicine.instructions,
      side_effects: medicine.side_effects,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const { error } = await supabase.from('medicines').update({ is_active: false }).eq('id', id);

      if (error) throw error;
      loadMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dosage: '',
      unit: 'mg',
      frequency: '',
      form: 'tablet',
      manufacturer: '',
      expiry_date: '',
      instructions: '',
      side_effects: '',
    });
    setEditingId(null);
    setShowForm(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Medicines</h1>
          <p className="text-gray-600 mt-2">Manage your medication inventory</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="mcg">mcg</option>
                  <option value="IU">IU</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form *</label>
                <select
                  value={formData.form}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                  <option value="inhaler">Inhaler</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Twice daily"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Side Effects</label>
                <textarea
                  value={formData.side_effects}
                  onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Medicine
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
        {medicines.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No medicines added yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Medicine" to get started</p>
          </div>
        ) : (
          medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{medicine.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{medicine.manufacturer}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(medicine)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Dosage:</span>
                  <span className="text-gray-600">
                    {medicine.dosage} {medicine.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Form:</span>
                  <span className="text-gray-600 capitalize">{medicine.form}</span>
                </div>
                {medicine.frequency && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <span className="text-gray-600">{medicine.frequency}</span>
                  </div>
                )}
                {medicine.expiry_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Expires: {format(new Date(medicine.expiry_date), 'PP')}
                    </span>
                  </div>
                )}
              </div>

              {medicine.instructions && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Instructions</p>
                  <p className="text-sm text-blue-700">{medicine.instructions}</p>
                </div>
              )}

              {medicine.side_effects && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-orange-900 mb-1">Side Effects</p>
                    <p className="text-sm text-orange-700">{medicine.side_effects}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
