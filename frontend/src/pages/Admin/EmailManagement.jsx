import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LoadingComponents } from '../../components/LoadingComponents';

const EmailManagement = () => {
  const { aToken } = useContext(AdminContext);
  const { backendUrl } = useContext(AppContext);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailType, setEmailType] = useState('all'); // 'all', 'users', 'newsletter'
  const [sending, setSending] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (aToken) {
      fetchData();
    }
  }, [aToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, newsletterRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/emails/users`, {
          headers: { atoken: aToken }
        }),
        axios.get(`${backendUrl}/api/admin/leads/newsletter`, {
          headers: { atoken: aToken }
        })
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (newsletterRes.data.success) {
        setNewsletterSubscribers(newsletterRes.data.subscribers || []);
      }
    } catch (error) {
      console.error('Error fetching email data:', error);
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableEmails = () => {
    if (emailType === 'users') {
      return users.map(u => ({ email: u.email, name: u.name, type: 'user' }));
    } else if (emailType === 'newsletter') {
      return newsletterSubscribers.map(s => ({ email: s.email, name: null, type: 'newsletter' }));
    } else {
      // All: combine users and newsletter subscribers, deduplicate by email
      const emailMap = new Map();
      users.forEach(u => {
        emailMap.set(u.email.toLowerCase(), { email: u.email, name: u.name, type: 'user' });
      });
      newsletterSubscribers.forEach(s => {
        if (!emailMap.has(s.email.toLowerCase())) {
          emailMap.set(s.email.toLowerCase(), { email: s.email, name: null, type: 'newsletter' });
        }
      });
      return Array.from(emailMap.values());
    }
  };

  const handleSelectAll = () => {
    const available = getAvailableEmails();
    if (selectedEmails.length === available.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(available.map(e => e.email));
    }
  };

  const handleSelectEmail = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.subject || !emailForm.message) {
      toast.error('Please fill in subject and message');
      return;
    }
    if (selectedEmails.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    try {
      setSending(true);
      const response = await axios.post(
        `${backendUrl}/api/admin/emails/send-promotional`,
        {
          subject: emailForm.subject,
          message: emailForm.message,
          recipients: selectedEmails
        },
        { headers: { atoken: aToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Emails sent successfully');
        setEmailForm({ subject: '', message: '' });
        setSelectedEmails([]);
      } else {
        toast.error(response.data.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error(error.response?.data?.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const availableEmails = getAvailableEmails();

  if (loading) {
    return <LoadingComponents.DashboardLoader text="Loading email management..." />;
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-5xl space-y-3">
          <p className="text-xs   tracking-widest text-white/70">Email Management</p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Send Promotional Emails
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-3xl">
            Manage and send promotional emails to users and newsletter subscribers
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Total Users</p>
              <p className="text-3xl font-bold text-[#14324f]">{users.length}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Newsletter Subscribers</p>
              <p className="text-3xl font-bold text-[#14324f]">{newsletterSubscribers.length}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Total Unique Emails</p>
              <p className="text-3xl font-bold text-[#14324f]">{availableEmails.length}</p>
            </div>
          </div>

          {/* Email Form */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Type
                </label>
                <select
                  value={emailType}
                  onChange={(e) => {
                    setEmailType(e.target.value);
                    setSelectedEmails([]);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Users & Newsletter Subscribers</option>
                  <option value="users">Registered Users Only</option>
                  <option value="newsletter">Newsletter Subscribers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your email message (HTML supported)"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || selectedEmails.length === 0}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : `Send to ${selectedEmails.length} Recipients`}
                </button>
              </div>
            </form>
          </div>

          {/* Email List */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Select Recipients ({availableEmails.length} available)
              </h2>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {selectedEmails.length === availableEmails.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500  ">
                      <input
                        type="checkbox"
                        checked={selectedEmails.length === availableEmails.length && availableEmails.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500  ">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500  ">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500  ">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {availableEmails.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(item.email)}
                          onChange={() => handleSelectEmail(item.email)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${item.type === 'user'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {item.type === 'user' ? 'User' : 'Subscriber'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmailManagement;
