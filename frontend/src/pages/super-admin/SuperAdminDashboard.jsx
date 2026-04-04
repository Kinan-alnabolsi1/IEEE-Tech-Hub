import React from 'react';
import StatCards from './dashboard/components/StatCards';
import AnalyticsChart from './dashboard/components/AnalyticsChart';
import DistributionPie from './dashboard/components/DistributionPie';

const SuperAdminDashboard = () => {
  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
        <p className="text-slate-500 text-sm italic">Real-time overview of the IEEE Portal activity.</p>
      </header>

      {/* المكونات التي قسمناها */}
      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>
        <div className="lg:col-span-1">
          <DistributionPie />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;