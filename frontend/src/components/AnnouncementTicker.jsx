import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/announcement-ticker.css';

const AnnouncementTicker = ({ backendUrl }) => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!backendUrl) return;
    
    const fetchAnnouncements = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/public/announcements`);
        if (data.success) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        // Silently fail - announcements are optional
        if (error.response?.status !== 404) {
          console.error('Error fetching announcements:', error);
        }
      }
    };

    fetchAnnouncements();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  if (announcements.length === 0) return null;

  // Duplicate announcements once for seamless loop (not visible repetition)
  const duplicatedAnnouncements = [...announcements, ...announcements];

  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative z-50">
      <div className="announcement-ticker-container">
        <div className="announcement-ticker-content">
          {duplicatedAnnouncements.map((announcement, index) => (
            <div key={`${announcement._id || index}-dup-${Math.floor(index / announcements.length)}`} className="announcement-item">
              <span className="font-semibold mr-2">{announcement.title}:</span>
              <span>{announcement.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
