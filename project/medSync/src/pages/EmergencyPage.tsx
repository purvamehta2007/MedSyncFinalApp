import { useEffect, useState } from 'react';
import { supabase, EmergencyAlert, FamilyContact } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function EmergencyPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [contacts, setContacts] = useState<FamilyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    alert_type: 'medical',
    message: '',
    location: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alertsRes, contactsRes] = await Promise.all([
        supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('family_contacts').select('*').eq('is_emergency_contact', true),
      ]);

      if (alertsRes.data) setAlerts(alertsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
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
      const contactIds = contacts.map((c) => c.id);

      const { error } = await supabase.from('emergency_alerts').insert([
        {
          user_id: user.id,
          alert_type: formData.alert_type,
          message: formData.message,
          location: formData.location,
          notified_contacts: contactIds,
        },
      ]);

      if (error) throw error;

      setFormData({
        alert_type: 'medical',
        message: '',
        location: '',
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error resolving alert:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Emergency Alerts</h1>
          <p className="text-gray-600 mt-2">Manage emergency notifications</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/30"
        >
          <AlertTriangle className="w-5 h-5" />
          Trigger Alert
        </button>
      </div>

      {contacts.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">No Emergency Contacts</h3>
              <p className="text-sm text-orange-700 mt-1">
                You need to add emergency contacts before you can trigger alerts. Go to the Emergency Contacts
                page to add contacts.
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Trigger Emergency Alert</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type *</label>
              <select
                value={formData.alert_type}
                onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="medical">Medical Emergency</option>
                <option value="fall">Fall</option>
                <option value="medication">Medication Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the situation..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Your current location"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                The following contacts will be notified:
              </p>
              <ul className="space-y-1">
                {contacts.map((contact) => (
                  <li key={contact.id} className="text-sm text-gray-600">
                    {contact.name} - {contact.phone_number || contact.email}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                disabled={contacts.length === 0}
              >
                Trigger Alert
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

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No emergency alerts</p>
            <p className="text-gray-400 text-sm mt-2">Trigger an alert if you need help</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                alert.is_resolved ? 'border-gray-200' : 'border-red-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {alert.is_resolved ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 capitalize">
                        {alert.alert_type.replace('_', ' ')} Emergency
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alert.is_resolved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {alert.is_resolved ? 'Resolved' : 'Active'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    {alert.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(alert.created_at), 'PPp')}</span>
                    </div>
                    {alert.is_resolved && alert.resolved_at && (
                      <p className="text-sm text-green-600 mt-2">
                        Resolved: {format(new Date(alert.resolved_at), 'PPp')}
                      </p>
                    )}
                  </div>
                </div>
                {!alert.is_resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
