// src/pages/Services.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ChevronDown,
  Clock,
  Edit,
  Filter,
  Plus,
  Search,
  Trash,
  X,
} from 'lucide-react';

type Service = {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string;
  created_at: string;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string>('name_asc');

  // 「追加フォームを開く/閉じる」
  const [showAddForm, setShowAddForm] = useState(false);

  // 追加フォーム用ステート
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newCategory, setNewCategory] = useState('');
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // 「編集フォームを開く/閉じる」
  const [showEditForm, setShowEditForm] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);

  // 編集フォーム用ステート
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCategory, setEditCategory] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('id');
      if (error) throw error;
      if (data) {
        setServices(data);
      }
    } catch (error) {
      console.error('サービスの取得中にエラーが発生しました:', error);
    } finally {
      setLoading(false);
    }
  }

  // 一意のカテゴリリストを作成
  const categories = Array.from(new Set(services.map((service) => service.category)));

  // 検索・カテゴリフィルタ
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 並び替え
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'duration_asc':
        return a.duration - b.duration;
      case 'duration_desc':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  // 追加フォームのクリア
  const clearAddForm = () => {
    setNewName('');
    setNewDescription('');
    setNewDuration(30);
    setNewPrice(0);
    setNewCategory('');
    setAddFormError(null);
  };

  // 追加フォーム送信
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!newName.trim()) {
      setAddFormError('サービス名を入力してください。');
      return;
    }
    if (!newCategory.trim()) {
      setAddFormError('カテゴリを入力してください。');
      return;
    }
    if (newPrice < 0) {
      setAddFormError('価格は 0 以上を指定してください。');
      return;
    }
    if (newDuration <= 0) {
      setAddFormError('所要時間は 1 分以上を指定してください。');
      return;
    }

    setAddFormLoading(true);
    try {
      const { error } = await supabase.from('services').insert([
        {
          name: newName.trim(),
          description: newDescription.trim() || null,
          duration: newDuration,
          price: newPrice,
          category: newCategory.trim(),
        },
      ]);
      if (error) throw error;
      await fetchServices();
      clearAddForm();
      setShowAddForm(false);
    } catch (err: any) {
      console.error('サービス追加中にエラーが発生しました:', err);
      setAddFormError('サービスの追加に失敗しました。再度お試しください。');
    } finally {
      setAddFormLoading(false);
    }
  };

  // 編集フォーム用に値をセットして開く
  const openEditForm = (service: Service) => {
    setEditService(service);
    setEditName(service.name);
    setEditDescription(service.description || '');
    setEditDuration(service.duration);
    setEditPrice(service.price);
    setEditCategory(service.category);
    setEditFormError(null);
    setShowEditForm(true);
  };

  // 編集フォームの送信
  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;

    setEditFormError(null);
    if (!editName.trim()) {
      setEditFormError('サービス名を入力してください。');
      return;
    }
    if (!editCategory.trim()) {
      setEditFormError('カテゴリを入力してください。');
      return;
    }
    if (editPrice < 0) {
      setEditFormError('価格は 0 以上を指定してください。');
      return;
    }
    if (editDuration <= 0) {
      setEditFormError('所要時間は 1 分以上を指定してください。');
      return;
    }

    setEditFormLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          duration: editDuration,
          price: editPrice,
          category: editCategory.trim(),
        })
        .eq('id', editService.id);
      if (error) throw error;
      await fetchServices();
      setShowEditForm(false);
      setEditService(null);
    } catch (err: any) {
      console.error('サービス更新中にエラーが発生しました:', err);
      setEditFormError('編集の保存に失敗しました。再度お試しください。');
    } finally {
      setEditFormLoading(false);
    }
  };

  // 削除ハンドラ
  const handleDeleteService = async (serviceId: number) => {
    const confirmed = window.confirm('本当にこのサービスを削除しますか？');
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (error) throw error;
      await fetchServices();
    } catch (err: any) {
      console.error('サービス削除中にエラーが発生しました:', err);
      alert('削除に失敗しました。再度お試しください。');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          サービス一覧管理
        </h1>
        <button
          onClick={() => {
            clearAddForm();
            setShowAddForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          サービスを追加
        </button>
      </div>

      {/* 検索・フィルタ・ソート */}
      <div className="bg-white shadow rounded-lg px-6 py-5 mb-8">
        <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* 検索入力 */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="サービスを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 text-sm"
            />
          </div>

          {/* カテゴリフィルター */}
          <div className="relative inline-block text-left">
            <label htmlFor="category-select" className="sr-only">
              カテゴリ
            </label>
            <select
              id="category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="
                appearance-none 
                inline-flex justify-between w-full rounded-md
                border border-gray-300 shadow-sm px-4 py-2
                bg-white text-sm font-medium text-gray-700
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
                transition-colors duration-200
                pr-10
              "
            >
              <option value="all">カテゴリ: すべて</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* 並び替え */}
          <div className="relative inline-block text-left">
            <label htmlFor="sort-select" className="sr-only">
              並び替え
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="
                appearance-none
                inline-flex justify-between w-full rounded-md
                border border-gray-300 shadow-sm px-4 py-2
                bg-white text-sm font-medium text-gray-700
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
                transition-colors duration-200
                pr-10
              "
            >
              <option value="name_asc">名前昇順</option>
              <option value="name_desc">名前降順</option>
              <option value="price_asc">価格昇順</option>
              <option value="price_desc">価格降順</option>
              <option value="duration_asc">所要時間昇順</option>
              <option value="duration_desc">所要時間降順</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* サービスカードグリッド */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-pink-700 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    {service.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {service.description || '説明なし'}
                </p>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{service.duration} 分</span>
                  </div>
                  <div className="flex items-center font-semibold text-gray-900">
                    <span className="mr-1">¥</span>
                    <span>{service.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => openEditForm(service)}
                    className="text-pink-600 hover:text-pink-800 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== サービス追加モーダルフォーム ========== */}
      {showAddForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md mx-auto">
            {/* フォームヘッダー */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">サービスを追加</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* フォーム本体 */}
            <form onSubmit={handleAddService} className="px-6 py-6 space-y-4">
              {addFormError && <p className="text-red-600 text-sm">{addFormError}</p>}

              <div>
                <label
                  htmlFor="new-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  サービス名<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="new-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  説明
                </label>
                <textarea
                  id="new-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="new-duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  所要時間（分）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="new-duration"
                  min={1}
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="new-price"
                  className="block text-sm font-medium text-gray-700"
                >
                  価格（円）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="new-price"
                  min={0}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="new-category"
                  className="block text-sm font-medium text-gray-700"
                >
                  カテゴリ<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    clearAddForm();
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={addFormLoading}
                  className={`
                    px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md shadow transition-colors duration-200
                    ${addFormLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {addFormLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========== ここまでサービス追加モーダルフォーム ========== */}

      {/* ========== サービス編集モーダルフォーム ========== */}
      {showEditForm && editService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md mx-auto">
            {/* 編集フォームヘッダー */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">サービスを編集</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditService(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 編集フォーム本体 */}
            <form onSubmit={handleEditService} className="px-6 py-6 space-y-4">
              {editFormError && <p className="text-red-600 text-sm">{editFormError}</p>}

              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  サービス名<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  説明
                </label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  所要時間（分）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit-duration"
                  min={1}
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-price"
                  className="block text-sm font-medium text-gray-700"
                >
                  価格（円）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="edit-price"
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category"
                  className="block text-sm font-medium text-gray-700"
                >
                  カテゴリ<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditService(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={editFormLoading}
                  className={`
                    px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md shadow transition-colors duration-200
                    ${editFormLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {editFormLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========== ここまでサービス編集モーダルフォーム ========== */}
    </div>
  );
}
