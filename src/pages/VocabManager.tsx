import React, { useState, useEffect } from 'react';
import { vocabAPI } from '../services/api.ts';
import api from '../services/api.ts';
import { VocabCard } from '../types';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

function OverlayPortal({ children }: { children: React.ReactNode }) {
  return typeof window !== 'undefined' ? ReactDOM.createPortal(children, document.body) : null;
}

const VocabManager: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState<VocabCard | null>(null);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    example: '',
    phonetic: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVocabCards();
  }, []);

  const fetchVocabCards = async () => {
    try {
      setLoading(true);
      const data = await vocabAPI.getAll();
      setVocabList(data);
    } catch (error) {
      console.error('Error fetching vocabulary cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCard) {
        await vocabAPI.update(editingCard._id, formData);
        setMessage({ type: 'success', text: 'Cập nhật từ thành công!' });
      } else {
        await vocabAPI.create(formData);
        setMessage({ type: 'success', text: 'Thêm từ mới thành công!' });
      }
      
      resetForm();
      fetchVocabCards();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setMessage({ type: 'error', text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Có lỗi xảy ra khi lưu từ vựng.' });
      console.error('Error saving vocabulary card:', error);
    }
  };

  const handleEditCard = (card: VocabCard) => {
    setEditingCard(card);
    setFormData({
      word: card.word,
      meaning: card.meaning,
      example: card.example || '',
      phonetic: card.phonetic || '',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCard = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa từ này không?')) {
      try {
        await vocabAPI.delete(id);
        setVocabList(prevList => prevList.filter(card => card._id !== id));
        setMessage({ type: 'success', text: 'Xóa từ thành công!' });
      } catch (error: any) {
        if (error?.response?.status === 401) {
          setMessage({ type: 'error', text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
          setTimeout(() => navigate('/login'), 1500);
          return;
        }
        setMessage({ type: 'error', text: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa từ vựng.' });
        console.error('Error deleting vocabulary card:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ word: '', meaning: '', example: '', phonetic: '' });
    setEditingCard(null);
    setShowAddForm(false);
  };

  const playAudio = async (word: string) => {
    try {
      const token = localStorage.getItem('token'); // hoặc nơi bạn lưu token
      const response = await fetch(`${api.defaults.baseURL}/tts/${encodeURIComponent(word)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Không lấy được audio');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('Audio play error:', err);
    }
  };

  const filteredVocabList = vocabList.filter(
    card => card.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
            card.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded mb-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-500">Quản lý từ vựng</h1>
        {!showAddForm && (
          <button 
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-full shadow transition-all"
            onClick={() => setShowAddForm(true)}
          >
            + Thêm từ mới
          </button>
        )}
      </div>
      {showAddForm && (
        <OverlayPortal>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={resetForm}></div>
          {/* Form overlay mobile */}
          <div className={`fixed inset-0 z-[99999] flex items-end md:hidden transition-transform duration-300 ${showAddForm ? 'translate-y-0' : 'translate-y-full'}`} style={{pointerEvents: 'auto'}}>
            <div className="w-full bg-white dark:bg-neutral-800 rounded-t-3xl p-6 pt-4 shadow-2xl min-h-[60vh] flex flex-col animate-slideup pb-[80px]">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-primary-500">{editingCard ? 'Cập nhật từ' : 'Thêm từ mới'}</h2>
                <button onClick={resetForm} className="text-3xl text-gray-400 hover:text-red-500 font-bold px-2">&times;</button>
              </div>
              <form onSubmit={handleAddCard} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <input type="text" name="word" value={formData.word} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400" placeholder="Từ *" required />
                  <input type="text" name="phonetic" value={formData.phonetic} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400" placeholder="Phiên âm (không bắt buộc)" />
                  <input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400" placeholder="Nghĩa *" required />
                  <textarea name="example" value={formData.example} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400 min-h-[60px]" placeholder="Ví dụ (không bắt buộc)" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-full shadow transition-all">{editingCard ? 'Cập nhật' : 'Thêm từ'}</button>
                  <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-full shadow transition-all">Hủy</button>
                </div>
              </form>
            </div>
          </div>
          {/* Form card PC */}
          <div className="hidden md:block fixed inset-0 z-[99999] flex items-center justify-center">
            <div className="bg-white dark:bg-neutral-800 shadow-2xl rounded-3xl p-6 min-w-[400px] max-w-lg mx-auto relative animate-fadein">
              <button onClick={resetForm} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
              <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-4">{editingCard ? 'Cập nhật từ' : 'Thêm từ mới'}</h2>
              <form onSubmit={handleAddCard} className="space-y-4">
                <input type="text" name="word" value={formData.word} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400" placeholder="Từ *" required />
                <input type="text" name="phonetic" value={formData.phonetic} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400" placeholder="Phiên âm (không bắt buộc)" />
                <input type="text" name="meaning" value={formData.meaning} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400" placeholder="Nghĩa *" required />
                <textarea name="example" value={formData.example} onChange={handleInputChange} className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400 min-h-[60px]" placeholder="Ví dụ (không bắt buộc)" />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-full shadow transition-all">{editingCard ? 'Cập nhật' : 'Thêm từ'}</button>
                  <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-full shadow transition-all">Hủy</button>
                </div>
              </form>
            </div>
          </div>
          {/* Animation keyframes */}
          <style>{`
            @keyframes slideup { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slideup { animation: slideup 0.3s cubic-bezier(.4,2,.6,1) both; }
            @keyframes fadein { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            .animate-fadein { animation: fadein 0.25s cubic-bezier(.4,2,.6,1) both; }
          `}</style>
        </OverlayPortal>
      )}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 border-none rounded-2xl shadow focus:shadow-lg focus:ring-2 focus:ring-primary-300 bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-base placeholder-gray-400"
          placeholder="🔍 Tìm kiếm từ vựng..."
        />
      </div>
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredVocabList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVocabList.map(card => (
            <div key={card._id} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-4 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playAudio(card.word)}
                    className="text-primary-500 hover:text-primary-600 text-xl p-1"
                    title="Phát âm"
                  >
                    <SpeakerWaveIcon className="h-6 w-6" />
                  </button>
                  <div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{card.word}</div>
                    {card.phonetic && (
                      <div className="text-sm text-neutral-500 dark:text-neutral-300">{card.phonetic}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-bold shadow"
                    title="Sửa"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card._id)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-sm font-bold shadow"
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="text-base text-neutral-800 dark:text-neutral-100 mt-1">{card.meaning}</div>
              {card.example && (
                <div className="text-sm text-neutral-500 dark:text-neutral-300 italic mt-1">{card.example}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-neutral-500 dark:text-neutral-300">
            {searchTerm ? 'Không tìm thấy từ vựng phù hợp' : 'Chưa có từ vựng nào'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow transition-all"
            >
              Thêm từ đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabManager; 