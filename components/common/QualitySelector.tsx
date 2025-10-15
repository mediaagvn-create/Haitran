import React from 'react';
import type { Quality } from '../../types';

interface QualitySelectorProps {
  quality: Quality;
  setQuality: (quality: Quality) => void;
  disabled?: boolean;
}

const options: { id: Quality; label: string, description: string }[] = [
  { id: 'standard', label: 'Chuẩn', description: 'Tốc độ nhanh, kết quả tốt.' },
  { id: 'enhanced', label: 'Nâng cao', description: 'Chất lượng cao hơn, chi tiết hơn.' },
  { id: 'professional', label: 'Chuyên nghiệp', description: 'Kết quả tốt nhất, độ phân giải cao, phù hợp cho công việc.' },
];

const QualitySelector: React.FC<QualitySelectorProps> = ({ quality, setQuality, disabled }) => {
  const selectedOption = options.find(opt => opt.id === quality);

  return (
    <div>
       <label className="block text-sm font-medium text-gray-300 mb-2">
            Chất lượng đầu ra
        </label>
      <div className="flex items-center space-x-2 rounded-lg bg-gray-900 p-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setQuality(option.id)}
            disabled={disabled}
            className={`w-full text-sm rounded-md py-2 px-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              quality === option.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selectedOption && <p className="text-xs text-gray-400 mt-2">{selectedOption.description}</p>}
    </div>
  );
};

export default QualitySelector;
