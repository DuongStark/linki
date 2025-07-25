import React, { useState } from 'react';
import { UserVocabProgress } from '../types';
import api from '../services/api.ts';
import { getNextIntervalText } from '../utils/srsUtils.ts';

interface FlashcardSRSProps {
  card: UserVocabProgress;
  onReview: (card: UserVocabProgress, grade: number) => void;
  loading?: boolean;
}

const FlashcardSRS: React.FC<FlashcardSRSProps> = ({ card, onReview, loading }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showHint, setShowHint] = useState(false); // Thêm state cho Hint
  const [hintType, setHintType] = useState<'image' | 'definition' | null>(null);
  if (!card) return null; // Nếu không có card thì không render gì cả

  const handleShowAnswer = () => {
    setShowAnswer(true);
    playAudio();
  };

  const handleGrade = (grade: number) => {
    onReview(card, grade);
    setShowAnswer(false);
    setShowHint(false); // Reset hint khi chuyển thẻ
  };

  const handleShowHint = () => {
    if (card.image && card.definition) {
      setHintType(Math.random() < 0.5 ? 'image' : 'definition');
    } else if (card.image) {
      setHintType('image');
    } else if (card.definition) {
      setHintType('definition');
    }
    setShowHint(true);
  };

  const playAudio = async () => {
    try {
      setAudioLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.defaults.baseURL}/tts/${encodeURIComponent(card.word)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Không lấy được audio');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setAudioLoading(false);
      audio.onerror = () => setAudioLoading(false);
      audio.play();
    } catch (err) {
      setAudioLoading(false);
      console.error('Audio play error:', err);
    }
  };

  return (
    <div className="relative">
      {/* Nút Hint chỉ hiện ở mặt trước nếu có image hoặc definition và chưa showAnswer/showHint */}
      {!showAnswer && !showHint && (card.image || card.definition) && (card.srs?.state === 'new' || card.srs?.state === 'learning') && (
        <div className="flex justify-center mb-2">
          <button
            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-full text-xs font-semibold shadow hover:bg-yellow-200 dark:hover:bg-yellow-700 transition"
            onClick={handleShowHint}
            type="button"
          >
            Gợi ý (Hint)
          </button>
        </div>
      )}
      <div className="rounded-2xl shadow-card p-10 border transition-all hover:shadow-lg bg-white dark:bg-neutral-800 border-primary-200 dark:border-neutral-700 max-w-md mx-auto my-4 relative">
        {/* Loại từ/tags góc trên phải */}
        {card.tags && card.tags.length > 0 && (
          <div className="absolute top-3 right-4 flex flex-wrap gap-1 z-10">
            {card.tags.map((tag, idx) => (
              <span key={idx} className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Hint image: hiện trên từ */}
        {!showAnswer && showHint && hintType === 'image' && card.image && (
          <div className="flex justify-center mb-2">
            <img
              src={card.image}
              alt="minh họa"
              className="max-h-32 rounded-xl shadow-sm object-contain bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-700"
              style={{maxWidth:'100%', width:'auto'}}
              loading="lazy"
            />
          </div>
        )}
        <div className="text-2xl font-bold text-center mb-4 text-indigo-600">
          {card.word}
        </div>
        {/* pos luôn hiển thị dưới từ */}
        {card.pos && (
          <div className="text-sm text-gray-500 dark:text-gray-300 text-center mb-2">
            {card.pos}
          </div>
        )}
        {/* Hint definition: hiện dưới từ */}
        {!showAnswer && showHint && hintType === 'definition' && card.definition && (
          <div className="text-base mb-2 text-blue-700 dark:text-blue-200 italic text-center">
            {card.definition}
          </div>
        )}
        {card.phonetic && (
          <div className="text-neutral-500 dark:text-neutral-300 text-center mb-4">
            {card.phonetic}
          </div>
        )}
        {showAnswer ? (
          <>
            {/* Ảnh minh họa mặt sau nếu có */}
            {card.image && (
              <div className="flex justify-center mb-2">
                <img
                  src={card.image}
                  alt="minh họa"
                  className="max-h-32 rounded-xl shadow-sm object-contain bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-700"
                  style={{maxWidth:'100%', width:'auto'}}
                  loading="lazy"
                />
              </div>
            )}
            <div className="text-lg mb-2 text-neutral-800 dark:text-neutral-100">
              {card.meaning}
            </div>
            {card.definition && (
              <div className="text-base mb-2 text-blue-700 dark:text-blue-200 italic">
                {card.definition}
              </div>
            )}
            {card.example && (
              <div className="italic text-neutral-500 dark:text-neutral-300 mb-4">
                {card.example}
              </div>
            )}
          </>
        ) : (
          <button
            className="btn-primary w-full py-3 text-lg"
            onClick={handleShowAnswer}
          >
            Hiện đáp án
          </button>
        )}
        {/* Audio control */}
        <button 
          onClick={playAudio}
          className="mt-4 text-secondary-600 dark:text-secondary-400 flex items-center justify-center w-full hover:underline relative"
          disabled={audioLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Phát âm
          {audioLoading && (
            <span className="ml-2 inline-block align-middle">
              <svg className="animate-spin h-5 w-5 text-primary-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </span>
          )}
        </button>
      </div>
      {/* Nút rating cố định dưới cùng */}
      {showAnswer && (
        <div className="fixed left-0 right-0 bottom-[56px] z-50 bg-white/90 dark:bg-neutral-900/95 border-t border-primary-100 dark:border-neutral-700 px-2 py-2 flex justify-between max-w-md mx-auto w-full" style={{maxWidth:'100vw'}}>
          <div className="flex-1 flex flex-col items-center">
            <button
              className={`w-full py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-red-500 hover:bg-red-600 focus:ring-red-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handleGrade(0)}
              disabled={loading}
            >
              Lại
            </button>
            <span className="text-xs mt-1">{getNextIntervalText(card, 0)}</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <button
              className={`w-full py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handleGrade(2)}
              disabled={loading}
            >
              Khó
            </button>
            <span className="text-xs mt-1">{getNextIntervalText(card, 2)}</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <button
              className={`w-full py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handleGrade(3)}
              disabled={loading}
            >
              Tốt
            </button>
            <span className="text-xs mt-1">{getNextIntervalText(card, 3)}</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <button
              className={`w-full py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-green-500 hover:bg-green-600 focus:ring-green-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handleGrade(4)}
              disabled={loading}
            >
              Dễ
            </button>
            <span className="text-xs mt-1">{getNextIntervalText(card, 4)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardSRS; 