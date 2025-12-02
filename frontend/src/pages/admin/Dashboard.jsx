import { useFetchData } from "../../hooks/hook";
import moment from "moment";
import { useEffect } from "react";
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
} from "lucide-react";

const Dashboard = () => {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/stats`,
    "dashboard-stats"
  );

  const { stats } = data || {};

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  useEffect(() => {
    console.log("📊 Dashboard stats:", stats);
  }, [stats]);

  const Widgets = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Widget
        title="Users"
        value={stats?.usersCount}
        icon={<Users className="h-6 w-6" />}
        color="blue"
      />
      <Widget
        title="Chats"
        value={stats?.totalChatsCount}
        icon={<MessageSquare className="h-6 w-6" />}
        color="green"
      />
      <Widget
        title="Messages"
        value={stats?.messagesCount}
        icon={<MessagesSquare className="h-6 w-6" />}
        color="purple"
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your chat application
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {moment().format("MMM DD, YYYY")}
          </Badge>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users, chats, messages..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
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

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {Widgets}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart - Messages Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Message Activity
                  </CardTitle>
                  <CardDescription>Last 7 days message trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {stats?.messagesChart && stats.messagesChart.length > 0 ? (
                      <LineChart value={stats.messagesChart} />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No message data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Doughnut Chart - Chat Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Chat Distribution
                  </CardTitle>
                  <CardDescription>
                    Single chats vs group chats breakdown
                  </CardDescription>
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
                        <div className="mt-4 flex items-center justify-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-muted-foreground">
                              Single:{" "}
                              {(stats?.totalChatsCount || 0) -
                                (stats?.groupsCount || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-muted-foreground">
                              Groups: {stats?.groupsCount || 0}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No chat data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Summary */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Statistics</CardTitle>
                  <CardDescription>Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem
                      label="Total Groups"
                      value={stats.groupsCount}
                      icon={<Users className="h-4 w-4" />}
                    />
                    <StatItem
                      label="Single Chats"
                      value={stats.totalChatsCount - stats.groupsCount}
                      icon={<MessageSquare className="h-4 w-4" />}
                    />
                    <StatItem
                      label="Active Users"
                      value={stats.usersCount}
                      icon={<Users className="h-4 w-4" />}
                    />
                    <StatItem
                      label="Avg Messages"
                      value={Math.round(
                        stats.messagesCount / (stats.usersCount || 1)
                      )}
                      icon={<MessagesSquare className="h-4 w-4" />}
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

const Widget = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {value || 0}
            </p>
          </div>
          <div
            className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatItem = ({ label, value, icon }) => (
  <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
    <div className="flex items-center justify-between mb-2">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value || 0}</div>
    </div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default Dashboard;
