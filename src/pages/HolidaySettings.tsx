// src/pages/HolidaySettings.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Holiday {
  id: number;
  date: string; // 例: "2025-06-15"
  created_at: string;
}

interface Reservation {
  id: number;
  date: string; // "2025-06-05"
  start_time: string; // "10:00:00"
  end_time: string; // "11:30:00"
}

interface TimeSlot {
  id: number;
  date: string; // 例: "2025-06-05"
  start_time: string; // 例: "09:00:00"
  is_available: boolean;
}

interface DayCell {
  date: Date;
  isPast: boolean;
  isHoliday: boolean;
}

const HolidaySettings: React.FC = () => {
  const navigate = useNavigate();

  // ────────────────────────────────────────────────────
  // カレンダー表示用の月
  const [displayedMonth, setDisplayedMonth] = useState<Date>(startOfMonth(new Date()));
  // カレンダーに表示する日セル
  const [days, setDays] = useState<DayCell[]>([]);
  // 当月に登録されている休日データ
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  // ローディング／エラー
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // 今日の00:00（過去日判定用）
  const [todayStart] = useState<Date>(startOfDay(new Date()));

  // 詳細編集用：クリックした日付
  const [selectedDateDetail, setSelectedDateDetail] = useState<Date | null>(null);
  // その日の time_slots を保持
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);

  // ────────────────────────────────────────────────────
  // 1) 当月の holidays テーブルからデータ取得
  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const firstOfMonth = startOfMonth(displayedMonth);
      const lastOfMonth = endOfMonth(displayedMonth);
      const fromStr = format(firstOfMonth, 'yyyy-MM-dd');
      const toStr = format(lastOfMonth, 'yyyy-MM-dd');

      const { data, error: fetchError } = await supabase
        .from('holidays')
        .select<'*', Holiday>('*')
        .gte('date', fromStr)
        .lte('date', toStr);

      if (fetchError) throw fetchError;
      setHolidays(data ?? []);
    } catch (e) {
      console.error('[HolidaySettings] 休日取得エラー:', e);
      setError('休日の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [displayedMonth]);

  // ────────────────────────────────────────────────────
  // 2) カレンダーに表示する日セルを構築
  const buildDayCells = useCallback(() => {
    const firstOfMonth = startOfMonth(displayedMonth);
    const lastOfMonth = endOfMonth(displayedMonth);
    const daysInMonth = eachDayOfInterval({ start: firstOfMonth, end: lastOfMonth });

    const newDays: DayCell[] = daysInMonth.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const isHoliday = holidays.some((h) => h.date === dateStr);
      const isPast = isBefore(d, todayStart);
      return { date: d, isHoliday, isPast };
    });

    setDays(newDays);
  }, [displayedMonth, holidays, todayStart]);

  // ────────────────────────────────────────────────────
  // 初回マウントおよび displayedMonth が変わるたびに holidays を取得
  useEffect(() => {
    fetchHolidays();
    // 日付詳細をクリア
    setSelectedDateDetail(null);
    setTimeSlots([]);
  }, [fetchHolidays]);

  // ────────────────────────────────────────────────────
  // holidays または displayedMonth が更新されたらカレンダーを再構築
  useEffect(() => {
    buildDayCells();
  }, [buildDayCells]);

  // ────────────────────────────────────────────────────
  // 3) カレンダーの前月／次月ボタン
  const goToPrevMonth = () => {
    setDisplayedMonth(subMonths(displayedMonth, 1));
  };
  const goToNextMonth = () => {
    setDisplayedMonth(addMonths(displayedMonth, 1));
  };

  // ────────────────────────────────────────────────────
  // 4) カレンダーの日付セルをクリック → 時間枠を取得
  const onClickDay = (cell: DayCell) => {
    if (cell.isPast) return;
    setSelectedDateDetail(cell.date);
    fetchTimeSlots(cell.date);
  };

  // ────────────────────────────────────────────────────
  // 5) 選択日付の time_slots を取得
  const fetchTimeSlots = async (dateObj: Date) => {
    setSlotsLoading(true);
    setError(null);
    try {
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      const { data, error: slotError } = await supabase
        .from('time_slots')
        .select<'*', TimeSlot>('*')
        .eq('date', dateStr)
        .order('start_time', { ascending: true });

      if (slotError) throw slotError;
      setTimeSlots(data ?? []);
    } catch (e) {
      console.error('[HolidaySettings] スロット取得エラー:', e);
      setError('時間枠の取得に失敗しました。');
    } finally {
      setSlotsLoading(false);
    }
  };

  // ────────────────────────────────────────────────────
  // 6) 全休にする：holidays に登録 & time_slots をすべて is_available = false に更新
  const markFullDayOff = async () => {
    if (!selectedDateDetail) return;
    setError(null);
    try {
      const dateStr = format(selectedDateDetail, 'yyyy-MM-dd');

      // すでに holidays に登録済みかチェック
      const already = holidays.some((h) => h.date === dateStr);
      if (!already) {
        const { error: insHolidayError } = await supabase
          .from('holidays')
          .insert([{ date: dateStr }]);
        if (insHolidayError) throw insHolidayError;
      }

      // その日の time_slots をすべて is_available = false に更新（全休状態にする）
      const { error: updSlotsError } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('date', dateStr);
      if (updSlotsError) throw updSlotsError;

      // UI 更新：holidays 再取得 + time_slots 再読み込み
      await fetchHolidays();
      await fetchTimeSlots(selectedDateDetail);
    } catch (e) {
      console.error('[HolidaySettings] 全休設定エラー:', e);
      setError('全休設定に失敗しました。');
    }
  };

  // ────────────────────────────────────────────────────
  // 7) 個別スロットの is_available トグル（ただし当日が全休なら無効化）
  const toggleSlotAvailability = async (slot: TimeSlot) => {
    if (!selectedDateDetail) return;
    const dateStr = format(selectedDateDetail, 'yyyy-MM-dd');
    // 当日が holidays 登録済みなら無効
    const isHolidayToday = holidays.some((h) => h.date === dateStr);
    if (isHolidayToday) return;

    setError(null);
    try {
      const { error: updError } = await supabase
        .from('time_slots')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id);

      if (updError) throw updError;
      if (selectedDateDetail) {
        await fetchTimeSlots(selectedDateDetail);
      }
    } catch (e) {
      console.error('[HolidaySettings] スロット更新エラー:', e);
      setError('時間枠の更新に失敗しました。');
    }
  };

  // ────────────────────────────────────────────────────
  // 8) リセット（全休解除）：holidays から当日を削除 & time_slots を Reservation の情報をもとに復元
  const clearFullDayOff = async () => {
    if (!selectedDateDetail) return;
    setError(null);
    try {
      const dateStr = format(selectedDateDetail, 'yyyy-MM-dd');

      // 1. holidays から当日を削除
      const { error: delHolidayError } = await supabase
        .from('holidays')
        .delete()
        .eq('date', dateStr);
      if (delHolidayError) throw delHolidayError;

      // 2. Reservation テーブルから当日の予約一覧を取得
      const { data: reservationData, error: resError } = await supabase
        .from('reservations')
        .select<'start_time, end_time', Reservation>('start_time, end_time')
        .eq('date', dateStr);
      if (resError) throw resError;

      // 3. 当日の全 time_slots を取得
      const { data: slotsData, error: slotsError } = await supabase
        .from('time_slots')
        .select<'*', TimeSlot>('*')
        .eq('date', dateStr);
      if (slotsError) throw slotsError;

      // 4. Reservation 情報をもとに is_available を復元
      if (slotsData) {
        // まず全スロットを available = true に戻す
        await supabase
          .from('time_slots')
          .update({ is_available: true })
          .eq('date', dateStr);

        // 次に、予約が入っているスロットだけ is_available = false にする
        for (const slot of slotsData) {
          let reserved = false;
          if (reservationData) {
            for (const res of reservationData) {
              // res.start_time <= slot.start_time < res.end_time で予約中とみなす
              if (
                slot.start_time >= res.start_time &&
                slot.start_time < res.end_time
              ) {
                reserved = true;
                break;
              }
            }
          }
          if (reserved) {
            await supabase
              .from('time_slots')
              .update({ is_available: false })
              .eq('id', slot.id);
          }
        }
      }

      // 5. UI 更新：holidays 再取得 + time_slots 再読み込み
      await fetchHolidays();
      await fetchTimeSlots(selectedDateDetail);
    } catch (e) {
      console.error('[HolidaySettings] リセット処理エラー:', e);
      setError('リセットに失敗しました。');
    }
  };

  return (
    <div className="py-8 px-2 max-w-4xl mx-auto">
      {/* タイトル＆月切替 */}
      <div className="mb-6">
        {/* 1 行目：タイトル（左寄せ） */}
        <h1 className="text-3xl font-semibold text-gray-900">休日設定</h1>

        {/* 2 行目：ボタンを右寄せで配置 */}
        <div className="mt-2 flex justify-end space-x-2">
          <button
            onClick={goToPrevMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs sm:text-sm"
          >
            &lt; 前月
          </button>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs sm:text-sm"
          >
            次月 &gt;
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* ローディングスピナー */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-purple-700 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* カレンダー */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* 曜日ヘッダー */}
            {['日', '月', '火', '水', '木', '金', '土'].map((wd) => (
              <div key={wd} className="text-sm font-medium py-1 bg-gray-50">
                {wd}
              </div>
            ))}

            {/* 月初めの空セル */}
            {Array.from({ length: dayOfWeek(displayedMonth) }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {/* 各日のセル */}
            {days.map((cell) => {
              const dateNum = format(cell.date, 'd');
              const isHoliday = cell.isHoliday;
              const isPastDay = cell.isPast;
              return (
                <button
                  key={format(cell.date, 'yyyy-MM-dd')}
                  onClick={() => onClickDay(cell)}
                  className={`
                    relative flex flex-col items-center justify-center h-14 border rounded-md transition-colors duration-200
                    ${isPastDay
                      ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                      : isHoliday
                      ? 'bg-red-200 hover:bg-red-300 text-red-800'
                      : 'hover:bg-green-100 text-gray-800'
                    }
                  `}
                  disabled={isPastDay}
                >
                  <span>{dateNum}</span>
                  {isHoliday && (
                    <span className="absolute top-1 right-1 text-xs text-red-600">
                      祝
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 選択日詳細セクション */}
      {selectedDateDetail && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          {/* ヘッダー：日付タイトル＋ボタン群 */}
          <div className="flex flex-row justify-between items-center mb-4">
            {/* 日付見出し */}
            <h3 className="text-xs sm:text-xl font-medium text-gray-800">
              {format(selectedDateDetail, 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
            </h3>

            {/* ボタン群だけ、sm 未満なら縦積み、sm 以上なら横並び */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-0.5 sm:space-y-0">
              <button
                onClick={markFullDayOff}
                className="
                  w-32 sm:w-40
                  px-3 py-0.5
                  bg-red-500 text-white rounded
                  hover:bg-red-600
                  text-xs sm:text-sm
                  flex justify-center items-center
                "
              >
                全休にする
              </button>
              <button
                onClick={clearFullDayOff}
                className="
                  w-32 sm:w-40
                  px-5 py-0.5
                  bg-green-500 text-white rounded
                  hover:bg-green-600
                  text-xs sm:text-sm
                  flex justify-center items-center
                "
              >
                リセット
              </button>
            </div>
          </div>

          {slotsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-700 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.length === 0 ? (
                <p className="col-span-4 text-gray-600">予約枠がありません。</p>
              ) : (
                timeSlots.map((slot) => {
                  const dateStr = format(selectedDateDetail, 'yyyy-MM-dd');
                  const isHolidayToday = holidays.some((h) => h.date === dateStr);

                  const label = format(
                    new Date(`${slot.date}T${slot.start_time}`),
                    'HH:mm'
                  );
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlotAvailability(slot)}
                      disabled={isHolidayToday}
                      className={`
                        px-2 py-1 border rounded
                        text-xs sm:text-sm
                        transition-colors duration-150
                        ${isHolidayToday
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : slot.is_available
                          ? 'bg-green-100 hover:bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-500'
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 月初めの曜日を返す（0=日曜, 1=月曜, …）
function dayOfWeek(date: Date): number {
  return startOfMonth(date).getDay();
}

export default HolidaySettings;
