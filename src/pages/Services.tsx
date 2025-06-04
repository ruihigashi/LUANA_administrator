// src/pages/Services.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ChevronDown,
  Clock,
  Edit,
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

type SetMenu = {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string;
  created_at: string;
};

export default function Services() {
  // ────────────────────────────────────────────────────────────────
  // タブ切り替え: 'single' → 単品サービス, 'set' → セットメニュー
  // ────────────────────────────────────────────────────────────────
  const [menuType, setMenuType] = useState<'single' | 'set'>('single');

  // ────────────────────────────────────────────────────────────────
  // 【単品サービス用ステート】
  // ────────────────────────────────────────────────────────────────
  const [services, setServices] = useState<Service[]>([]);
  const [loadingSingle, setLoadingSingle] = useState<boolean>(true);
  const [searchQuerySingle, setSearchQuerySingle] = useState<string>('');
  const [categoryFilterSingle, setCategoryFilterSingle] = useState<string>('all');
  const [sortBySingle, setSortBySingle] = useState<string>('name_asc');

  // 追加フォーム（単品）
  const [showAddFormSingle, setShowAddFormSingle] = useState<boolean>(false);
  const [newNameSingle, setNewNameSingle] = useState<string>('');
  const [newDescriptionSingle, setNewDescriptionSingle] = useState<string>('');
  const [newDurationSingle, setNewDurationSingle] = useState<number>(30);
  const [newPriceSingle, setNewPriceSingle] = useState<number>(0);
  const [newCategorySingle, setNewCategorySingle] = useState<string>('');
  const [addFormLoadingSingle, setAddFormLoadingSingle] = useState<boolean>(false);
  const [addFormErrorSingle, setAddFormErrorSingle] = useState<string | null>(null);

  // 編集フォーム（単品）
  const [showEditFormSingle, setShowEditFormSingle] = useState<boolean>(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editNameSingle, setEditNameSingle] = useState<string>('');
  const [editDescriptionSingle, setEditDescriptionSingle] = useState<string>('');
  const [editDurationSingle, setEditDurationSingle] = useState<number>(30);
  const [editPriceSingle, setEditPriceSingle] = useState<number>(0);
  const [editCategorySingle, setEditCategorySingle] = useState<string>('');
  const [editFormLoadingSingle, setEditFormLoadingSingle] = useState<boolean>(false);
  const [editFormErrorSingle, setEditFormErrorSingle] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────────
  // 【セットメニュー用ステート】
  // ────────────────────────────────────────────────────────────────
  const [setMenus, setSetMenus] = useState<SetMenu[]>([]);
  const [loadingSet, setLoadingSet] = useState<boolean>(true);
  const [searchQuerySet, setSearchQuerySet] = useState<string>('');
  const [categoryFilterSet, setCategoryFilterSet] = useState<string>('all');
  const [sortBySet, setSortBySet] = useState<string>('name_asc');

  // 追加フォーム（セット）
  const [showAddFormSet, setShowAddFormSet] = useState<boolean>(false);
  const [newNameSet, setNewNameSet] = useState<string>('');
  const [newDescriptionSet, setNewDescriptionSet] = useState<string>('');
  const [newDurationSet, setNewDurationSet] = useState<number>(30);
  const [newPriceSet, setNewPriceSet] = useState<number>(0);
  const [newCategorySet, setNewCategorySet] = useState<string>('');
  const [addFormLoadingSet, setAddFormLoadingSet] = useState<boolean>(false);
  const [addFormErrorSet, setAddFormErrorSet] = useState<string | null>(null);

  // 編集フォーム（セット）
  const [showEditFormSet, setShowEditFormSet] = useState<boolean>(false);
  const [editSetMenu, setEditSetMenu] = useState<SetMenu | null>(null);
  const [editNameSet, setEditNameSet] = useState<string>('');
  const [editDescriptionSet, setEditDescriptionSet] = useState<string>('');
  const [editDurationSet, setEditDurationSet] = useState<number>(30);
  const [editPriceSet, setEditPriceSet] = useState<number>(0);
  const [editCategorySet, setEditCategorySet] = useState<string>('');
  const [editFormLoadingSet, setEditFormLoadingSet] = useState<boolean>(false);
  const [editFormErrorSet, setEditFormErrorSet] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────────
  // 初回マウント時に両方のデータを取得
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchServices();
    fetchSetMenus();
  }, []);

  // ────────────────────────────────────────────────────────────────
  // 単品サービス取得
  // ────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────
  // 単品サービス取得 (Service 型)
  // ────────────────────────────────────────────────────────────────
  async function fetchServices() {
    setLoadingSingle(true);
    try {
      const { data, error } = await supabase
        .from<'services', Service>('services')  // ← テーブル名リテラル & 行型 を渡す
        .select('*')                            // ← この select(*)
        .order('id');                           // ← が必要

      if (error) throw error;                  // ← ここで error を参照できるのは、
      if (data) {                              //     select() の戻り値が PostgrestResponse 型だからです
        setServices(data);
      }
    } catch (err) {
      console.error('サービス取得エラー:', err);
    } finally {
      setLoadingSingle(false);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // セットメニュー取得 (SetMenu 型)
  // ────────────────────────────────────────────────────────────────
  async function fetchSetMenus() {
    setLoadingSet(true);
    try {
      const { data, error } = await supabase
        .from<'set_menus', SetMenu>('set_menus') // ← テーブル名リテラル & 行型
        .select('*')                            // ← 必ず select(*) をつなげる
        .order('id');                           // ← で PostgrestResponse になる

      if (error) throw error;
      if (data) {
        setSetMenus(data);
      }
    } catch (err) {
      console.error('セットメニュー取得エラー:', err);
    } finally {
      setLoadingSet(false);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 1) カテゴリリスト作成 (単品 / セット)
  // ────────────────────────────────────────────────────────────────
  const categoriesSingle = Array.from(new Set(services.map((s) => s.category)));
  const categoriesSet = Array.from(new Set(setMenus.map((m) => m.category)));

  // ────────────────────────────────────────────────────────────────
  // 2) 検索・フィルタ・ソート後の配列を作成 (単品)
  // ────────────────────────────────────────────────────────────────
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuerySingle.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchQuerySingle.toLowerCase()));
    const matchesCategory =
      categoryFilterSingle === 'all' || service.category === categoryFilterSingle;
    return matchesSearch && matchesCategory;
  });
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBySingle) {
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

  // ────────────────────────────────────────────────────────────────
  // 3) 検索・フィルタ・ソート後の配列を作成 (セット)
  // ────────────────────────────────────────────────────────────────
  const filteredSetMenus = setMenus.filter((menu) => {
    const matchesSearch =
      menu.name.toLowerCase().includes(searchQuerySet.toLowerCase()) ||
      (menu.description &&
        menu.description.toLowerCase().includes(searchQuerySet.toLowerCase()));
    const matchesCategory =
      categoryFilterSet === 'all' || menu.category === categoryFilterSet;
    return matchesSearch && matchesCategory;
  });
  const sortedSetMenus = [...filteredSetMenus].sort((a, b) => {
    switch (sortBySet) {
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

  // ────────────────────────────────────────────────────────────────
  // 4) 追加フォームクリア (単品)
  // ────────────────────────────────────────────────────────────────
  const clearAddFormSingle = () => {
    setNewNameSingle('');
    setNewDescriptionSingle('');
    setNewDurationSingle(30);
    setNewPriceSingle(0);
    setNewCategorySingle('');
    setAddFormErrorSingle(null);
  };

  // ────────────────────────────────────────────────────────────────
  // 5) 追加フォームクリア (セット)
  // ────────────────────────────────────────────────────────────────
  const clearAddFormSet = () => {
    setNewNameSet('');
    setNewDescriptionSet('');
    setNewDurationSet(30);
    setNewPriceSet(0);
    setNewCategorySet('');
    setAddFormErrorSet(null);
  };

  // ────────────────────────────────────────────────────────────────
  // 6) 単品サービス 追加
  // ────────────────────────────────────────────────────────────────
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormErrorSingle(null);

    if (!newNameSingle.trim()) {
      setAddFormErrorSingle('サービス名を入力してください。');
      return;
    }
    if (!newCategorySingle.trim()) {
      setAddFormErrorSingle('カテゴリを入力してください。');
      return;
    }
    if (newPriceSingle < 0) {
      setAddFormErrorSingle('価格は 0 以上を指定してください。');
      return;
    }
    if (newDurationSingle <= 0) {
      setAddFormErrorSingle('所要時間は 1 分以上を指定してください。');
      return;
    }

    setAddFormLoadingSingle(true);
    try {
      const { error } = await supabase.from('services').insert([
        {
          name: newNameSingle.trim(),
          description: newDescriptionSingle.trim() || null,
          duration: newDurationSingle,
          price: newPriceSingle,
          category: newCategorySingle.trim(),
        },
      ]);
      if (error) throw error;
      await fetchServices();
      clearAddFormSingle();
      setShowAddFormSingle(false);
    } catch (err: any) {
      console.error('サービス追加エラー:', err);
      setAddFormErrorSingle('サービスの追加に失敗しました。再度お試しください。');
    } finally {
      setAddFormLoadingSingle(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 7) セットメニュー 追加
  // ────────────────────────────────────────────────────────────────
  const handleAddSetMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormErrorSet(null);

    if (!newNameSet.trim()) {
      setAddFormErrorSet('メニュー名を入力してください。');
      return;
    }
    if (!newCategorySet.trim()) {
      setAddFormErrorSet('カテゴリを入力してください。');
      return;
    }
    if (newPriceSet < 0) {
      setAddFormErrorSet('価格は 0 以上を指定してください。');
      return;
    }
    if (newDurationSet <= 0) {
      setAddFormErrorSet('所要時間は 1 分以上を指定してください。');
      return;
    }

    setAddFormLoadingSet(true);
    try {
      const { error } = await supabase.from('set_menus').insert([
        {
          name: newNameSet.trim(),
          description: newDescriptionSet.trim() || null,
          duration: newDurationSet,
          price: newPriceSet,
          category: newCategorySet.trim(),
        },
      ]);
      if (error) throw error;
      await fetchSetMenus();
      clearAddFormSet();
      setShowAddFormSet(false);
    } catch (err: any) {
      console.error('セットメニュー追加エラー:', err);
      setAddFormErrorSet('メニューの追加に失敗しました。再度お試しください。');
    } finally {
      setAddFormLoadingSet(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 8) 単品サービス 編集フォームを開く
  // ────────────────────────────────────────────────────────────────
  const openEditFormSingle = (service: Service) => {
    setEditService(service);
    setEditNameSingle(service.name);
    setEditDescriptionSingle(service.description || '');
    setEditDurationSingle(service.duration);
    setEditPriceSingle(service.price);
    setEditCategorySingle(service.category);
    setEditFormErrorSingle(null);
    setShowEditFormSingle(true);
  };

  // ────────────────────────────────────────────────────────────────
  // 9) セットメニュー 編集フォームを開く
  // ────────────────────────────────────────────────────────────────
  const openEditFormSet = (menu: SetMenu) => {
    setEditSetMenu(menu);
    setEditNameSet(menu.name);
    setEditDescriptionSet(menu.description || '');
    setEditDurationSet(menu.duration);
    setEditPriceSet(menu.price);
    setEditCategorySet(menu.category);
    setEditFormErrorSet(null);
    setShowEditFormSet(true);
  };

  // ────────────────────────────────────────────────────────────────
  // 10) 単品サービス 編集確定
  // ────────────────────────────────────────────────────────────────
  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;

    setEditFormErrorSingle(null);
    if (!editNameSingle.trim()) {
      setEditFormErrorSingle('サービス名を入力してください。');
      return;
    }
    if (!editCategorySingle.trim()) {
      setEditFormErrorSingle('カテゴリを入力してください。');
      return;
    }
    if (editPriceSingle < 0) {
      setEditFormErrorSingle('価格は 0 以上を指定してください。');
      return;
    }
    if (editDurationSingle <= 0) {
      setEditFormErrorSingle('所要時間は 1 分以上を指定してください。');
      return;
    }

    setEditFormLoadingSingle(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: editNameSingle.trim(),
          description: editDescriptionSingle.trim() || null,
          duration: editDurationSingle,
          price: editPriceSingle,
          category: editCategorySingle.trim(),
        })
        .eq('id', editService.id);
      if (error) throw error;
      await fetchServices();
      setShowEditFormSingle(false);
      setEditService(null);
    } catch (err: any) {
      console.error('サービス編集エラー:', err);
      setEditFormErrorSingle('編集の保存に失敗しました。再度お試しください。');
    } finally {
      setEditFormLoadingSingle(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 11) セットメニュー 編集確定
  // ────────────────────────────────────────────────────────────────
  const handleEditSetMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSetMenu) return;

    setEditFormErrorSet(null);
    if (!editNameSet.trim()) {
      setEditFormErrorSet('メニュー名を入力してください。');
      return;
    }
    if (!editCategorySet.trim()) {
      setEditFormErrorSet('カテゴリを入力してください。');
      return;
    }
    if (editPriceSet < 0) {
      setEditFormErrorSet('価格は 0 以上を指定してください。');
      return;
    }
    if (editDurationSet <= 0) {
      setEditFormErrorSet('所要時間は 1 分以上を指定してください。');
      return;
    }

    setEditFormLoadingSet(true);
    try {
      const { error } = await supabase
        .from('set_menus')
        .update({
          name: editNameSet.trim(),
          description: editDescriptionSet.trim() || null,
          duration: editDurationSet,
          price: editPriceSet,
          category: editCategorySet.trim(),
        })
        .eq('id', editSetMenu.id);
      if (error) throw error;
      await fetchSetMenus();
      setShowEditFormSet(false);
      setEditSetMenu(null);
    } catch (err: any) {
      console.error('セットメニュー編集エラー:', err);
      setEditFormErrorSet('編集の保存に失敗しました。再度お試しください。');
    } finally {
      setEditFormLoadingSet(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 12) 削除ハンドラ（単品）
  // ────────────────────────────────────────────────────────────────
  const handleDeleteService = async (serviceId: number) => {
    const confirmed = window.confirm('本当にこのサービスを削除しますか？');
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (error) throw error;
      await fetchServices();
    } catch (err: any) {
      console.error('サービス削除エラー:', err);
      alert('削除に失敗しました。再度お試しください。');
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 13) 削除ハンドラ（セット）
  // ────────────────────────────────────────────────────────────────
  const handleDeleteSetMenu = async (menuId: number) => {
    const confirmed = window.confirm('本当にこのセットメニューを削除しますか？');
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('set_menus').delete().eq('id', menuId);
      if (error) throw error;
      await fetchSetMenus();
    } catch (err: any) {
      console.error('セットメニュー削除エラー:', err);
      alert('削除に失敗しました。再度お試しください。');
    }
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* タブ切り替えボタン */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setMenuType('single')}
          className={`
            px-6 py-2 rounded-md text-xs sm:text-base border font-medium transition-colors duration-200
            ${menuType === 'single'
              ? 'bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          単品メニュー
        </button>
        <button
          onClick={() => setMenuType('set')}
          className={`
            px-6 py-2 rounded-md text-xs border sm:text-base font-medium transition-colors duration-200
            ${menuType === 'set'
              ? 'bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          セットメニュー
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 「単品サービス管理」タブ選択時 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {menuType === 'single' && (
        <>
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              単品メニュー管理
            </h1>
            <button
              onClick={() => {
                clearAddFormSingle();
                setShowAddFormSingle(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-base font-medium rounded-md shadow transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              メニューを追加
            </button>
          </div>

          {/* 検索・フィルタ・ソート */}
          <div className="bg-white shadow rounded-lg px-6 py-5 mb-8">
            <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* 検索入力 (単品) */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="メニューを検索..."
                  value={searchQuerySingle}
                  onChange={(e) => setSearchQuerySingle(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                />
              </div>

              {/* カテゴリフィルター (単品) */}
              <div className="relative inline-block text-left">
                <label htmlFor="category-select-single" className="sr-only">
                  カテゴリ
                </label>
                <select
                  id="category-select-single"
                  value={categoryFilterSingle}
                  onChange={(e) => setCategoryFilterSingle(e.target.value)}
                  className="
                    appearance-none
                    inline-flex justify-between w-full rounded-md
                    border border-gray-300 shadow-sm px-4 py-2
                    bg-white text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    transition-colors duration-200
                    pr-10
                  "
                >
                  <option value="all">カテゴリ: すべて</option>
                  {categoriesSingle.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* 並び替え (単品) */}
              <div className="relative inline-block text-left">
                <label htmlFor="sort-select-single" className="sr-only">
                  並び替え
                </label>
                <select
                  id="sort-select-single"
                  value={sortBySingle}
                  onChange={(e) => setSortBySingle(e.target.value)}
                  className="
                    appearance-none
                    inline-flex justify-between w-full rounded-md
                    border border-gray-300 shadow-sm px-4 py-2
                    bg-white text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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

          {/* サービスカードグリッド (単品) */}
          {loadingSingle ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* 上部: タイトル＋説明 */}
                  <div className="px-5 py-6 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {service.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {service.description || '説明なし'}
                    </p>
                  </div>

                  {/* 時間・価格を灰色枠の外、カード下の上端に固定表示 */}
                  <div className="px-5">
                    <div className="flex justify-between items-center text-sm text-gray-600">
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

                  {/* 固定高さの下部灰色枠: 編集・削除ボタンを下端に配置 */}
                  <div className="mt-2 bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end space-x-3 h-10">
                    <button
                      onClick={() => openEditFormSingle(service)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
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
              ))}
            </div>
          )}

          {/* ========== 単品 サービス追加モーダルフォーム ========== */}
          {showAddFormSingle && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md mx-auto">
                {/* フォームヘッダー */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    サービスを追加
                  </h2>
                  <button
                    onClick={() => setShowAddFormSingle(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* フォーム本体 */}
                <form
                  onSubmit={handleAddService}
                  className="px-6 py-6 space-y-4"
                >
                  {addFormErrorSingle && (
                    <p className="text-red-600 text-sm">{addFormErrorSingle}</p>
                  )}

                  <div>
                    <label
                      htmlFor="new-name-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      サービス名<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="new-name-single"
                      value={newNameSingle}
                      onChange={(e) => setNewNameSingle(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-description-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      説明
                    </label>
                    <textarea
                      id="new-description-single"
                      value={newDescriptionSingle}
                      onChange={(e) => setNewDescriptionSingle(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-duration-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      所要時間（分）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="new-duration-single"
                      min={1}
                      value={newDurationSingle}
                      onChange={(e) => setNewDurationSingle(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-price-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      価格（円）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="new-price-single"
                      min={0}
                      value={newPriceSingle}
                      onChange={(e) => setNewPriceSingle(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-category-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      カテゴリ<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="new-category-single"
                      value={newCategorySingle}
                      onChange={(e) => setNewCategorySingle(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        clearAddFormSingle();
                        setShowAddFormSingle(false);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={addFormLoadingSingle}
                      className={`
                        px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200
                        ${addFormLoadingSingle ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {addFormLoadingSingle ? '保存中...' : '保存'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========== ここまで 単品 サービス追加モーダルフォーム ========== */}

          {/* ========== 単品 サービス編集モーダルフォーム ========== */}
          {showEditFormSingle && editService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md mx-auto">
                {/* 編集フォームヘッダー */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    サービスを編集
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditFormSingle(false);
                      setEditService(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 編集フォーム本体 */}
                <form
                  onSubmit={handleEditService}
                  className="px-6 py-6 space-y-4"
                >
                  {editFormErrorSingle && (
                    <p className="text-red-600 text-sm">{editFormErrorSingle}</p>
                  )}

                  <div>
                    <label
                      htmlFor="edit-name-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      サービス名<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name-single"
                      value={editNameSingle}
                      onChange={(e) => setEditNameSingle(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-description-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      説明
                    </label>
                    <textarea
                      id="edit-description-single"
                      value={editDescriptionSingle}
                      onChange={(e) => setEditDescriptionSingle(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-duration-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      所要時間（分）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-duration-single"
                      min={1}
                      value={editDurationSingle}
                      onChange={(e) =>
                        setEditDurationSingle(Number(e.target.value))
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />  
                  </div>

                  <div>
                    <label
                      htmlFor="edit-price-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      価格（円）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-price-single"
                      min={0}
                      value={editPriceSingle}
                      onChange={(e) =>
                        setEditPriceSingle(Number(e.target.value))
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-category-single"
                      className="block text-sm font-medium text-gray-700"
                    >
                      カテゴリ<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-category-single"
                      value={editCategorySingle}
                      onChange={(e) => setEditCategorySingle(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditFormSingle(false);
                        setEditService(null);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={editFormLoadingSingle}
                      className={`
                        px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200
                        ${editFormLoadingSingle ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {editFormLoadingSingle ? '保存中...' : '保存'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* ========== ここまで 単品 サービス編集モーダルフォーム ========== */}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 「セットメニュー管理」タブ選択時 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {menuType === 'set' && (
        <>
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              セットメニュー管理
            </h1>
            <button
              onClick={() => {
                clearAddFormSet();
                setShowAddFormSet(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-base font-medium rounded-md shadow transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              メニューを追加
            </button>
          </div>

          {/* 検索・フィルタ・ソート */}
          <div className="bg-white shadow rounded-lg px-6 py-5 mb-8">
            <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* 検索入力 (セット) */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="メニューを検索..."
                  value={searchQuerySet}
                  onChange={(e) => setSearchQuerySet(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                />
              </div>

              {/* カテゴリフィルター (セット) */}
              <div className="relative inline-block text-left">
                <label htmlFor="category-select-set" className="sr-only">
                  カテゴリ
                </label>
                <select
                  id="category-select-set"
                  value={categoryFilterSet}
                  onChange={(e) => setCategoryFilterSet(e.target.value)}
                  className="
                    appearance-none
                    inline-flex justify-between w-full rounded-md
                    border border-gray-300 shadow-sm px-4 py-2
                    bg-white text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    transition-colors duration-200
                    pr-10
                  "
                >
                  <option value="all">カテゴリ: すべて</option>
                  {categoriesSet.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* 並び替え (セット) */}
              <div className="relative inline-block text-left">
                <label htmlFor="sort-select-set" className="sr-only">
                  並び替え
                </label>
                <select
                  id="sort-select-set"
                  value={sortBySet}
                  onChange={(e) => setSortBySet(e.target.value)}
                  className="
                    appearance-none
                    inline-flex justify-between w-full rounded-md
                    border border-gray-300 shadow-sm px-4 py-2
                    bg-white text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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

          {/* セットメニューカードグリッド */}
          {loadingSet ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSetMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* 上部: タイトル＋説明 */}
                  <div className="px-5 py-6 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {menu.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {menu.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {menu.description || '説明なし'}
                    </p>
                  </div>

                  {/* 時間・価格を灰色枠の外、カード下の上端に固定表示 */}
                  <div className="px-5">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{menu.duration} 分</span>
                      </div>
                      <div className="flex items-center font-semibold text-gray-900">
                        <span className="mr-1">¥</span>
                        <span>{menu.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 固定高さの下部灰色枠: 編集・削除ボタンを下端に配置 */}
                  <div className="mt-2 bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end space-x-3 h-10">
                    <button
                      onClick={() => openEditFormSet(menu)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSetMenu(menu.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== セット メニュー追加モーダルフォーム ========== */}
          {showAddFormSet && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md mx-auto">
                {/* フォームヘッダー */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    セットメニューを追加
                  </h2>
                  <button
                    onClick={() => setShowAddFormSet(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* フォーム本体 */}
                <form
                  onSubmit={handleAddSetMenu}
                  className="px-6 py-6 space-y-4"
                >
                  {addFormErrorSet && (
                    <p className="text-red-600 text-sm">{addFormErrorSet}</p>
                  )}

                  <div>
                    <label
                      htmlFor="new-name-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      メニュー名<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="new-name-set"
                      value={newNameSet}
                      onChange={(e) => setNewNameSet(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-description-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      説明
                    </label>
                    <textarea
                      id="new-description-set"
                      value={newDescriptionSet}
                      onChange={(e) => setNewDescriptionSet(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-duration-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      所要時間（分）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="new-duration-set"
                      min={1}
                      value={newDurationSet}
                      onChange={(e) => setNewDurationSet(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-price-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      価格（円）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="new-price-set"
                      min={0}
                      value={newPriceSet}
                      onChange={(e) => setNewPriceSet(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-category-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      カテゴリ<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="new-category-set"
                      value={newCategorySet}
                      onChange={(e) => setNewCategorySet(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        clearAddFormSet();
                        setShowAddFormSet(false);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={addFormLoadingSet}
                      className={`
                        px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200
                        ${addFormLoadingSet ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {addFormLoadingSet ? '保存中...' : '保存'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* ========== ここまで セット メニュー追加モーダルフォーム ========== */}

          {/* ========== セット メニュー編集モーダルフォーム ========== */}
          {showEditFormSet && editSetMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md mx-auto">
                {/* 編集フォームヘッダー */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    セットメニューを編集
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditFormSet(false);
                      setEditSetMenu(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 編集フォーム本体 */}
                <form
                  onSubmit={handleEditSetMenu}
                  className="px-6 py-6 space-y-4"
                >
                  {editFormErrorSet && (
                    <p className="text-red-600 text-sm">{editFormErrorSet}</p>
                  )}

                  <div>
                    <label
                      htmlFor="edit-name-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      メニュー名<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name-set"
                      value={editNameSet}
                      onChange={(e) => setEditNameSet(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-description-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      説明
                    </label>
                    <textarea
                      id="edit-description-set"
                      value={editDescriptionSet}
                      onChange={(e) => setEditDescriptionSet(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-duration-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      所要時間（分）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-duration-set"
                      min={1}
                      value={editDurationSet}
                      onChange={(e) => setEditDurationSet(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-price-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      価格（円）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-price-set"
                      min={0}
                      value={editPriceSet}
                      onChange={(e) => setEditPriceSet(Number(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-category-set"
                      className="block text-sm font-medium text-gray-700"
                    >
                      カテゴリ<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-category-set"
                      value={editCategorySet}
                      onChange={(e) => setEditCategorySet(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditFormSet(false);
                        setEditSetMenu(null);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={editFormLoadingSet}
                      className={`
                        px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200
                        ${editFormLoadingSet ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {editFormLoadingSet ? '保存中...' : '保存'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* ========== ここまで セット メニュー編集モーダルフォーム ========== */}
        </>
      )}
    </div>
  );
}
