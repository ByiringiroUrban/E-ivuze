import { FaMagic, FaSpinner, FaCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useContext, useState } from 'react';
import React from 'react';

const AISuggestionButton = ({
  context,
  fieldType = 'description',
  onSuggestion,
  token,
  className = ''
}) => {
  const { backendUrl, preferredAiModel } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [isTechnical, setIsTechnical] = useState(false);

  const generateSuggestion = async () => {
    if (!context || context.trim().length < 10) {
      setError('Please provide more context (at least 10 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = token ? { token } : {};
      const { data } = await axios.post(
        `${backendUrl}/api/ai/suggest`,
        {
          context: context.trim(),
          fieldType,
          language: 'en',
          requestedModel: preferredAiModel
        },
        { headers }
      );

      if (data.success && data.suggestion) {
        setSuggestion(data.suggestion);
        setShowPreview(true);
      } else {
        setError(data.message || 'Failed to generate suggestion');
        setIsTechnical(!!data.technicalInfo);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      const friendlyMsg = err.response?.data?.message || 'AI service is temporarily resting.';
      setError(friendlyMsg);
      setIsTechnical(true);
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = () => {
    onSuggestion(suggestion);
    setShowPreview(false);
    setSuggestion('');
  };

  const rejectSuggestion = () => {
    setShowPreview(false);
    setSuggestion('');
  };

  if (showPreview) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
            <FaMagic className="text-blue-500" />
            AI Suggestion
          </span>
          <div className="flex gap-1">
            <button
              onClick={acceptSuggestion}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Accept suggestion"
            >
              <FaCheck size={12} />
            </button>
            <button
              onClick={rejectSuggestion}
              className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              title="Reject suggestion"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100">
          {suggestion}
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-2 ${className}`}>
      <button
        type="button"
        onClick={generateSuggestion}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FaMagic />
            Get AI Suggestion
          </>
        )}
      </button>
      {error && (
        <div className="flex items-center gap-2 mt-2 bg-orange-50 border border-orange-100 p-2 rounded-lg text-orange-700 animate-in fade-in slide-in-from-top-1">
          <FaExclamationCircle size={14} className="flex-shrink-0" />
          <div>
            <p className="text-[11px] font-medium leading-tight">
              {error}
            </p>
            {isTechnical && (
              <button
                onClick={generateSuggestion}
                className="text-[10px] underline hover:no-underline font-bold mt-1 block"
              >
                Retry Request
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestionButton;
