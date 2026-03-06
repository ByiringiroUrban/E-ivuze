
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { FaRobot, FaChevronDown, FaInfoCircle } from 'react-icons/fa';

const AIModelSelector = ({ className = "" }) => {
    const { aiModels, preferredAiModel, updatePreferredModel } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);

    const currentModel = aiModels.find(m => m.id === preferredAiModel) || aiModels[0] || { name: 'Gemini 2.0 Flash' };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm font-medium text-gray-700"
            >
                <FaRobot className="text-[#205c90]" />
                <span className="truncate max-w-[150px]">{currentModel.name}</span>
                <FaChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={12} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-[1000002] animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-2 border-b border-gray-50 mb-1">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Select AI Engine
                        </h4>
                    </div>
                    <div className="space-y-1">
                        {aiModels.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    updatePreferredModel(model.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left p-3 rounded-lg transition-colors group ${preferredAiModel === model.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-semibold ${preferredAiModel === model.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {model.name}
                                    </span>
                                    {preferredAiModel === model.id && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight">
                                    {model.description}
                                </p>
                            </button>
                        ))}
                    </div>
                    {aiModels.length === 0 && (
                        <div className="p-4 text-center text-xs text-gray-400 italic">
                            Fetching available models...
                        </div>
                    )}
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-start gap-2">
                        <FaInfoCircle className="text-gray-400 mt-0.5" size={12} />
                        <p className="text-[10px] text-gray-500 leading-normal">
                            Switching models affects all future AI clinical suggestions. Flash models are faster.
                        </p>
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default AIModelSelector;
