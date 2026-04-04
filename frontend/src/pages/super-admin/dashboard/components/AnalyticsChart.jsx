import React from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { month: 'Jan', count: 400 }, { month: 'Feb', count: 600 },
  { month: 'Mar', count: 550 }, { month: 'Apr', count: 900 },
  { month: 'May', count: 1100 }, { month: 'Jun', count: 1500 },
];

const AnalyticsChart = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm h-full">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-slate-900 font-bold text-lg">Volunteer Growth</h3>
      <TrendingUp className="text-blue-500 w-5 h-5" />
    </div>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00629B" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#00629B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
          <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
          <Area type="monotone" dataKey="count" stroke="#00629B" strokeWidth={3} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AnalyticsChart;