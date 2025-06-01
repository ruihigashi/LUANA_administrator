// src/components/Customers.tsx

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  ChevronDown,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  User,
  X,
} from 'lucide-react';

type Customer = {
  id: number;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  phone: string;
  created_at: string;
};

export default function Customers() {
  // ────────────────────
  // ステート定義
  // ────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'recent'>('name_asc');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // 「追加モーダルを開く/閉じる」フラグ
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  // 「編集用モーダルを開く/閉じる」フラグと、編集中の顧客情報
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // モーダル外クリック検知用 refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  // ────────────────────
  // 初回フェッチ＆外側クリックでドロップダウン／モーダルを閉じる
  // ────────────────────
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ドロップダウン、モーダル外をクリックしたら閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        addModalRef.current &&
        !addModalRef.current.contains(event.target as Node)
      ) {
        // もし追加モーダルが開いているなら閉じる
        if (isAddModalOpen) setIsAddModalOpen(false);
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target as Node)
      ) {
        // もし編集モーダルが開いているなら閉じる
        if (isEditModalOpen) {
          setIsEditModalOpen(false);
          setEditingCustomer(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddModalOpen, isEditModalOpen]);

  // ────────────────────
  // Supabase から顧客一覧を取得する
  // ────────────────────
  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('last_name', { ascending: true });

      if (customersError) {
        throw customersError;
      }
      setCustomers(customersData as Customer[]);
    } catch (error) {
      console.error('顧客情報の取得中にエラーが発生しました:', error);
    } finally {
      setLoading(false);
    }
  }

  // ────────────────────
  // フィルタリング＆ソート
  // ────────────────────
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.last_name} ${customer.first_name}`.toLowerCase();
    const fullKana = `${customer.last_name_kana} ${customer.first_name_kana}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      fullKana.includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
      case 'name_desc':
        return `${b.last_name} ${b.first_name}`.localeCompare(`${a.last_name} ${a.first_name}`);
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  // ────────────────────
  // 削除処理
  // ────────────────────
  async function handleDelete(id: number) {
    if (!window.confirm('本当にこの顧客を削除しますか？')) return;
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        alert('削除に失敗しました: ' + error.message);
      } else {
        await fetchCustomers();
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  }

  // ────────────────────
  // ライフサイクルとして編集ボタンが押されたとき
  // ────────────────────
  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  }

  // ────────────────────
  // 追加モーダルのフォーム用ステート
  // ────────────────────
  const [newLastName, setNewLastName] = useState<string>('');
  const [newFirstName, setNewFirstName] = useState<string>('');
  const [newLastNameKana, setNewLastNameKana] = useState<string>('');
  const [newFirstNameKana, setNewFirstNameKana] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');

  // ────────────────────
  // 追加モーダル バリデーション判定
  // ────────────────────
  const isAddFormValid =
    newLastName.trim() !== '' &&
    newFirstName.trim() !== '' &&
    newLastNameKana.trim() !== '' &&
    newFirstNameKana.trim() !== '' &&
    newPhone.trim() !== '';

  // ────────────────────
  // 追加処理
  // ────────────────────
  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddFormValid) {
      alert('すべての項目を入力してください');
      return;
    }
    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          last_name: newLastName,
          first_name: newFirstName,
          last_name_kana: newLastNameKana,
          first_name_kana: newFirstNameKana,
          phone: newPhone,
        });
      if (error) {
        throw error;
      }
      // 成功したらリセットしてテーブル再読み込み
      setNewLastName('');
      setNewFirstName('');
      setNewLastNameKana('');
      setNewFirstNameKana('');
      setNewPhone('');
      setIsAddModalOpen(false);
      await fetchCustomers();
    } catch (error: any) {
      console.error('追加エラー:', error);
      alert('顧客の追加に失敗しました');
    }
  }

  // ────────────────────
  // 編集モーダルのフォーム用ステート（初期化は useEffect で）
  // ────────────────────
  const [editLastName, setEditLastName] = useState<string>('');
  const [editFirstName, setEditFirstName] = useState<string>('');
  const [editLastNameKana, setEditLastNameKana] = useState<string>('');
  const [editFirstNameKana, setEditFirstNameKana] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');

  // 「編集中の顧客」が変わったらフォームに値をコピー
  useEffect(() => {
    if (editingCustomer) {
      setEditLastName(editingCustomer.last_name);
      setEditFirstName(editingCustomer.first_name);
      setEditLastNameKana(editingCustomer.last_name_kana);
      setEditFirstNameKana(editingCustomer.first_name_kana);
      setEditPhone(editingCustomer.phone);
    } else {
      // null なら初期化
      setEditLastName('');
      setEditFirstName('');
      setEditLastNameKana('');
      setEditFirstNameKana('');
      setEditPhone('');
    }
  }, [editingCustomer]);

  // ────────────────────
  // 編集バリデーション
  // ────────────────────
  const isEditFormValid =
    editLastName.trim() !== '' &&
    editFirstName.trim() !== '' &&
    editLastNameKana.trim() !== '' &&
    editFirstNameKana.trim() !== '' &&
    editPhone.trim() !== '';

  // ────────────────────
  // 編集処理
  // ────────────────────
  async function handleEditCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!isEditFormValid) {
      alert('すべての項目を入力してください');
      return;
    }
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          last_name: editLastName,
          first_name: editFirstName,
          last_name_kana: editLastNameKana,
          first_name_kana: editFirstNameKana,
          phone: editPhone,
        })
        .eq('id', editingCustomer.id);
      if (error) {
        throw error;
      }
      // 成功したら閉じてテーブル再読み込み
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      await fetchCustomers();
    } catch (error: any) {
      console.error('編集エラー:', error);
      alert('顧客情報の編集に失敗しました');
    }
  }

  // ────────────────────
  // JSX レンダリング
  // ────────────────────
  return (
    <div className="p-6 space-y-6 relative">
      {/** ヘッダー **/}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">顧客一覧</h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          顧客を追加
        </button>
      </div>

      {/** 検索＋並び順 **/}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 px-4 py-3">
          {/** 検索ボックス **/}
          <div className="relative w-full md:w-2/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="顧客を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/** 並び順ドロップダウン **/}
          <div ref={dropdownRef} className="relative w-full md:w-1/3">
            <button
              type="button"
              className="inline-flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              並び順：
              {sortBy === 'name_asc'
                ? ' 名前（昇順）'
                : sortBy === 'name_desc'
                ? ' 名前（降順）'
                : ' 追加日順'}
              <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSortBy('name_asc');
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      sortBy === 'name_asc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    名前（昇順）
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('name_desc');
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      sortBy === 'name_desc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    名前（降順）
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('recent');
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      sortBy === 'recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    追加日順
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/** テーブル表示エリア **/}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客（氏名）
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フリガナ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    追加日
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCustomers.length > 0 ? (
                  sortedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      {/** 氏名 **/}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-pink-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.last_name} {customer.first_name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/** フリガナ **/}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.last_name_kana} {customer.first_name_kana}
                      </td>

                      {/** 電話番号 **/}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.phone}
                      </td>

                      {/** 追加日 **/}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>

                      {/** 操作（編集・削除） **/}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-pink-600 hover:text-pink-900 mr-3"
                          aria-label="編集"
                          onClick={() => openEditModal(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          aria-label="削除"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {searchQuery
                        ? '該当する顧客が見つかりませんでした'
                        : '顧客情報がありません'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/** 追加モーダル **/}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div
            ref={addModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 md:mx-0"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">顧客を追加</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="px-4 py-5 space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">
                  姓 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    newLastName.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="山田"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  名 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    newFirstName.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="太郎"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  フリガナ（姓） <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={newLastNameKana}
                  onChange={(e) => setNewLastNameKana(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    newLastNameKana.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="ヤマダ"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  フリガナ（名） <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={newFirstNameKana}
                  onChange={(e) => setNewFirstNameKana(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    newFirstNameKana.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="タロウ"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  電話番号 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    newPhone.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="09012345678"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!isAddFormValid}
                  className={`px-4 py-2 rounded-md text-white ${
                    isAddFormValid
                      ? 'bg-pink-600 hover:bg-pink-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors`}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/** 編集モーダル **/}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div
            ref={editModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 md:mx-0"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">顧客情報を編集</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCustomer(null);
                }}
              >
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleEditCustomer} className="px-4 py-5 space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">
                  姓 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    editLastName.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="山田"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  名 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    editFirstName.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="太郎"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  フリガナ（姓） <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={editLastNameKana}
                  onChange={(e) => setEditLastNameKana(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    editLastNameKana.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="ヤマダ"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  フリガナ（名） <span className="text-red-500">必須</span>
                </label>
                <input
                  type="text"
                  value={editFirstNameKana}
                  onChange={(e) => setEditFirstNameKana(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    editFirstNameKana.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="タロウ"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  電話番号 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    editPhone.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-pink-500'
                  }`}
                  placeholder="09012345678"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCustomer(null);
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!isEditFormValid}
                  className={`px-4 py-2 rounded-md text-white ${
                    isEditFormValid
                      ? 'bg-pink-600 hover:bg-pink-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors`}
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
