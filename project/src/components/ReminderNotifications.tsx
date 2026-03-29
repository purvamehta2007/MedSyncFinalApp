import { useEffect, useState, useRef } from 'react';
import { supabase, Reminder, Medicine } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Bell, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  reminderId: string;
  medicineName: string;
  dosage: string;
  time: string;
}

export function ReminderNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [requestedPermission, setRequestedPermission] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    requestNotificationPermission();
    checkReminders();

    checkIntervalRef.current = setInterval(() => {
      checkReminders();
    }, 60000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
      setRequestedPermission(true);
    }
  };

  const checkReminders = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDay = now.getDay();

      const { data: reminders, error: remindersError } = await supabase
        .from('reminders')
        .select('*, medicine:medicines(name, dosage, unit)')
        .eq('is_active', true);

      if (remindersError) throw remindersError;
      if (!reminders) return;

      const dueReminders: NotificationItem[] = [];

      for (const reminder of reminders as any[]) {
        const reminderTimes = reminder.reminder_times || [];

        for (const time of reminderTimes) {
          if (time === currentTime) {
            if (reminder.days_of_week && !reminder.days_of_week.includes(currentDay)) {
              continue;
            }

            const notificationId = `${reminder.id}-${time}`;
            const existingNotification = notifications.find((n) => n.id === notificationId);

            if (!existingNotification) {
              dueReminders.push({
                id: notificationId,
                reminderId: reminder.id,
                medicineName: reminder.medicine.name,
                dosage: `${reminder.medicine.dosage} ${reminder.medicine.unit}`,
                time: time,
              });
            }
          }
        }
      }

      if (dueReminders.length > 0) {
        setNotifications((prev) => [...prev, ...dueReminders]);
        dueReminders.forEach((notification) => {
          showNotification(notification);
          playSound();
        });
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const showNotification = (notification: NotificationItem) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medicine Reminder', {
        body: `Time to take ${notification.medicineName} (${notification.dosage})`,
        icon: '/vite.svg',
        tag: notification.id,
      });
    }
  };

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    }
    audioRef.current.play().catch(err => console.log('Audio play failed:', err));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsTaken = async (notification: NotificationItem) => {
    try {
      const now = new Date();

      const { data: medicine } = await supabase
        .from('medicines')
        .select('id')
        .eq('id', (await supabase
          .from('reminders')
          .select('medicine_id')
          .eq('id', notification.reminderId)
          .single()).data?.medicine_id)
        .single();

      if (!medicine) return;

      await supabase.from('intakes').insert([
        {
          user_id: user!.id,
          medicine_id: medicine.id,
          reminder_id: notification.reminderId,
          scheduled_time: now.toISOString(),
          actual_time: now.toISOString(),
          status: 'taken',
          notes: 'Marked from notification',
        },
      ]);

      dismissNotification(notification.id);
    } catch (error) {
      console.error('Error marking as taken:', error);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4 w-80 animate-bounce"
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Medicine Reminder</h3>
              <p className="text-sm text-gray-700 mt-1">
                Time to take <span className="font-semibold">{notification.medicineName}</span>
              </p>
              <p className="text-sm text-gray-600">{notification.dosage}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled for {notification.time}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => markAsTaken(notification)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                >
                  Mark as Taken
                </button>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
