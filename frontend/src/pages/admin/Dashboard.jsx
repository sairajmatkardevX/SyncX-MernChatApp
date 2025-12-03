import { useFetchData } from "../../hooks/hook";
import moment from "moment";
import {  useState } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { DoughnutChart, LineChart } from "../../components/specific/Charts";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  Users,
  MessageSquare,
  MessagesSquare,
  Bell,
  Search,
  Shield,
  Calendar,
  PieChart,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

const Dashboard = () => {
  const { loading, data, error, refetch } = useFetchData(
    `${server}/api/v1/admin/stats`,
    "dashboard-stats"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { stats } = data || {};

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);



  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("🔍 Searching for:", searchQuery);
    
    }
  };

  const growthData = {
    users: 12.5,
    chats: 8.3,
    messages: 15.7,
  };

  const Widgets = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Widget
        title="Total Users"
        value={stats?.usersCount}
        icon={<Users className="h-6 w-6" />}
        color="blue"
        growth={growthData.users}
      />
      <Widget
        title="Active Chats"
        value={stats?.totalChatsCount}
        icon={<MessageSquare className="h-6 w-6" />}
        color="green"
        growth={growthData.chats}
      />
      <Widget
        title="Total Messages"
        value={stats?.messagesCount}
        icon={<MessagesSquare className="h-6 w-6" />}
        color="purple"
        growth={growthData.messages}
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Real-time overview of your chat application
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {moment().format("MMM DD, YYYY")}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users, chats, messages..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleSearch} className="flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-muted" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-xl bg-muted" />
              <Skeleton className="h-96 rounded-xl bg-muted" />
            </div>
            <Skeleton className="h-48 rounded-xl bg-muted" />
          </div>
        ) : (
          <>
            {/* Stats Widgets */}
            {Widgets}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart - Messages Over Time */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Message Activity
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Last 7 days message trends
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      7 Days
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {stats?.messagesChart && stats.messagesChart.length > 0 ? (
                      <LineChart value={stats.messagesChart} />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No message data available</p>
                        <p className="text-sm mt-1">Data will appear once users start chatting</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Doughnut Chart - Chat Types */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-primary" />
                        Chat Distribution
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Single chats vs group chats breakdown
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Total: {stats?.totalChatsCount || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex flex-col items-center justify-center">
                    {stats?.totalChatsCount > 0 ? (
                      <>
                        <div className="w-full h-64 flex items-center justify-center">
                          <DoughnutChart
                            labels={["Single Chats", "Group Chats"]}
                            value={[
                              (stats?.totalChatsCount || 0) -
                                (stats?.groupsCount || 0),
                              stats?.groupsCount || 0,
                            ]}
                          />
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-foreground">
                              Single: {" "}
                              <span className="text-muted-foreground">
                                {(stats?.totalChatsCount || 0) -
                                  (stats?.groupsCount || 0)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-medium text-foreground">
                              Groups: {" "}
                              <span className="text-muted-foreground">
                                {stats?.groupsCount || 0}
                              </span>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No chat data available</p>
                        <p className="text-sm mt-1">Create chats to see distribution</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Statistics Summary */}
            {stats && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quick Statistics</CardTitle>
                      <CardDescription className="mt-1">
                        Key metrics at a glance
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Activity className="h-3 w-3" />
                      Updated {moment().format("HH:mm")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem
                      label="Total Groups"
                      value={stats.groupsCount}
                      icon={<Users className="h-4 w-4" />}
                      color="blue"
                    />
                    <StatItem
                      label="Single Chats"
                      value={stats.totalChatsCount - stats.groupsCount}
                      icon={<MessageSquare className="h-4 w-4" />}
                      color="green"
                    />
                    <StatItem
                      label="Active Users"
                      value={stats.usersCount}
                      icon={<Users className="h-4 w-4" />}
                      color="purple"
                    />
                    <StatItem
                      label="Avg Messages/User"
                      value={Math.round(
                        stats.messagesCount / (stats.usersCount || 1)
                      )}
                      icon={<MessagesSquare className="h-4 w-4" />}
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

// Enhanced Widget Component
const Widget = ({ title, value, icon, color = "blue", growth = 0 }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  const isPositive = growth >= 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-3xl font-bold text-foreground">
                {value?.toLocaleString() || 0}
              </p>
              {growth !== 0 && (
                <div className={`flex items-center gap-1 ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(growth)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div
            className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
        {growth !== 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>
              {isPositive ? 'Increased' : 'Decreased'} from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced StatItem Component
const StatItem = ({ label, value, icon, color = "blue" }) => {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10",
    green: "text-green-500 bg-green-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-[1.02] group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">
        {value?.toLocaleString() || 0}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
};

export default Dashboard