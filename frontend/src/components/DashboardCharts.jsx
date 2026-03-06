import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- VISITOR INSIGHTS (WAVES) ---
const visitorsData = [
    { name: 'Jan', loyal: 300, new: 100, unique: 200 },
    { name: 'Feb', loyal: 250, new: 150, unique: 230 },
    { name: 'Mar', loyal: 180, new: 220, unique: 250 },
    { name: 'Apr', loyal: 220, new: 180, unique: 210 },
    { name: 'May', loyal: 280, new: 250, unique: 240 },
    { name: 'Jun', loyal: 350, new: 200, unique: 280 },
    { name: 'Jul', loyal: 320, new: 240, unique: 310 },
    { name: 'Aug', loyal: 290, new: 210, unique: 270 },
    { name: 'Sep', loyal: 260, new: 190, unique: 230 },
    { name: 'Oct', loyal: 210, new: 170, unique: 200 },
    { name: 'Nov', loyal: 190, new: 150, unique: 180 },
    { name: 'Dec', loyal: 160, new: 130, unique: 160 },
];

export const VisitorInsightsChart = ({ data }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-[#064e3b] mb-4">Visitor Insights</h3>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data && data.length > 0 ? data : []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="rect" align="left" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Line type="monotone" dataKey="loyal" stroke="#A700FF" strokeWidth={3} dot={false} name="Loyal Customers" />
                    <Line type="monotone" dataKey="new" stroke="#EF4444" strokeWidth={3} dot={false} name="New Customers" />
                    <Line type="monotone" dataKey="unique" stroke="#10B981" strokeWidth={3} dot={false} name="Unique Customers" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// --- TOTAL REVENUE (BARS) ---
const revenueData = [
    { day: 'Mon', online: 14, offline: 12 },
    { day: 'Tue', online: 16, offline: 13 },
    { day: 'Wed', online: 10, offline: 22 },
    { day: 'Thu', online: 18, offline: 8 },
    { day: 'Fri', online: 15, offline: 14 },
    { day: 'Sat', online: 19, offline: 16 },
    { day: 'Sun', online: 23, offline: 12 },
];

export const TotalRevenueChart = ({ data }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-[#064e3b] mb-4">Total Revenue</h3>
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data && data.length > 0 ? data : []} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="online" fill="#059669" radius={[4, 4, 0, 0]} name="Online Sales" />
                    <Bar dataKey="offline" fill="#10B981" radius={[4, 4, 0, 0]} name="Offline Sales" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// --- CUSTOMER SATISFACTION (AREA) ---
const satisfactionData = [
    { name: 'Point 1', value: 3000, last: 4000 },
    { name: 'Point 2', value: 3500, last: 3500 },
    { name: 'Point 3', value: 4000, last: 3200 },
    { name: 'Point 4', value: 3800, last: 3800 },
    { name: 'Point 5', value: 4200, last: 4100 },
    { name: 'Point 6', value: 4500, last: 4300 },
    { name: 'Point 7', value: 4800, last: 4600 },
];

export const CustomerSatisfactionChart = () => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <h3 className="text-lg font-bold text-[#064e3b] mb-4">Customer Satisfaction</h3>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg">
            Insufficient feedback data to display
        </div>
    </div>
);


// --- TARGET VS REALITY (BARS) ---
const targetData = [
    { name: 'Jan', reality: 60, target: 80 },
    { name: 'Feb', reality: 50, target: 70 },
    { name: 'Mar', reality: 70, target: 90 },
    { name: 'Apr', reality: 40, target: 60 },
    { name: 'May', reality: 80, target: 90 },
    { name: 'Jun', reality: 70, target: 85 },
    { name: 'July', reality: 75, target: 88 },
];

export const TargetRealityChart = ({ data }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-[#064e3b] mb-4">Target vs Reality</h3>
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data && data.length > 0 ? data : []} barGap={4} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} interval={0} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="reality" fill="#00E096" radius={[4, 4, 0, 0]} name="Reality Sales" />
                    <Bar dataKey="target" fill="#FFCF00" radius={[4, 4, 0, 0]} name="Target Sales" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
            {/* Stat Summary */}
            <div className="flex items-center gap-3">
                <div className="bg-[#E6FAF5] p-2 rounded-md"><div className="w-3 h-3 bg-[#00E096] rounded-sm"></div></div>
                <div>
                    <p className="text-xs text-gray-500 font-bold">Reality Sales</p>
                    <p className="text-sm font-bold opacity-70">Global</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-[#FFFCE6] p-2 rounded-md"><div className="w-3 h-3 bg-[#FFCF00] rounded-sm"></div></div>
                <div>
                    <p className="text-xs text-gray-500 font-bold">Target Sales</p>
                    <p className="text-sm font-bold opacity-70">Commercial</p>
                </div>
            </div>
        </div>
    </div>
);

// --- STAT CARD ---
export const StatCard = ({ icon, value, label, subtext, color }) => {
    // Color Maps
    const colorStyles = {
        red: { bg: 'bg-[#FFE2E5]', iconBg: 'bg-[#FA5A7D]', text: 'text-[#151D48]' },
        yellow: { bg: 'bg-[#FFF4DE]', iconBg: 'bg-[#FF947A]', text: 'text-[#151D48]' },
        green: { bg: 'bg-[#DCFCE7]', iconBg: 'bg-[#3CD856]', text: 'text-[#151D48]' },
        purple: { bg: 'bg-[#F3E8FF]', iconBg: 'bg-[#BF83FF]', text: 'text-[#151D48]' }
    };

    const style = colorStyles[color] || colorStyles.red;

    return (
        <div className={`${style.bg} p-6 rounded-2xl`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center text-white`}>
                    {icon}
                </div>
            </div>
            <div>
                <h4 className={`text-2xl font-bold ${style.text} mb-1`}>{value}</h4>
                <p className="text-[#425166] font-medium text-sm mb-2">{label}</p>
                <p className="text-[#059669] text-xs font-semibold">{subtext || "+8% from yesterday"}</p>
            </div>
        </div>
    );
};

// --- TOP DOCTORS ---
export const TopDoctors = ({ data }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full">
        <h3 className="text-lg font-bold text-[#064e3b] mb-6">Top Performers</h3>
        <div className="space-y-6">
            {data && data.length > 0 ? data.map((doc, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-[#064e3b]">0{i + 1} {doc.name}</span>
                        <span className="text-gray-500 text-xs">{doc.speciality}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#059669]" style={{ width: `${Math.min(doc.count * 10, 100)}%` }}></div>
                        </div>
                        <div className="flex flex-col items-end min-w-[70px]">
                            <span className="text-[10px] font-bold text-[#059669]">{doc.count} Appts</span>
                            <span className="text-[10px] font-bold text-[#10B981]">{doc.completionRate}% Done</span>
                        </div>
                    </div>
                </div>
            )) : (
                <p className="text-gray-400 text-sm text-center py-6">No doctor performance data available.</p>
            )}
        </div>
    </div>
);
