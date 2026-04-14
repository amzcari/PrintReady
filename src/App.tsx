import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Grid3X3, 
  CircleDot, 
  Music, 
  Type, 
  Download, 
  Settings2, 
  Maximize2,
  ChevronRight,
  Printer,
  Columns,
  Plus
} from 'lucide-react';

type TemplateType = 'graph' | 'dot' | 'music' | 'handwriting' | 'columns' | 'cross';

interface Config {
  type: TemplateType;
  gap: number;
  color: string;
  thickness: number;
  opacity: number;
}

export default function App() {
  const [config, setConfig] = useState<Config>({
    type: 'graph',
    gap: 5,
    color: '#1a1a1a',
    thickness: 0.2,
    opacity: 0.5,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;
  const MARGIN = 10;

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const { type, gap, color, thickness } = config;
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(thickness);

      if (type === 'graph') {
        for (let x = MARGIN; x <= A4_WIDTH - MARGIN; x += gap) doc.line(x, MARGIN, x, A4_HEIGHT - MARGIN);
        for (let y = MARGIN; y <= A4_HEIGHT - MARGIN; y += gap) doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
      } else if (type === 'dot') {
        doc.setFillColor(r, g, b);
        for (let x = MARGIN; x <= A4_WIDTH - MARGIN; x += gap) {
          for (let y = MARGIN; y <= A4_HEIGHT - MARGIN; y += gap) doc.circle(x, y, thickness / 2, 'F');
        }
      } else if (type === 'music') {
        const staffHeight = gap * 4;
        const staffSpacing = gap * 3;
        for (let y = MARGIN; y <= A4_HEIGHT - MARGIN - staffHeight; y += staffHeight + staffSpacing) {
          for (let i = 0; i < 5; i++) {
            const lineY = y + i * gap;
            doc.line(MARGIN, lineY, A4_WIDTH - MARGIN, lineY);
          }
        }
      } else if (type === 'handwriting') {
        const rowHeight = gap * 2;
        const rowSpacing = gap * 1.5;
        for (let y = MARGIN; y <= A4_HEIGHT - MARGIN - rowHeight; y += rowHeight + rowSpacing) {
          doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(MARGIN, y + gap, A4_WIDTH - MARGIN, y + gap);
          doc.setLineDashPattern([], 0);
          doc.line(MARGIN, y + rowHeight, A4_WIDTH - MARGIN, y + rowHeight);
        }
      } else if (type === 'columns') {
        for (let x = MARGIN; x <= A4_WIDTH - MARGIN; x += gap) {
          doc.line(x, MARGIN, x, A4_HEIGHT - MARGIN);
        }
      } else if (type === 'cross') {
        const crossSize = thickness * 2;
        for (let x = MARGIN; x <= A4_WIDTH - MARGIN; x += gap) {
          for (let y = MARGIN; y <= A4_HEIGHT - MARGIN; y += gap) {
            doc.line(x - crossSize, y, x + crossSize, y);
            doc.line(x, y - crossSize, x, y + crossSize);
          }
        }
      }
      doc.save(`${config.type}-template.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const { type, gap, color, thickness, opacity } = config;
  const scale = 3; 
  const w = A4_WIDTH * scale;
  const h = A4_HEIGHT * scale;
  const m = MARGIN * scale;
  const g = gap * scale;

  return (
    <div className="flex h-screen w-screen bg-[#F8F7F4] text-[#1A1A1A] overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-[#E5E5E1] flex flex-col transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
        <div className="p-6 border-b border-[#E5E5E1] flex items-center gap-3 shrink-0">
          <Printer className="w-6 h-6" />
          <h1 className="font-serif italic text-xl font-bold">PrintReady</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Template</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'graph', icon: Grid3X3, label: 'Graph' },
                { id: 'dot', icon: CircleDot, label: 'Dot Grid' },
                { id: 'music', icon: Music, label: 'Music' },
                { id: 'handwriting', icon: Type, label: 'Writing' },
                { id: 'columns', icon: Columns, label: 'Columns' },
                { id: 'cross', icon: Plus, label: 'Cross Grid' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig({ ...config, type: t.id as TemplateType })}
                  className={`flex flex-col items-center p-4 rounded-lg border transition-all ${config.type === t.id ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                >
                  <t.icon className="w-5 h-5 mb-2" />
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-6">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Settings</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2"><span>Gap</span><span>{gap}mm</span></div>
                <input type="range" min="2" max="20" value={gap} onChange={(e) => setConfig({...config, gap: Number(e.target.value)})} className="w-full accent-black" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2"><span>Weight</span><span>{thickness}mm</span></div>
                <input type="range" min="0.05" max="1" step="0.05" value={thickness} onChange={(e) => setConfig({...config, thickness: Number(e.target.value)})} className="w-full accent-black" />
              </div>
            </div>
          </section>
        </div>
        <div className="p-6 border-t border-[#E5E5E1]">
          <button onClick={downloadPDF} className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#E5E5E1] bg-white flex items-center justify-between px-6">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg"><Settings2 className="w-5 h-5" /></button>
          <span className="text-sm text-gray-500 font-medium">A4 Portrait · 210 × 297 mm</span>
          <Maximize2 className="w-5 h-5 text-gray-400" />
        </header>
        <div className="flex-1 overflow-auto p-12 flex justify-center bg-[#F0EFEC]">
          <div className="w-full max-w-[600px] bg-white shadow-2xl min-h-[842px] p-0">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" style={{ opacity }}>
              {type === 'graph' && (
                <g stroke={color} strokeWidth={thickness * scale}>
                  {Array.from({ length: Math.floor((A4_WIDTH - 2 * MARGIN) / gap) + 1 }).map((_, i) => <line key={i} x1={m + i * g} y1={m} x2={m + i * g} y2={h - m} />)}
                  {Array.from({ length: Math.floor((A4_HEIGHT - 2 * MARGIN) / gap) + 1 }).map((_, i) => <line key={i} x1={m} y1={m + i * g} x2={w - m} y2={m + i * g} />)}
                </g>
              )}
              {type === 'dot' && (
                <g fill={color}>
                  {Array.from({ length: Math.floor((A4_WIDTH - 2 * MARGIN) / gap) + 1 }).map((_, ix) => 
                    Array.from({ length: Math.floor((A4_HEIGHT - 2 * MARGIN) / gap) + 1 }).map((_, iy) => <circle key={`${ix}-${iy}`} cx={m + ix * g} cy={m + iy * g} r={(thickness * scale) / 2} />)
                  )}
                </g>
              )}
              {type === 'music' && (
                <g stroke={color} strokeWidth={thickness * scale}>
                  {Array.from({ length: Math.max(1, Math.floor((A4_HEIGHT - 2 * MARGIN) / (gap * 7))) }).map((_, s) => 
                    Array.from({ length: 5 }).map((_, l) => <line key={`${s}-${l}`} x1={m} y1={m + s * (gap * 7 * scale) + l * g} x2={w - m} y2={m + s * (gap * 7 * scale) + l * g} />)
                  )}
                </g>
              )}
              {type === 'handwriting' && (
                <g stroke={color} strokeWidth={thickness * scale}>
                  {Array.from({ length: Math.max(1, Math.floor((A4_HEIGHT - 2 * MARGIN) / (gap * 3.5))) }).map((_, r) => {
                    const y = m + r * (gap * 3.5 * scale);
                    return <g key={r}>
                      <line x1={m} y1={y} x2={w - m} y2={y} />
                      <line x1={m} y1={y + g} x2={w - m} y2={y + g} strokeDasharray={`${scale} ${scale}`} />
                      <line x1={m} y1={y + 2 * g} x2={w - m} y2={y + 2 * g} />
                    </g>
                  })}
                </g>
              )}
              {type === 'columns' && (
                <g stroke={color} strokeWidth={thickness * scale}>
                  {Array.from({ length: Math.floor((A4_WIDTH - 2 * MARGIN) / gap) + 1 }).map((_, i) => <line key={i} x1={m + i * g} y1={m} x2={m + i * g} y2={h - m} />)}
                </g>
              )}
              {type === 'cross' && (
                <g stroke={color} strokeWidth={thickness * scale}>
                  {Array.from({ length: Math.floor((A4_WIDTH - 2 * MARGIN) / gap) + 1 }).map((_, ix) => 
                    Array.from({ length: Math.floor((A4_HEIGHT - 2 * MARGIN) / gap) + 1 }).map((_, iy) => {
                      const x = m + ix * g;
                      const y = m + iy * g;
                      const cs = thickness * scale * 2;
                      return <g key={`${ix}-${iy}`}>
                        <line x1={x - cs} y1={y} x2={x + cs} y2={y} />
                        <line x1={x} y1={y - cs} x2={x} y2={y + cs} />
                      </g>
                    })
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
}
