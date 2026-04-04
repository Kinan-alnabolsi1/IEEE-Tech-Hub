import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Damascus', value: 400 },
  { name: 'Aleppo', value: 300 },
  { name: 'Lattakia', value: 200 },
  { name: 'Homs', value: 150 },
];

// ألوان متناسقة مع هوية IEEE البصرية
const COLORS = ['#00629B', '#00B5E2', '#00456E', '#80C342'];

const DistributionPie = () => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-slate-900 font-bold text-lg">Branch Distribution</h3>
        <p className="text-slate-400 text-xs">By Geographical Region</p>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* قائمة مفاتيح الألوان (Legend) ليكون الجدول سهل القراءة */}
      <div className="space-y-3 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }}></div>
              <span className="text-slate-500 font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-slate-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionPie;