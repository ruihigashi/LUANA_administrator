// src/pages/Appointments.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// 型は @fullcalendar/core から
import { EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Search,
} from 'lucide-react';
import jaLocale from '@fullcalendar/core/locales/ja';

type RawReservation = {
  id: number;
  date: string;        // "2025-06-03" のような YYYY-MM-DD
  start_time: string;  // "10:00:00"
  end_time: string;    // "14:00:00"
  status: 'confirmed' | 'pending' | 'cancelled' | string;
  service_names: string;    // 例: "カット、カラー"
  total_price: number;
  notes: string | null;
  customers: {
    id: number;
    first_name: string;
    last_name: string;
  }[];
};

export default function Appointments() {
  // FullCalendar に渡すイベント配列
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // カレンダー／リスト切り替え
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  // 検索文字列
  const [searchQuery, setSearchQuery] = useState<string>('');
  // ステータスフィルタ
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  // ────────────────
  // 1) Supabase から reservations + customers を JOIN して取得する
  // ────────────────
  async function fetchReservations() {
    setLoading(true);
    try {
      // reservations テーブルと customers を INNER JOIN
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          date,
          start_time,
          end_time,
          status,
          service_names,
          customers (
            id,
            first_name,
            last_name
          )
        `)
        .order('date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;

      if (data) {
        // Supabase から返ってきたデータを RawReservation として扱う
        const raw = data as RawReservation[];

        // FullCalendar 用に EventInput[] に変換
        const formatted: EventInput[] = raw.map((resv) => {
          // 顧客情報は配列 customers[0] に入っている想定
          const cust = resv.customers?.[0];
          const customerName = cust
            ? `${cust.first_name} ${cust.last_name}`
            : '顧客不明';

          // 開始・終了を ISO 文字列 (YYYY-MM-DDTHH:mm:ss) に整形
          const startISO = `${resv.date}T${resv.start_time}`;
          const endISO = `${resv.date}T${resv.end_time}`;

          // ────────────
          // “合計何時間か” を算出（例： (14:00 - 10:00) = 4.0h ）
          // ────────────
          const startDateObj = new Date(startISO);
          const endDateObj = new Date(endISO);
          const diffMs = endDateObj.getTime() - startDateObj.getTime();
          // 1時間あたり 1000 * 60 * 60 ミリ秒なので、それで割る
          const durationHours = diffMs / (1000 * 60 * 60);

          // イベントタイトルには「サービス名 (◯h) – 顧客名」を表示
          const title = `${resv.service_names} (${durationHours}h) – ${customerName}`;

          // ステータスに応じて色を変える（グリーン／イエロー／レッド／グレーなど）
          let bgColor = '#6b7280'; // デフォルト：グレー
          switch (resv.status) {
            case 'confirmed':
              bgColor = '#10b981'; // 緑
              break;
            case 'pending':
              bgColor = '#f59e0b'; // 黄
              break;
            case 'cancelled':
              bgColor = '#ef4444'; // 赤
              break;
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
              duration: durationHours, // 必要に応じて使い回せるように付加
            },
          };
        });

        setEvents(formatted);
      }
    } catch (err) {
      console.error('予約データ取得中にエラーが発生しました:', err);
    } finally {
      setLoading(false);
    }
  }

  // ────────────────
  // 2) 検索 または ステータスフィルタを通す
  // ────────────────
  const filteredEvents = events.filter((evt) => {
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
  // 3) カレンダー上のイベントクリック
  // ────────────────
  const handleEventClick = (info: EventClickArg) => {
    const id = info.event.id;
    console.log('編集／詳細表示: reservation ID =', id);
    // 例: モーダルを開く、または別ページに遷移する処理をここに実装
  };

  // ────────────────
  // 4) カレンダー上の日付セルをドラッグ or クリックして予約作成
  // ────────────────
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    console.log('新規予約作成用: selected date =', selectInfo.startStr);
    // 例: ここで「新規予約フォーム（CustomerDetails）」を開く処理を実装
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/** ページヘッダー **/}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">予約一覧</h1>
        <button className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-md shadow transition-colors duration-200">
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
                    ? 'bg-pink-100 text-pink-700'
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
                    ? 'bg-pink-100 text-pink-700'
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-sm transition-colors duration-200"
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
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
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
              <div className="animate-spin h-12 w-12 border-4 border-pink-700 border-t-transparent rounded-full"></div>
            </div>
          ) : viewType === 'calendar' ? (
            <div className="h-[calc(100vh-250px)]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                locale={jaLocale}
                events={filteredEvents}
                eventClick={handleEventClick}
                selectable={true}
                select={handleDateSelect}
                height="100%"
                slotMinTime="09:00:00"
                slotMaxTime="19:00:00"
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
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((evt) => {
                      // start/end は string 型（"2025-06-03T10:00:00"）なので Date に変換してフォーマット
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
                            {service}　({duration}h)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`
                                px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${
                                  status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              `}
                            >
                              {status === 'confirmed'
                                ? '確定'
                                : status === 'pending'
                                ? '保留'
                                : 'キャンセル'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-pink-600 hover:text-pink-900"
                              onClick={() =>
                                handleEventClick({
                                  event: { id: evt.id },
                                  el: null as any,
                                  jsEvent: null as any,
                                  view: null as any,
                                } as EventClickArg)
                              }
                            >
                              編集
                            </button>
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
    </div>
  );
}
