// ── src/pages/Dashboard.tsx ──

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Scissors, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
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

// ───────────────────────────────────────────────────────
// ダッシュボードで使うステートの型
// ───────────────────────────────────────────────────────
type Stats = {
  totalReservations: number;        // 予約総数
  totalCustomers: number;           // 顧客総数
  totalServices: number;            // 提供サービス数
  upcomingReservations: any[];      // 今後の予約一覧（5件以内）
  revenueData: { name: string; revenue: number }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    totalCustomers: 0,
    totalServices: 0,
    upcomingReservations: [],
    revenueData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // ----------------------------
        // 1) 予約件数（reservations テーブルの総行数をカウント）
        // ----------------------------
        const { count: resCount } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true });

        // ----------------------------
        // 2) 顧客件数（customers テーブルの総行数をカウント）
        // ----------------------------
        const { count: custCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        // ----------------------------
        // 3) サービス件数（services テーブルの総行数をカウント）
        // ----------------------------
        const { count: svcCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true });

        // ----------------------------
        // 4) 今後の予約（reservations テーブルから、今日以降の日付順に先頭 5 件）
        //    JOIN: customers, staff（必要に応じて）
        // ----------------------------
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const { data: upcomingData } = await supabase
          .from('reservations')
          .select(
            `
            id,
            date,
            start_time,
            service_names,
            total_price,
            customers (
              id,
              first_name,
              last_name
            ),
            staff (
              id,
              first_name,
              last_name
            )
          `
          )
          .gte('date', todayStr)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5);

        // ----------------------------
        // 5) ダミーの週間売上データ（必要に応じて実際の売上集計クエリに置き換えてください）
        // ----------------------------
        const dummyRevenueData = [
          { name: '月', revenue: 1200 },
          { name: '火', revenue: 900 },
          { name: '水', revenue: 1500 },
          { name: '木', revenue: 1800 },
          { name: '金', revenue: 2400 },
          { name: '土', revenue: 2800 },
          { name: '日', revenue: 1000 },
        ];

        setStats({
          totalReservations: resCount || 0,
          totalCustomers: custCount || 0,
          totalServices: svcCount || 0,
          upcomingReservations: upcomingData || [],
          revenueData: dummyRevenueData,
        });
      } catch (error) {
        console.error('ダッシュボードデータの取得中にエラーが発生しました:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700"></div>
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────
              予約総数・顧客総数・サービス数 のカード表示
             ───────────────────────────────────────────── */}
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
                    className="font-medium text-pink-600 hover:text-pink-500"
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
                    className="font-medium text-pink-600 hover:text-pink-500"
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
                    className="font-medium text-pink-600 hover:text-pink-500"
                  >
                    すべて表示
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              週間売上グラフ と 今後の予約リスト
             ───────────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 週間売上グラフ */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">週間売上</h2>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">前週比 +12%</span>
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
                    <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
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
                  stats.upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
                    >
                      {/* 1行目：サービス名 と 金額 */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-pink-600 truncate">
                          {reservation.service_names}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {reservation.total_price}円
                          </p>
                        </div>
                      </div>

                      {/* 2行目：顧客名・担当スタッフ */}
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {reservation.customers?.first_name}{' '}
                            {reservation.customers?.last_name}
                          </p>
                          {reservation.staff && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <Scissors className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {reservation.staff.first_name}{' '}
                              {reservation.staff.last_name}
                            </p>
                          )}
                        </div>

                        {/* 右側：日時 */}
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>
                            {format(
                              new Date(
                                `${reservation.date}T${reservation.start_time}`
                              ),
                              'yyyy年MM月dd日 HH:mm'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
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
                    className="font-medium text-pink-600 hover:text-pink-500"
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
