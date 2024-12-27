'use client'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface Lead {
 status: string;
}

export default function LeadStatusChart({ leads }: { leads: Lead[] }) {
 const statusCounts = leads.reduce((acc: Record<string, number>, lead) => {
   acc[lead.status] = (acc[lead.status] || 0) + 1;
   return acc;
 }, {});

 const data = Object.entries(statusCounts).map(([name, value]) => ({
   name,
   value
 }));

 const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

 return (
   <PieChart width={400} height={400}>
     <Pie
       data={data}
       cx={200}
       cy={200}
       labelLine={false}
       outerRadius={150}
       fill="#8884d8"
       dataKey="value"
       nameKey="name"
     >
       {data.map((_, index) => (
         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
       ))}
     </Pie>
     <Tooltip />
     <Legend />
   </PieChart>
 );
}