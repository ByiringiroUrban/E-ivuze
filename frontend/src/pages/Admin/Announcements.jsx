import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';

const Announcements = () => {
  const { aToken } = useContext(AdminContext);
  const { backendUrl } = useContext(AppContext);
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/announcements`, {
        headers: { aToken }
      });
      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        toast.error(data.message || t('admin.announcements.fetchError'));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error(error.response?.data?.message || t('admin.announcements.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchAnnouncements();
    }
  }, [aToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        const { data } = await axios.put(
          `${backendUrl}/api/admin/announcements/${editingId}`,
          formData,
          { headers: { aToken } }
        );
        if (data.success) {
          toast.success(t('admin.announcements.updated') || 'Announcement updated successfully');
          fetchAnnouncements();
          resetForm();
        } else {
          toast.error(data.message || t('admin.announcements.updateError'));
        }
      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/announcements`,
          formData,
          { headers: { aToken } }
        );
        if (data.success) {
          toast.success(t('admin.announcements.created') || 'Announcement created successfully');
          fetchAnnouncements();
          resetForm();
        } else {
          toast.error(data.message || t('admin.announcements.saveError'));
        }
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(error.response?.data?.message || t('admin.announcements.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.announcements.confirmDelete') || 'Are you sure you want to delete this announcement?')) {
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/announcements/${id}`,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.announcements.deleted') || 'Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        toast.error(data.message || t('admin.announcements.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error(error.response?.data?.message || t('admin.announcements.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      isActive: announcement.isActive
    });
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', message: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${backendUrl}/api/admin/announcements/${id}`,
        { isActive: !currentStatus },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.announcements.updated') || 'Announcement updated successfully');
        fetchAnnouncements();
      } else {
        toast.error(data.message || t('admin.announcements.updateError'));
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error(error.response?.data?.message || t('admin.announcements.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-accent">
          {t('admin.announcements.title') || 'Announcements'}
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          {showForm ? t('admin.announcements.cancel') || 'Cancel' : t('admin.announcements.addNew') || '+ Add New'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-accent mb-2">
              {t('admin.announcements.titleLabel') || 'Title'} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-border px-4 py-2 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-accent mb-2">
              {t('admin.announcements.messageLabel') || 'Message'} *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-border px-4 py-2 rounded-lg min-h-[100px]"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-accent">
              {t('admin.announcements.isActive') || 'Active'}
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? t('buttons.processing') : (editingId ? t('buttons.update') : t('buttons.save'))}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading && !announcements.length ? (
          <LoadingComponents.DataLoader text="Loading announcements..." />
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
            {t('admin.announcements.noAnnouncements') || 'No announcements yet'}
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`border rounded-lg p-4 ${announcement.isActive ? 'border-primary bg-primary/5' : 'border-border bg-white'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-accent mb-1">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {t('admin.announcements.createdAt') || 'Created'}:{' '}
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${announcement.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {announcement.isActive
                        ? t('admin.announcements.active') || 'Active'
                        : t('admin.announcements.inactive') || 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(announcement._id, announcement.isActive)}
                    className={`px-3 py-1 text-xs rounded ${announcement.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } transition`}
                  >
                    {announcement.isActive
                      ? t('admin.announcements.deactivate') || 'Deactivate'
                      : t('admin.announcements.activate') || 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    {t('buttons.edit') || 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    {t('buttons.delete') || 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;

