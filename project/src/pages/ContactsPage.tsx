import { useEffect, useState } from 'react';
import { supabase, FamilyContact } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Plus, Users, CreditCard as Edit, Trash2, Phone, Mail, Shield } from 'lucide-react';

export function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<FamilyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone_number: '',
    email: '',
    is_emergency_contact: false,
    notify_on_missed_dose: false,
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('family_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
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
          .from('family_contacts')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('family_contacts').insert([
          {
            ...formData,
            user_id: user.id,
          },
        ]);
        if (error) throw error;
      }

      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleEdit = (contact: FamilyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone_number: contact.phone_number,
      email: contact.email,
      is_emergency_contact: contact.is_emergency_contact,
      notify_on_missed_dose: contact.notify_on_missed_dose,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase.from('family_contacts').delete().eq('id', id);
      if (error) throw error;
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone_number: '',
      email: '',
      is_emergency_contact: false,
      notify_on_missed_dose: false,
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
          <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your emergency and family contacts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_emergency_contact}
                    onChange={(e) =>
                      setFormData({ ...formData, is_emergency_contact: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.notify_on_missed_dose}
                    onChange={(e) =>
                      setFormData({ ...formData, notify_on_missed_dose: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Notify on Missed Dose</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Contact
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
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No contacts added yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Contact" to get started</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
                  {contact.relationship && (
                    <p className="text-sm text-gray-600 mt-1">{contact.relationship}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {contact.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{contact.phone_number}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{contact.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {contact.is_emergency_contact && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Emergency
                  </span>
                )}
                {contact.notify_on_missed_dose && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Notifications On
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
