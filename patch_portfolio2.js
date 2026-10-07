const fs = require('fs');
let code = fs.readFileSync('src/components/profile/PortfolioView.tsx', 'utf8');

const targetStr = `  return (
                <div 
                  key={p.id} `;

const replacement = `  const rightSidebarContent = (
    <div className="space-y-4">
      {/* Keahlian Card - Doughnut Chart */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2 text-base">Keahlian</h3>
        {chartData.length > 0 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [\`\${value}%\`, 'Kemahiran']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada keahlian.</p>
        )}
      </div>

      {/* Pendidikan (Education) */}
      {profile.education && profile.education.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Pendidikan</h3>
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-4 pb-2">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="relative pl-5">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-4 border-slate-300 rounded-full" />
                <h4 className="text-sm font-bold leading-tight text-slate-900">{edu.school}</h4>
                <div className="text-xs text-slate-600 font-medium mt-0.5">{edu.major} {edu.degree && \`• \${edu.degree}\`}</div>
                <div className="text-[11px] text-slate-400 font-bold mt-1">{edu.year}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proyek (Experience) - Interactive Timeline */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Proyek</h3>
        {projectsTimeline.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
            {projectsTimeline.map((p) => {
              const isSelected = selectedProjectId === p.id;
              return (
                <div 
                  key={p.id} `;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/profile/PortfolioView.tsx', code);
console.log('done');
