import React, { useState, useEffect, useContext } from 'react';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';

const PharmacyInventory = () => {
  const { t } = useTranslation();
  const { medications, getMedications, createMedication, updateMedication, deleteMedication } = useContext(PharmacyContext);

  const [showModal, setShowModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand: '',
    category: 'General',
    description: '',
    dosage: '',
    price: '',
    stock: '',
    prescriptionRequired: false,
    temperatureSensitive: false,
    storageInstructions: ''
  });

  useEffect(() => {
    loadMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMedications = async () => {
    setLoading(true);
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (categoryFilter) filters.category = categoryFilter;
    if (lowStockOnly) filters.lowStock = 'true';
    await getMedications(filters);
    setLoading(false);
  };

  useEffect(() => {
    loadMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, lowStockOnly]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMedication) {
        await updateMedication(editingMedication._id, formData);
      } else {
        await createMedication(formData);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving medication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setFormData({
      sku: medication.sku || '',
      name: medication.name || '',
      brand: medication.brand || '',
      category: medication.category || 'General',
      description: medication.description || '',
      dosage: medication.dosage || '',
      price: medication.price !== undefined && medication.price !== null ? medication.price.toString() : '',
      stock: medication.stock !== undefined && medication.stock !== null ? medication.stock.toString() : '',
      prescriptionRequired: medication.prescriptionRequired || false,
      temperatureSensitive: medication.temperatureSensitive || false,
      storageInstructions: medication.storageInstructions || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('pharmacy.inventory.confirmDelete') || 'Are you sure you want to delete this medication?')) {
      await deleteMedication(id);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      brand: '',
      category: 'General',
      description: '',
      dosage: '',
      price: '',
      stock: '',
      prescriptionRequired: false,
      temperatureSensitive: false,
      storageInstructions: ''
    });
    setEditingMedication(null);
  };

  const categories = ['General', 'Antibiotics', 'Pain Relief', 'Vitamins', 'Chronic Disease', 'First Aid', 'Other'];

  return (
    <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
      <DashboardHero
        eyebrow={t('pharmacy.inventory.eyebrow') || 'Inventory'}
        title={t('pharmacy.inventory.title') || 'Inventory Management'}
        description={t('pharmacy.inventory.subtitle') || 'Track medications, monitor stock and trigger restocks from a single grid.'}
        actions={[
          <button
            key="addMedication"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-[#14324f] px-5 py-3 text-xs   tracking-[0.35em] hover:bg-light-bg transition flex items-center gap-2"
          >
            <FaPlus className="text-[#205c90]" />
            {t('pharmacy.inventory.addMedication') || 'Add Medication'}
          </button>
        ]}
      />

      {/* Filters */}
      <div className="border border-border bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('pharmacy.inventory.search') || 'Search medications...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('pharmacy.inventory.allCategories') || 'All Categories'}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-primary roun focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              {t('pharmacy.inventory.lowStockOnly') || 'Low Stock Only'}
            </span>
          </label>
        </div>
      </div>

      {/* Medications Table */}
      <div className="border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                  {t('pharmacy.inventory.sku') || 'SKU'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                  {t('pharmacy.inventory.name') || 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                  {t('pharmacy.inventory.category') || 'Category'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                  {t('pharmacy.inventory.price') || 'Price'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                  {t('pharmacy.inventory.stock') || 'Stock'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                  {t('pharmacy.inventory.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <LoadingComponents.DataLoader text="Loading medications..." />
                  </td>
                </tr>
              ) : medications && medications.length > 0 ? (
                medications.map((med) => (
                  <tr key={med._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {med.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{med.name}</div>
                      {med.brand && (
                        <div className="text-sm text-gray-500">{med.brand}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {med.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof med.price === 'number' ? med.price.toLocaleString() : med.price} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium roun-full ${(med.stock || 0) < 10 ? 'bg-red-100 text-red-800' :
                        (med.stock || 0) < 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-primary-100 text-primary-800'
                        }`}>
                        {med.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(med)}
                          className="text-primary hover:text-primary-dark"
                          aria-label="Edit medication"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(med._id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete medication"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t('pharmacy.inventory.noMedications') || 'No medications found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white roun-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingMedication
                  ? (t('pharmacy.inventory.editMedication') || 'Edit Medication')
                  : (t('pharmacy.inventory.addMedication') || 'Add Medication')
                }
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.sku') || 'SKU'} *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.name') || 'Name'} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.brand') || 'Brand'}
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.category') || 'Category'} *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pharmacy.inventory.description') || 'Description'}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.dosage') || 'Dosage'}
                    </label>
                    <input
                      type="text"
                      name="dosage"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.price') || 'Price (RWF)'} *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('pharmacy.inventory.stock') || 'Stock'} *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pharmacy.inventory.storageInstructions') || 'Storage Instructions'}
                  </label>
                  <textarea
                    name="storageInstructions"
                    value={formData.storageInstructions}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="prescriptionRequired"
                      checked={formData.prescriptionRequired}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary roun focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {t('pharmacy.inventory.prescriptionRequired') || 'Prescription Required'}
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="temperatureSensitive"
                      checked={formData.temperatureSensitive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary roun focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {t('pharmacy.inventory.temperatureSensitive') || 'Temperature Sensitive'}
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-2 roun-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? (t('pharmacy.inventory.saving') || 'Saving...')
                      : (editingMedication ? (t('pharmacy.inventory.update') || 'Update') : (t('pharmacy.inventory.add') || 'Add'))
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 roun-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('pharmacy.inventory.cancel') || 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInventory;
