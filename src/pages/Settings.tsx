import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { notificationsAPI } from '../services/api.ts';
import { NotificationSettings } from '../types';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    dailyReminder: true,
    reminderTime: '20:00'
  });
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Kiểm tra Push Notification có được hỗ trợ không
    const checkPushSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setPushSupported(supported);
      
      if (supported) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setPushSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking push subscription:', error);
        }
      }
    };
    
    checkPushSupport();
  }, []);

  // Đăng ký nhận thông báo
  const handleSubscribePush = async () => {
    try {
      setLoading(true);
      
      const registration = await navigator.serviceWorker.ready;
      
      // Nếu đã đăng ký rồi thì hủy đăng ký cũ
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }
      
      // Lấy public key từ backend (trong thực tế)
      // Ở đây dùng key mẫu cho demo
      const dummyPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      // Đăng ký thông báo mới
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(dummyPublicKey)
      });
      
      // Gửi thông tin đăng ký lên server
      await notificationsAPI.subscribe(subscription);
      
      setPushSubscribed(true);
      setMessage({ 
        text: 'Đăng ký nhận thông báo thành công!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setMessage({ 
        text: 'Lỗi khi đăng ký thông báo. Vui lòng thử lại.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm hỗ trợ chuyển đổi base64 thành Uint8Array cho push notification
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  
  // Cập nhật cài đặt thông báo
  const handleUpdateNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await notificationsAPI.updateSettings(notificationSettings);
      
      setMessage({
        text: 'Cài đặt thông báo đã được cập nhật',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setMessage({
        text: 'Lỗi khi cập nhật cài đặt thông báo',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
      
      {message.text && (
        <div 
          className={`p-4 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {/* Cài đặt giao diện */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Giao diện
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Chế độ tối</span>
          <button
            onClick={toggleTheme}
            className={`${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span
              className={`${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
      </div>
      
      {/* Cài đặt thông báo */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Thông báo
        </h2>
        
        {pushSupported ? (
          <>
            {!pushSubscribed && (
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Đăng ký nhận thông báo để nhắc nhở học từ vựng hàng ngày.
                </p>
                <button
                  onClick={handleSubscribePush}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký nhận thông báo'}
                </button>
              </div>
            )}
            
            <form onSubmit={handleUpdateNotificationSettings}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Bật thông báo</span>
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={notificationSettings.enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Nhắc nhở học hàng ngày</span>
                  <input
                    type="checkbox"
                    name="dailyReminder"
                    checked={notificationSettings.dailyReminder}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Thời gian nhắc nhở
                  </label>
                  <input
                    type="time"
                    name="reminderTime"
                    value={notificationSettings.reminderTime}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-yellow-600 dark:text-yellow-400">
            Trình duyệt của bạn không hỗ trợ thông báo đẩy.
          </div>
        )}
      </div>
      
      {/* Về ứng dụng */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Về ứng dụng
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Anki Vocab là ứng dụng học từ vựng tiếng Anh dựa trên phương pháp SRS (Spaced Repetition System),
          giúp bạn ghi nhớ từ vựng hiệu quả thông qua việc lặp lại với khoảng thời gian tối ưu.
        </p>
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">Phiên bản: 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 