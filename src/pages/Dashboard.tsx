// src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Scissors, Users, TrendingUp, Bell, BellOff } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addDays,
  parseISO,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { registerAdminToken } from '../lib/firebase';

// ダッシュボードで使うステートの型
type Stats = {
  totalReservations: number;
  totalCustomers: number;
  totalServices: number;
  upcomingReservations: Array<{
    id: number;
    date: string;
    start_time: string;
    service_names: string;
    customers: { first_name: string; last_name: string } | null;
  }>;
  revenueData: { name: string; revenue: number }[];
  weekComparison: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    totalCustomers: 0,
    totalServices: 0,
    upcomingReservations: [],
    revenueData: [],
    weekComparison: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isRegisteringNotification, setIsRegisteringNotification] = useState(false);

  // 通知設定の確認
  useEffect(() => {
    const checkNotificationStatus = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        setNotificationEnabled(permission === 'granted');
        console.log('通知許可状態:', permission);
      } else {
        console.log('このブラウザは通知をサポートしていません');
      }
    };
    
    checkNotificationStatus();
  }, []);

  // 通知設定ボタンのハンドラー
  const handleNotificationSetup = async () => {
    setIsRegisteringNotification(true);
    try {
      console.log('通知設定開始');
      await registerAdminToken();
      setNotificationEnabled(true);
      console.log('通知設定完了');
      alert('通知設定が完了しました。新しい予約があると通知が届きます。');
    } catch (error) {
      console.error('通知設定エラー:', error);
      alert('通知設定に失敗しました。ブラウザの設定で通知を許可してから再度お試しください。');
    } finally {
      setIsRegisteringNotification(false);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // 1) 予約件数
        const { count: resCount } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true });

        // 2) 顧客件数
        const { count: custCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        // 3) サービス件数
        const { count: svcCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true });

        // 4) 今後の予約を取得
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: upcomingData } = await supabase
          .from('reservations')
          .select(`
            id,
            date,
            start_time,
            service_names,
            customers (
              first_name,
              last_name
            )
          `)
          .gte('date', today)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5);

        // 5) 当週・前週の売上データを取得して集計
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

        const weekStartStr = format(weekStart, 'yyyy-MM-dd');
        const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
        const prevWeekStartStr = format(prevWeekStart, 'yyyy-MM-dd');
        const prevWeekEndStr = format(prevWeekEnd, 'yyyy-MM-dd');

        // 当週の売上取得
        const { data: weekReservations } = await supabase
          .from('reservations')
          .select('date, total_price')
          .gte('date', weekStartStr)
          .lte('date', weekEndStr);

        // 前週の売上取得
        const { data: prevWeekReservations } = await supabase
          .from('reservations')
          .select('date, total_price')
          .gte('date', prevWeekStartStr)
          .lte('date', prevWeekEndStr);

        // 7日分のリスト (当週月曜〜日曜)
        const daysOfWeek = Array.from({ length: 7 }).map((_, idx) =>
          addDays(weekStart, idx)
        );

        // 当週日別売上マップ
        const weekRevenueMap: Record<string, number> = {};
        daysOfWeek.forEach(day => {
          const key = format(day, 'yyyy-MM-dd');
          weekRevenueMap[key] = 0;
        });
        weekReservations?.forEach((rec: any) => {
          if (!rec.date || !rec.total_price) return;
          const key = rec.date;
          if (weekRevenueMap[key] !== undefined) {
            weekRevenueMap[key] += rec.total_price;
          }
        });

        // 前週日別売上マップ
        const prevWeekRevenueMap: Record<string, number> = {};
        Array.from({ length: 7 }).forEach((_, idx) => {
          const key = format(addDays(prevWeekStart, idx), 'yyyy-MM-dd');
          prevWeekRevenueMap[key] = 0;
        });
        prevWeekReservations?.forEach((rec: any) => {
          if (!rec.date || !rec.total_price) return;
          const key = rec.date;
          if (prevWeekRevenueMap[key] !== undefined) {
            prevWeekRevenueMap[key] += rec.total_price;
          }
        });

        // グラフ用データ (月〜日)
        const revenueData = daysOfWeek.map(day => ({
          name: format(day, 'EEE', { locale: ja }),
          revenue: weekRevenueMap[format(day, 'yyyy-MM-dd')] || 0,
        }));

        // 当週合計・前週合計
        const thisWeekTotal = Object.values(weekRevenueMap).reduce((sum, v) => sum + v, 0);
        const prevWeekTotal = Object.values(prevWeekRevenueMap).reduce((sum, v) => sum + v, 0);

        // 前週比 (%) 計算
        let weekComparison = 0;
        if (prevWeekTotal === 0) {
          weekComparison = thisWeekTotal === 0 ? 0 : 100;
        } else {
          weekComparison = Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100);
        }

        setStats({
          totalReservations: resCount || 0,
          totalCustomers: custCount || 0,
          totalServices: svcCount || 0,
          upcomingReservations: (upcomingData as any[]) || [],
          revenueData,
          weekComparison,
        });
      } catch (error) {
        console.error('ダッシュボードデータの取得中にエラー:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">ダッシュボード</h1>
        
        {/* 通知設定ボタン */}
        <div className="flex items-center space-x-2">
          {notificationEnabled ? (
            <div className="flex items-center text-green-600">
              <Bell className="h-5 w-5 mr-1" />
              <span className="text-sm">通知有効</span>
            </div>
          ) : (
            <button
              onClick={handleNotificationSetup}
              disabled={isRegisteringNotification}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-md transition-colors"
            >
              {isRegisteringNotification ? (
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <BellOff className="h-4 w-4 mr-2" />
              )}
              {isRegisteringNotification ? '設定中...' : '通知を有効にする'}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {/* カード部分：予約総数・顧客総数・サービス数 */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* 予約総数 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-100 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        予約総数
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">
                          {stats.totalReservations}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/appointments"
                    className="font-medium text-blue-700 hover:text-blue-600"
                  >
                    すべて表示
                  </Link>
                </div>
              </div>
            </div>

            {/* 顧客総数 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        顧客総数
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">
                          {stats.totalCustomers}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/customers"
                    className="font-medium text-blue-700 hover:text-blue-600"
                  >
                    すべて表示
                  </Link>
                </div>
              </div>
            </div>

            {/* 提供サービス数 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <Scissors className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        提供サービス数
                      </dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">
                          {stats.totalServices}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    to="/services"
                    className="font-medium text-blue-700 hover:text-blue-600"
                  >
                    すべて表示
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 週間売上グラフ と 今後の予約リスト */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 週間売上グラフ */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">週間売上</h2>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">
                    {stats.weekComparison >= 0
                      ? `前週比 +${stats.weekComparison}%`
                      : `前週比 ${stats.weekComparison}%`}
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.revenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}円`, '売上']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #f3f4f6',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 今後の予約リスト */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  今後の予約
                </h3>
              </div>
              <div className="bg-white divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {stats.upcomingReservations.length > 0 ? (
                  stats.upcomingReservations.map((reservation) => {
                    const dateTime = parseISO(`${reservation.date}T${reservation.start_time}`);
                    return (
                      <div
                        key={reservation.id}
                        className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
                      >
                        {/* 1行目：顧客名・メニュー */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {reservation.customers
                              ? `${reservation.customers.last_name} ${reservation.customers.first_name}`
                              : '顧客不明'}
                          </p>
                          <p className="text-sm text-blue-700 truncate">
                            {reservation.service_names}
                          </p>
                        </div>

                        {/* 2行目：日時 */}
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>{format(dateTime, 'yyyy年MM月dd日 HH:mm')}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p>今後の予約はありません</p>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                <div className="text-sm">
                  <Link
                    to="/appointments"
                    className="font-medium text-blue-700 hover:text-blue-600"
                  >
                    すべての予約を表示
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
