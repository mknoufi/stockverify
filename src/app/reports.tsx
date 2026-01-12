import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  FileText,
  Download,
  Share2,
  Calendar,
  Filter,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Package,
  ClipboardList,
  FileSpreadsheet,
  FilePieChart,
  AlertCircle,
} from 'lucide-react-native';
import { format, subDays } from 'date-fns';

type ReportType = 'summary' | 'variance' | 'sessions' | 'detailed';

interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
}

export default function ReportsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);
  const getDashboardStats = useSessionStore((s) => s.getDashboardStats);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  const stats = getDashboardStats(user?.id ?? '');

  const userSessions = sessions.filter((s) => s.userId === user?.id);
  const userEntries = entries.filter((e) =>
    userSessions.some((s) => s.id === e.sessionId)
  );

  const reports: Report[] = [
    {
      id: 'summary',
      type: 'summary',
      title: 'Summary Report',
      description: 'Overall performance overview',
      icon: FilePieChart,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
    },
    {
      id: 'variance',
      type: 'variance',
      title: 'Variance Report',
      description: 'Short, over & matched items',
      icon: TrendingUp,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.15)',
    },
    {
      id: 'sessions',
      type: 'sessions',
      title: 'Sessions Report',
      description: 'All session details',
      icon: ClipboardList,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
    },
    {
      id: 'detailed',
      type: 'detailed',
      title: 'Detailed Report',
      description: 'Complete item-level data',
      icon: FileSpreadsheet,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
    },
  ];

  const generateReportContent = (type: ReportType): string => {
    const now = new Date();
    const header = `StockVerify Report\nGenerated: ${format(now, 'PPpp')}\nUser: ${user?.name ?? 'Unknown'}\n\n`;

    switch (type) {
      case 'summary':
        return `${header}=== SUMMARY REPORT ===\n\nTotal Scanned: ${stats.totalScanned}\nTotal Verified: ${stats.totalVerified}\nRacks Finished: ${stats.totalRacksFinished}\n\nVariance:\n- Matched: ${stats.matchedItems}\n- Short: ${stats.shortItems}\n- Over: ${stats.overItems}\n\nAccuracy Rate: ${stats.totalScanned > 0 ? Math.round((stats.matchedItems / stats.totalScanned) * 100) : 0}%`;

      case 'variance':
        const shortEntries = userEntries.filter((e) => e.variance < 0);
        const overEntries = userEntries.filter((e) => e.variance > 0);
        let varianceReport = `${header}=== VARIANCE REPORT ===\n\n`;
        varianceReport += `SHORT ITEMS (${shortEntries.length}):\n`;
        shortEntries.forEach((e) => {
          varianceReport += `- Barcode: ${e.itemBarcode}, Variance: ${e.variance}\n`;
        });
        varianceReport += `\nOVER ITEMS (${overEntries.length}):\n`;
        overEntries.forEach((e) => {
          varianceReport += `- Barcode: ${e.itemBarcode}, Variance: +${e.variance}\n`;
        });
        return varianceReport;

      case 'sessions':
        let sessionsReport = `${header}=== SESSIONS REPORT ===\n\n`;
        sessionsReport += `Total Sessions: ${userSessions.length}\n`;
        sessionsReport += `Active: ${userSessions.filter((s) => s.status === 'active').length}\n`;
        sessionsReport += `Completed: ${userSessions.filter((s) => s.status === 'completed').length}\n\n`;
        userSessions.forEach((s) => {
          sessionsReport += `---\n`;
          sessionsReport += `Location: ${s.locationType === 'showroom' ? 'Showroom' : 'Godown'} - ${s.floor ?? s.area}\n`;
          sessionsReport += `Rack: ${s.rackNo}\n`;
          sessionsReport += `Status: ${s.status}\n`;
          sessionsReport += `Scanned: ${s.totalScanned}\n`;
          sessionsReport += `Created: ${format(new Date(s.createdAt), 'PPp')}\n`;
        });
        return sessionsReport;

      case 'detailed':
        let detailedReport = `${header}=== DETAILED REPORT ===\n\n`;
        detailedReport += `Total Entries: ${userEntries.length}\n\n`;
        userEntries.forEach((e, index) => {
          const session = sessions.find((s) => s.id === e.sessionId);
          detailedReport += `Entry ${index + 1}:\n`;
          detailedReport += `  Barcode: ${e.itemBarcode}\n`;
          detailedReport += `  Counted: ${e.countedQty}\n`;
          detailedReport += `  Variance: ${e.variance}\n`;
          detailedReport += `  Condition: ${e.condition}\n`;
          detailedReport += `  Rack: ${session?.rackNo ?? 'N/A'}\n`;
          detailedReport += `  Date: ${format(new Date(e.createdAt), 'PPp')}\n\n`;
        });
        return detailedReport;

      default:
        return header + 'No data available.';
    }
  };

  const handleShareReport = async (type: ReportType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const content = generateReportContent(type);

    try {
      await Share.share({
        message: content,
        title: `StockVerify ${reports.find((r) => r.type === type)?.title}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleViewReport = async (type: ReportType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReport(selectedReport === type ? null : type);
  };

  // Recent variance items for quick view
  const recentVarianceItems = userEntries
    .filter((e) => e.variance !== 0)
    .slice(-5)
    .reverse();

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient
        colors={['#0A0F1C', '#111827', '#0A0F1C']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-5 pt-2 pb-4">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-xl">Reports</Text>
                <Text className="text-gray-500 text-sm">Generate & share reports</Text>
              </View>
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
                <FileText size={20} color="#10B981" />
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Quick Stats */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="px-5 mb-5"
            >
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Text className="text-gray-400 text-xs mb-1">Total Items</Text>
                  <Text className="text-white text-2xl font-bold">{stats.totalScanned}</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Text className="text-gray-400 text-xs mb-1">Sessions</Text>
                  <Text className="text-white text-2xl font-bold">{userSessions.length}</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Text className="text-gray-400 text-xs mb-1">Variance</Text>
                  <Text className="text-amber-400 text-2xl font-bold">
                    {stats.shortItems + stats.overItems}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Report Types */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Report Types</Text>
              {reports.map((report, index) => (
                <View key={report.id} className="mb-3">
                  <Pressable
                    onPress={() => handleViewReport(report.type)}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 active:opacity-80"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: report.bgColor }}
                      >
                        <report.icon size={24} color={report.color} />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-semibold">{report.title}</Text>
                        <Text className="text-gray-500 text-sm">{report.description}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleShareReport(report.type)}
                        className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center"
                      >
                        <Share2 size={18} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </Pressable>

                  {/* Expanded Report Preview */}
                  {selectedReport === report.type && (
                    <Animated.View
                      entering={FadeInDown.duration(300)}
                      className="bg-gray-900/50 rounded-xl p-4 mt-2 border border-white/5"
                    >
                      <Text className="text-gray-300 text-xs font-mono leading-5">
                        {generateReportContent(report.type).slice(0, 500)}...
                      </Text>
                      <Pressable
                        onPress={() => handleShareReport(report.type)}
                        className="bg-blue-500 rounded-xl py-3 mt-4 flex-row items-center justify-center"
                      >
                        <Share2 size={18} color="#fff" />
                        <Text className="text-white font-semibold ml-2">Share Full Report</Text>
                      </Pressable>
                    </Animated.View>
                  )}
                </View>
              ))}
            </Animated.View>

            {/* Recent Variance Items */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="px-5 pb-8"
            >
              <Text className="text-white font-semibold text-lg mb-3">Recent Variances</Text>
              <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                {recentVarianceItems.length > 0 ? (
                  recentVarianceItems.map((entry, index) => (
                    <View
                      key={entry.id}
                      className={cn(
                        'p-4 flex-row items-center',
                        index < recentVarianceItems.length - 1 && 'border-b border-white/5'
                      )}
                    >
                      <View
                        className={cn(
                          'w-10 h-10 rounded-xl items-center justify-center',
                          entry.variance < 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
                        )}
                      >
                        {entry.variance < 0 ? (
                          <TrendingDown size={20} color="#EF4444" />
                        ) : (
                          <TrendingUp size={20} color="#F59E0B" />
                        )}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-medium">
                          Item #{entry.itemBarcode.slice(-6)}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                        </Text>
                      </View>
                      <View
                        className={cn(
                          'px-3 py-1 rounded-full',
                          entry.variance < 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
                        )}
                      >
                        <Text
                          className={cn(
                            'font-bold text-sm',
                            entry.variance < 0 ? 'text-red-400' : 'text-amber-400'
                          )}
                        >
                          {entry.variance > 0 ? '+' : ''}{entry.variance}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="p-8 items-center">
                    <CheckCircle2 size={32} color="#22C55E" />
                    <Text className="text-green-400 font-medium mt-2">No Variances</Text>
                    <Text className="text-gray-500 text-sm mt-1">All items matched</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
