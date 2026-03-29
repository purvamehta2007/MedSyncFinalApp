import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Medicine, Reminder, Intake } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Package, Bell, CircleCheck as CheckCircle, CircleAlert as AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function DashboardHome() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [medicinesRes, remindersRes, intakesRes] = await Promise.all([
        supabase.from('medicines').select('*').eq('is_active', true).limit(5),
        supabase.from('reminders').select('*').eq('is_active', true).limit(5),
        supabase
          .from('intakes')
          .select('*')
          .order('scheduled_time', { ascending: false })
          .limit(5),
      ]);

      if (medicinesRes.data) setMedicines(medicinesRes.data);
      if (remindersRes.data) setReminders(remindersRes.data);
      if (intakesRes.data) setIntakes(intakesRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Active Medicines',
      value: medicines.length,
      icon: Package,
      color: 'bg-blue-500',
      link: '/dashboard/medicines',
    },
    {
      name: 'Active Reminders',
      value: reminders.length,
      icon: Bell,
      color: 'bg-teal-500',
      link: '/dashboard/reminders',
    },
    {
      name: 'Taken Today',
      value: intakes.filter((i) => i.status === 'taken').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/dashboard/intakes',
    },
    {
      name: 'Adherence Rate',
      value: intakes.length > 0
        ? `${Math.round((intakes.filter((i) => i.status === 'taken').length / intakes.length) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      link: '/dashboard/intakes',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-2">Here's an overview of your medication management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Medicines</h2>
            <Link to="/dashboard/medicines" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              View all
            </Link>
          </div>
          {medicines.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No medicines added yet</p>
              <Link
                to="/dashboard/medicines"
                className="inline-block mt-3 text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Add your first medicine
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {medicine.dosage} {medicine.unit} - {medicine.form}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Intakes</h2>
            <Link to="/dashboard/intakes" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              View all
            </Link>
          </div>
          {intakes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No intake records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {intakes.map((intake) => (
                <div key={intake.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {intake.status === 'taken' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium capitalize">{intake.status}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(new Date(intake.scheduled_time), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
