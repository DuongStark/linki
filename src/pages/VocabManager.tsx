import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api.ts';
import { Deck, UserVocabProgress } from '../types';
import { useNavigate } from 'react-router-dom';
import { SpeakerWaveIcon, ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { deckAPI } from '../services/api.ts';
import { useSelectedDeck } from '../hooks/useSelectedDeck.ts';

const PAGE_SIZE = 30;

const VocabManager: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [importedDeckIds, setImportedDeckIds] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckVocab, setDeckVocab] = useState<any[]>([]);
  const [deckProgress, setDeckProgress] = useState<UserVocabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setSelectedDeckId, selectedDeckId } = useSelectedDeck();
  const [displayedVocab, setDisplayedVocab] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<number | null>(null);

  useEffect(() => {
    fetchDecks();
    fetchImportedDecks();
    // Đóng dropdown khi click ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await deckAPI.getDecks();
      setDecks(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải danh sách bộ từ.' });
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách deck đã import (dựa vào tiến trình học)
  const fetchImportedDecks = async () => {
    try {
      // Giả định: deck cá nhân là đã import, deck shared thì phải kiểm tra có tiến trình học chưa
      const data = await deckAPI.getDecks();
      const imported = data.filter(d => d.type === 'personal').map(d => d._id);
      setImportedDeckIds(imported);
    } catch {}
  };

  // Sửa lại dropdown render: dùng state để lưu deck nào đã import (dùng Promise.all để preload)
  useEffect(() => {
    const preloadImported = async () => {
      const imported: string[] = [];
      for (const deck of decks) {
        if (deck.type === 'personal') imported.push(deck._id);
        else {
          const progress = await deckAPI.getDeckProgress(deck._id);
          if (progress && progress.length > 0) imported.push(deck._id);
        }
      }
      setImportedDeckIds(imported);
    };
    if (decks.length > 0) preloadImported();
  }, [decks]);

  // Khi vào lại, nếu đã có selectedDeckId thì tự động chọn lại deck đó
  useEffect(() => {
    if (decks.length > 0 && selectedDeckId) {
      const deck = decks.find(d => d._id === selectedDeckId);
      if (deck) handleSelectDeck(deck);
    }
    // eslint-disable-next-line
  }, [decks, selectedDeckId]);

  const handleSelectDeck = async (deck: Deck) => {
    setSelectedDeck(deck);
    setSelectedDeckId(deck._id);
    setMessage(null);
    setLoading(true);
    if (deck.type === 'shared') {
      const vocab = await deckAPI.getDeckVocab(deck._id);
      setDeckVocab(vocab);
      setDeckProgress([]);
    } else {
      const progress = await deckAPI.getDeckProgress(deck._id);
      setDeckProgress(progress);
      setDeckVocab([]);
    }
    setLoading(false);
    setDropdownOpen(false);
  };

  const handleImportDeck = async (deck: Deck) => {
    if (!window.confirm(`Import toàn bộ từ của bộ "${deck.name}" vào tiến trình học?`)) return;
    setImporting(true);
    setImportProgress(null);
    setLoading(true);
    try {
      // Nếu muốn progress thật, cần backend hỗ trợ, tạm thời fake progress
      let fakeProgress = 0;
      const progressInterval = setInterval(() => {
        fakeProgress += Math.random() * 20 + 10;
        setImportProgress(Math.min(100, fakeProgress));
      }, 300);
      const res = await deckAPI.importDeck(deck._id);
      clearInterval(progressInterval);
      setImportProgress(100);
      setMessage({ type: 'success', text: res.message });
      await fetchDecks();
      await fetchImportedDecks();
      // Sau khi import xong, tự động chọn deck cá nhân tương ứng (nếu có)
      const personalDecks = decks.filter(d => d.type === 'personal');
      if (personalDecks.length > 0) {
        handleSelectDeck(personalDecks[0]);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Có lỗi khi import bộ từ.' });
    } finally {
      setImporting(false);
      setImportProgress(null);
      setLoading(false);
    }
  };

  const playAudio = async (word: string) => {
    try {
      const token = localStorage.getItem('token');
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

  // Khi fetch xong vocab/progress, reset infinite scroll
  useEffect(() => {
    if (selectedDeck) {
      const data = selectedDeck.type === 'shared' ? deckVocab : deckProgress;
      setDisplayedVocab(data); // Sửa: không slice theo PAGE_SIZE
    }
  }, [deckVocab, deckProgress, selectedDeck]);

  // Tính tổng số trang
  const totalPages = Math.ceil(displayedVocab.length / PAGE_SIZE);
  // Lấy dữ liệu trang hiện tại
  const pagedVocab = displayedVocab.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24 relative"> {/* Thêm pb-24 để tránh bị navbar che */}
      {/* Overlay khi import */}
      {importing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
            <div className="mb-4 text-lg font-semibold text-primary-600">Đang import bộ từ...</div>
            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div className="h-4 bg-primary-500 transition-all" style={{ width: `${importProgress ?? 50}%` }}></div>
            </div>
            <div className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</div>
          </div>
        </div>
      )}
      {message && (
        <div className={`p-3 rounded mb-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-primary-500 mb-2">Quản lý bộ từ</h1>
      {/* Dropdown chọn deck */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          className="w-full px-4 py-2 rounded-xl border shadow flex items-center justify-between bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400"
          onClick={() => setDropdownOpen(v => !v)}
        >
          {selectedDeck ? (
            <span>{selectedDeck.name}</span>
          ) : (
            <span className="text-gray-400">Chọn bộ từ...</span>
          )}
          <ChevronDownIcon className={`h-5 w-5 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute z-20 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {decks.map(deck => (
              <div key={deck._id} className="flex items-center justify-between px-4 py-2 hover:bg-primary-50 cursor-pointer">
                <span onClick={() => importedDeckIds.includes(deck._id) && handleSelectDeck(deck)} className={importedDeckIds.includes(deck._id) ? '' : 'text-gray-400 cursor-not-allowed'}>
                  {deck.name} {deck.type === 'shared' && <span className="text-xs">(mẫu)</span>}
                </span>
                {!importedDeckIds.includes(deck._id) && (
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center text-xs"
                    onClick={() => handleImportDeck(deck)}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" /> Download
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Nút học bộ từ này */}
      {selectedDeck && importedDeckIds.includes(selectedDeck._id) && (
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-full shadow mb-4 w-full"
          onClick={() => navigate('/study')}
        >
          Học bộ từ này
        </button>
      )}
      {/* Hiển thị từ vựng hoặc tiến trình học */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : selectedDeck && importedDeckIds.includes(selectedDeck._id) ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">Danh sách từ trong bộ "{selectedDeck.name}"</h2>
          {/* Pagination controls đặt lên trên */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mb-4 shadow-lg bg-white/80 dark:bg-neutral-900/80 rounded-lg p-2 overflow-x-auto whitespace-nowrap">
              <button
                className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 text-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {/* Trang đầu */}
              <button
                key={1}
                className={`px-2 py-1 rounded border text-sm ${currentPage === 1 ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              {/* Dấu ... nếu cần */}
              {currentPage > 3 && <span className="px-1">...</span>}
              {/* Trang trước */}
              {currentPage > 2 && currentPage !== totalPages && (
                <button
                  key={currentPage - 1}
                  className="px-2 py-1 rounded border text-sm bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {currentPage - 1}
                </button>
              )}
              {/* Trang hiện tại */}
              {currentPage !== 1 && currentPage !== totalPages && (
                <button
                  key={currentPage}
                  className="px-2 py-1 rounded border text-sm bg-primary-500 text-white border-primary-500"
                  onClick={() => setCurrentPage(currentPage)}
                  disabled
                >
                  {currentPage}
                </button>
              )}
              {/* Trang sau */}
              {currentPage < totalPages - 1 && currentPage !== 1 && (
                <button
                  key={currentPage + 1}
                  className="px-2 py-1 rounded border text-sm bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {currentPage + 1}
                </button>
              )}
              {/* Dấu ... nếu cần */}
              {currentPage < totalPages - 2 && <span className="px-1">...</span>}
              {/* Trang cuối nếu > 1 */}
              {totalPages > 1 && (
                <button
                  key={totalPages}
                  className={`px-2 py-1 rounded border text-sm ${currentPage === totalPages ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}
              <button
                className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 text-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
          {pagedVocab.length === 0 ? (
            <div className="text-gray-400 text-center py-4">Không có từ nào để hiển thị.</div>
          ) : (
            <div>
              {pagedVocab.map((card, idx) => {
                const word = card.word;
                const meaning = card.meaning;
                const phonetic = card.phonetic;
                const _id = card._id || card.vocabId;
                return (
                  <div key={_id} className="bg-white dark:bg-neutral-800 rounded-xl shadow p-3 flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-primary-600">{word}</span>
                      {' - '}
                      {meaning}
                      {phonetic && <span className="ml-2 text-sm text-gray-500">[{phonetic}]</span>}
                    </div>
                    <button
                      className="rounded-full bg-primary-100 dark:bg-primary-900 p-2 ml-2 shadow-md active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-primary-400"
                      onClick={() => playAudio(word)}
                      aria-label="Nghe phát âm"
                      tabIndex={0}
                    >
                      <SpeakerWaveIcon className="h-6 w-6 text-primary-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 italic py-8">
          Hãy import bộ từ để xem danh sách từ vựng!
        </div>
      )}
    </div>
  );
};

export default VocabManager; 