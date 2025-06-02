// src/pages/Appointments.tsx

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Search,
  X,
  Trash as TrashIcon,
  Edit as EditIcon,
} from 'lucide-react';
import jaLocale from '@fullcalendar/core/locales/ja';
import { format } from 'date-fns';

type RawReservation = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | string;
  service_names: string;
  total_price: number;
  notes: string | null;
  customer_id: number;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    last_name_kana: string;
    first_name_kana: string;
    phone: string;
  }[] | null;
};

type Service = {
  id: number;
  name: string;
  duration: number; // 分
  price: number;
};

export default function Appointments() {
  const navigate = useNavigate();

  // FullCalendar 用の ref
  const calendarRef = useRef<FullCalendar>(null);

  // FullCalendar イベント
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // カレンダー／リスト切り替え
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  // 検索文字列
  const [searchQuery, setSearchQuery] = useState<string>('');
  // ステータスフィルタ
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  // ── モーダル用ステート ──
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingReservation, setEditingReservation] = useState<RawReservation | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // サービス一覧取得
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    fetchReservations();
    fetchServices();
  }, []);

  async function fetchReservations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          date,
          start_time,
          end_time,
          status,
          service_names,
          total_price,
          notes,
          customer_id,
          customer:customers (
            id,
            first_name,
            last_name,
            last_name_kana,
            first_name_kana,
            phone
          )
        `)
        .order('date', { ascending: false })
        .order('start_time', { ascending: true });
      if (error) throw error;
      const raw = data as RawReservation[];
      const formatted: EventInput[] = raw.map(resv => {
        const custArr = resv.customer;
        const cust = custArr && custArr.length > 0 ? custArr[0] : null;
        const customerName = cust ? `${cust.last_name} ${cust.first_name}` : '顧客不明';
        const startISO = `${resv.date}T${resv.start_time}`;
        const endISO = `${resv.date}T${resv.end_time}`;
        const startDateObj = new Date(startISO);
        const endDateObj = new Date(endISO);
        const diffMs = endDateObj.getTime() - startDateObj.getTime();
        const durationHours = diffMs / (1000 * 60 * 60);
        const title = `${resv.service_names} (${durationHours}h) – ${customerName}`;
        let bgColor = '#6b7280';
        switch (resv.status) {
          case 'confirmed': bgColor = '#10b981'; break;
          case 'pending':   bgColor = '#f59e0b'; break;
          case 'cancelled': bgColor = '#ef4444'; break;
        }
        return {
          id: resv.id.toString(),
          title,
          start: startISO,
          end: endISO,
          backgroundColor: bgColor,
          borderColor: bgColor,
          extendedProps: {
            customer: customerName,
            service: resv.service_names,
            status: resv.status,
            duration: durationHours,
          },
        };
      });
      setEvents(formatted);
    } catch (err) {
      console.error('予約データ取得中にエラー:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration, price')
        .order('id', { ascending: true });
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('サービス取得中にエラー:', err);
    }
  }

  // ────────────────
  // 予約ステータスを更新
  // ────────────────
  async function updateReservationStatus(reservationId: string, newStatus: 'confirmed' | 'pending' | 'cancelled') {
    try {
      await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);
      fetchReservations();
    } catch (err) {
      console.error('ステータス更新エラー:', err);
      alert('ステータスの更新に失敗しました。');
    }
  }

  // ────────────────
  // 予約削除（キャンセル）処理
  // ────────────────
  async function handleDeleteReservation(reservationId: string) {
    const confirmed = window.confirm('この予約を本当に削除してもよろしいですか？');
    if (!confirmed) return;

    try {
      await supabase.from('reservations').delete().eq('id', reservationId);
      fetchReservations();
    } catch (err) {
      console.error('予約削除エラー:', err);
      alert('予約の削除に失敗しました。');
    }
  }

  // ────────────────
  // フィルタリング
  // ────────────────
  const filteredEvents = events.filter(evt => {
    const title = (evt.title ?? '').toString().toLowerCase();
    const customer = ((evt.extendedProps as any).customer ?? '').toString().toLowerCase();
    const service = ((evt.extendedProps as any).service ?? '').toString().toLowerCase();
    const status = ((evt.extendedProps as any).status ?? '').toString();
    const q = searchQuery.toLowerCase();
    const matchesText = title.includes(q) || customer.includes(q) || service.includes(q);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesText && matchesStatus;
  });

  // ────────────────
  // イベントクリック → 編集
  // ────────────────
  const handleEventClick = async (info: EventClickArg) => {
    const id = info.event.id;
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          date,
          start_time,
          end_time,
          status,
          service_names,
          total_price,
          notes,
          customer_id,
          customer:customers (
            id,
            first_name,
            last_name,
            last_name_kana,
            first_name_kana,
            phone
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      setEditingReservation(data as RawReservation);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (err) {
      console.error('予約取得エラー:', err);
      alert('予約情報の取得に失敗しました。');
    }
  };

  // ────────────────
  // 日付セル選択でモーダルを開く（新規モード）
  // ────────────────
  const [selectedDate, setSelectedDate] = useState<string>('');
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selected = selectInfo.startStr.slice(0, 10); // "YYYY-MM-DD"
    setSelectedDate(selected);
    setIsEditMode(false);
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  // ────────────────
  // モーダル外クリックで閉じる
  // ────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
        setEditingReservation(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  // ────────────────
  // フォームステート（新規／編集兼用）
  // ────────────────
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastNameKana, setLastNameKana] = useState<string>('');
  const [firstNameKana, setFirstNameKana] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [dateValue, setDateValue] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [statusValue, setStatusValue] = useState<'confirmed' | 'pending' | 'cancelled'>('pending');
  const [notes, setNotes] = useState<string>('');

  function toggleService(id: number) {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  }

  // ────────────────
  // 新規 or 更新 予約＋顧客
  // ────────────────
  async function handleSubmitReservation(e: React.FormEvent) {
    e.preventDefault();

    // 必須項目チェック
    if (
      !lastName.trim() ||
      !firstName.trim() ||
      !lastNameKana.trim() ||
      !firstNameKana.trim() ||
      !phone.trim()
    ) {
      alert('姓名（漢字・カナ）と電話番号は必須です。');
      return;
    }
    if (selectedServiceIds.length === 0 || !dateValue || !selectedStartTime || !selectedEndTime) {
      alert('サービス・日付・開始時間・終了時間は必須です。');
      return;
    }

    // 1) 顧客を新規 or 更新
    let customerIdToUse: number;
    if (isEditMode && editingReservation) {
      // 編集モード：既存顧客を更新
      customerIdToUse = editingReservation.customer_id;
      try {
        await supabase
          .from('customers')
          .update({
            last_name: lastName.trim(),
            first_name: firstName.trim(),
            last_name_kana: lastNameKana.trim(),
            first_name_kana: firstNameKana.trim(),
            phone: phone.trim(),
          })
          .eq('id', customerIdToUse);
      } catch (err) {
        console.error('顧客更新エラー:', err);
        alert('顧客情報の更新に失敗しました。');
        return;
      }
    } else {
      // 新規モード：顧客を挿入
      try {
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .insert({
            last_name: lastName.trim(),
            first_name: firstName.trim(),
            last_name_kana: lastNameKana.trim(),
            first_name_kana: firstNameKana.trim(),
            phone: phone.trim(),
          })
          .select('id')
          .single();
        if (custError) throw custError;
        customerIdToUse = custData!.id;
      } catch (err: any) {
        console.error('顧客作成エラー:', err);
        alert('顧客の追加に失敗しました。');
        return;
      }
    }

    // 選択サービスの合計金額を計算して名称を作成
    const chosenServices = services.filter(s => selectedServiceIds.includes(s.id));
    const totalPriceCalc = chosenServices.reduce((sum, s) => sum + s.price, 0);
    const serviceNamesCalc = chosenServices.map(s => s.name).join('、');

    // 2) reservations を新規 or 更新
    if (isEditMode && editingReservation) {
      // 編集モード
      try {
        await supabase
          .from('reservations')
          .update({
            customer_id: customerIdToUse,
            date: dateValue,
            start_time: `${selectedStartTime}:00`,
            end_time: `${selectedEndTime}:00`,
            status: statusValue,
            service_names: serviceNamesCalc,
            total_price: totalPriceCalc,
            notes: notes.trim(),
          })
          .eq('id', editingReservation.id);
      } catch (err) {
        console.error('予約更新エラー:', err);
        alert('予約情報の更新に失敗しました。');
        return;
      }
    } else {
      // 新規モード
      try {
        await supabase
          .from('reservations')
          .insert({
            customer_id: customerIdToUse,
            date: dateValue,
            start_time: `${selectedStartTime}:00`,
            end_time: `${selectedEndTime}:00`,
            status: statusValue,
            service_names: serviceNamesCalc,
            total_price: totalPriceCalc,
            notes: notes.trim(),
          });
      } catch (err: any) {
        console.error('予約作成エラー:', err);
        alert('予約の作成に失敗しました。');
        return;
      }
    }

    // 3) time_slots 更新：予約枠を×にする
    try {
      await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('date', dateValue)
        .gte('start_time', `${selectedStartTime}:00`)
        .lt('start_time', `${selectedEndTime}:00`);
    } catch {
      // 念のため捕捉（エラーが出ても続行）
    }

    setIsModalOpen(false);
    setEditingReservation(null);
    resetForm();
    fetchReservations();
  }

  function resetForm() {
    setLastName('');
    setFirstName('');
    setLastNameKana('');
    setFirstNameKana('');
    setPhone('');
    setSelectedServiceIds([]);
    setDateValue('');
    setSelectedStartTime('');
    setSelectedEndTime('');
    setNotes('');
    setStatusValue('pending');
  }

  // ────────────────
  // 編集モード時にフォームに値をセット
  // ────────────────
  useEffect(() => {
    if (isEditMode && editingReservation) {
      const custArr = editingReservation.customer;
      const cust = custArr && custArr.length > 0 ? custArr[0] : null;

      setLastName(cust?.last_name || '');
      setFirstName(cust?.first_name || '');
      setLastNameKana(cust?.last_name_kana || '');
      setFirstNameKana(cust?.first_name_kana || '');
      setPhone(cust?.phone || '');

      setDateValue(editingReservation.date);
      setSelectedStartTime(editingReservation.start_time.slice(0, 5));
      setSelectedEndTime(editingReservation.end_time.slice(0, 5));
      setStatusValue(editingReservation.status as any);

      const namesArr = editingReservation.service_names.split('、');
      const ids = namesArr
        .map(name => services.find(s => s.name === name)?.id)
        .filter((id): id is number => typeof id === 'number');
      setSelectedServiceIds(ids);

      setNotes(editingReservation.notes || '');
    }
  }, [isEditMode, editingReservation, services]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/** ページヘッダー **/}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">予約一覧</h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-md shadow transition-colors duration-200"
          onClick={() => {
            resetForm();
            setDateValue(format(new Date(), 'yyyy-MM-dd'));
            setIsEditMode(false);
            setEditingReservation(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          新規予約
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {/** ビュー切替 ＋ 検索 ＋ ステータス **/}
          <div className="flex flex-col md:flex-row justify-between mb-4 space-y-3 md:space-y-0 md:space-x-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType('calendar')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  viewType === 'calendar'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                カレンダー
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  viewType === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                リスト
              </button>
            </div>

            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              {/** 検索 **/}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="予約を検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors duration-200"
                />
              </div>

              {/** ステータスフィルタ **/}
              <div className="relative inline-block text-left">
                <label htmlFor="status-select" className="sr-only">
                  ステータス
                </label>
                <select
                  id="status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
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
                  <option value="all">ステータス: 全て</option>
                  <option value="confirmed">確定</option>
                  <option value="pending">保留</option>
                  <option value="cancelled">キャンセル</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/** ローディング中 or カレンダー／リスト 本体 **/}
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full"></div>
            </div>
          ) : viewType === 'calendar' ? (
            // ── カレンダー 表示 ──
            <div className="h-[calc(100vh-200px)]">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next myTodayButton',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                customButtons={{
                  myTodayButton: {
                    text: '今日',
                    click: () => {
                      const calendarApi = calendarRef.current?.getApi();
                      calendarApi?.today();
                    },
                  },
                }}
                locale={jaLocale}
                events={filteredEvents}
                eventClick={handleEventClick}
                selectable={true}
                select={handleDateSelect}
                height="100%"
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:15:00"
                allDaySlot={false}
                nowIndicator={true}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false,
                  hour12: false,
                }}
                dayHeaderFormat={{
                  weekday: 'short',
                  month: 'numeric',
                  day: 'numeric',
                }}
              />
            </div>
          ) : (
            /* リスト表示 */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      サービス (所要時間)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map(evt => {
                      const startDt = new Date(evt.start as string);
                      const endDt = new Date(evt.end as string);
                      const customer = (evt.extendedProps as any).customer;
                      const duration = (evt.extendedProps as any).duration;
                      const service = (evt.extendedProps as any).service;
                      const status = (evt.extendedProps as any).status;

                      return (
                        <tr
                          key={evt.id?.toString()}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {startDt.toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' ～ '}
                            {endDt.toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service} ({duration}h)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={status}
                              onChange={(e) => updateReservationStatus(evt.id as string, e.target.value as any)}
                              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">保留</option>
                              <option value="confirmed">確定</option>
                              <option value="cancelled">キャンセル</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex justify-start space-x-4">
                              {/* 編集ボタン（鉛筆アイコン） */}
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() =>
                                  handleEventClick({
                                    event: { id: evt.id },
                                    el: null as any,
                                    jsEvent: null as any,
                                    view: null as any,
                                  } as EventClickArg)
                                }
                              >
                                <EditIcon className="h-5 w-5" />
                              </button>

                              {/* 削除ボタン（ゴミ箱アイコン） */}
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteReservation(evt.id as string)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        該当する予約が見つかりません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/** ── 新規／編集 予約＋顧客モーダル ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 md:mx-0 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? '予約編集' : '新規予約作成'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingReservation(null); }}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSubmitReservation} className="px-4 py-5 space-y-4">
              {/** 顧客情報入力 **/}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    姓 <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="山田"
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      lastName.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    名 <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="太郎"
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      firstName.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    姓カナ <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={lastNameKana}
                    onChange={(e) => setLastNameKana(e.target.value)}
                    required
                    placeholder="ヤマダ"
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      lastNameKana.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    名カナ <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={firstNameKana}
                    onChange={(e) => setFirstNameKana(e.target.value)}
                    required
                    placeholder="タロウ"
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      firstNameKana.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  電話番号 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="09012345678"
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    phone.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/** サービス選択 **/}
              <div>
                <label className="block text-gray-700 mb-1">
                  サービスを選択 <span className="text-red-500">必須</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {services.map((svc) => {
                    const isChecked = selectedServiceIds.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          isChecked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleService(svc.id)}
                          className="mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium">{svc.name}</p>
                          <p className="text-xs text-gray-500">
                            {svc.duration}分　¥{svc.price.toLocaleString()}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/** 日付選択 **/}
              <div>
                <label className="block text-gray-700 mb-1">
                  日付を選択 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/** 開始・終了時間 **/}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    開始時間 <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="time"
                    value={selectedStartTime}
                    onChange={(e) => setSelectedStartTime(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    終了時間 <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="time"
                    value={selectedEndTime}
                    onChange={(e) => setSelectedEndTime(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/** ステータス選択 **/}
              <div>
                <label className="block text-gray-700 mb-1">
                  ステータス <span className="text-red-500">必須</span>
                </label>
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value as any)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">保留</option>
                  <option value="confirmed">確定</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              {/** メモ・備考 **/}
              <div>
                <label className="block text-gray-700 mb-1">
                  備考（任意）
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="何かあればご記入ください"
                  className="w-full h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/** 送信ボタン **/}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingReservation(null);
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors"
                >
                  {isEditMode ? '更新する' : '予約を作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
