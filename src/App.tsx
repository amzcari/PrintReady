import React, { useState } from 'react';
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
  Calendar,
  Layout,
  Menu,
  X,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  DollarSign,
  Utensils,
  BookOpen
} from 'lucide-react';

type Page = 'home' | 'generator' | 'planners' | 'planner-detail';
type TemplateType = 'grid' | 'dot' | 'lined' | 'music' | 'isometric' | 'isometric-dot' | 'hex';
type PageSize = 'A4' | 'A5' | 'Letter';
type Orientation = 'portrait' | 'landscape';

interface Config {
  type: TemplateType;
  gap: number;
  color: string;
  thickness: number;
  opacity: number;
  margin: number;
  pageSize: PageSize;
  orientation: Orientation;
  grouping: number;
}

interface PlannerTemplate {
  title: string;
  slug: string;
  desc: string;
  h1: string;
  seoText: string;
  icon: any;
}

const PLANNER_TEMPLATES: PlannerTemplate[] = [
  { 
    title: 'Weekly Focus Planner', 
    slug: 'weekly-planner', 
    desc: 'Escape digital noise. Plan your week offline for maximum focus.',
    h1: 'Printable Weekly Planner for Digital Detox',
    seoText: 'Reclaim your attention with our offline weekly planner printable. Designed for a true digital detox, this template helps you escape notifications and focus on what matters. Featuring a minimal layout for Monday through Sunday, dedicated task sections, and a deep-work notes area. Perfect for reducing screen time and boosting productivity.',
    icon: Calendar
  },
  { 
    title: 'Deep Work Daily', 
    slug: 'daily-planner', 
    desc: 'A minimal daily template for high-focus productivity.',
    h1: 'Focus Planner Printable PDF - Daily Offline Planning',
    seoText: 'Stop the scroll and start the work. Our focus planner printable PDF is built for deep work and offline productivity. It includes a date section, top 3 priorities to eliminate distractions, an hourly schedule for time-blocking, and a clean notes section. The ultimate tool for an ADHD-friendly, minimal planning experience.',
    icon: ClipboardList
  },
  { 
    title: 'Habit Architect', 
    slug: 'habit-tracker', 
    desc: 'Build consistency away from your phone.',
    h1: 'Minimal Habit Tracker Printable Monthly',
    seoText: 'Track your progress without the digital distractions. Our minimal habit tracker printable allows you to architect better routines across 31 days. Simply list your habits and check them off physically—a proven way to increase dopamine and maintain consistency without opening an app.',
    icon: CheckCircle2
  },
  { 
    title: 'Mindful Budget', 
    slug: 'budget-planner', 
    desc: 'Track your finances with clarity and intention.',
    h1: 'Minimalist Budget Planner Printable PDF',
    seoText: 'Take a mindful approach to your finances. This minimalist budget planner printable helps you track income and expenses with zero digital noise. Featuring a structured table for clear financial oversight, it is the perfect offline tool for those seeking financial clarity and a break from complex apps.',
    icon: DollarSign
  },
  { 
    title: 'Nourish Meal Planner', 
    slug: 'meal-planner', 
    desc: 'Plan healthy meals without the screen time.',
    h1: 'Weekly Meal Planner Printable for Focus',
    seoText: 'Simplify your kitchen routine with our weekly meal planner printable. Plan your breakfast, lunch, and dinner for the entire week on a single sheet of paper. Reduce decision fatigue and stay focused on your health goals without the distraction of recipe apps and notifications.',
    icon: Utensils
  },
  { 
    title: 'Academic Focus Tracker', 
    slug: 'study-tracker', 
    desc: 'The ultimate offline tool for students and deep learning.',
    h1: 'ADHD Study Tracker Printable Free',
    seoText: 'Optimize your learning with our academic focus tracker. Specifically designed as an ADHD-friendly study tracker, it helps students monitor subjects and time spent in a distraction-free, offline format. Set clear goals and review your progress without the temptation of digital interruptions.',
    icon: BookOpen
  },
];

const PaperPattern = ({ config }: { config: Config }) => {
  const { type, gap, color, thickness, opacity, margin, pageSize, orientation, grouping } = config;
  
  const baseWidth = PAGE_SIZES[pageSize].width;
  const baseHeight = PAGE_SIZES[pageSize].height;
  
  const width = orientation === 'portrait' ? baseWidth : baseHeight;
  const height = orientation === 'portrait' ? baseHeight : baseWidth;
  
  const scale = 3; // For high-res preview
  const w = width * scale;
  const h = height * scale;
  const m = margin * scale;
  const g = gap * scale;
  const t = thickness * scale;

  const renderPattern = () => {
    const lines = [];
    const dots = [];
    const paths = [];

    const contentWidth = w - 2 * m;
    const contentHeight = h - 2 * m;

    switch (type) {
      case 'grid': {
        const cols = Math.floor(contentWidth / g);
        const rows = Math.floor(contentHeight / g);
        for (let i = 0; i <= cols; i++) {
          const x = m + i * g;
          const isGroup = grouping > 0 && i % grouping === 0;
          lines.push(<line key={`v-${i}`} x1={x} y1={m} x2={x} y2={h - m} strokeWidth={isGroup ? t * 2 : t} />);
        }
        for (let i = 0; i <= rows; i++) {
          const y = m + i * g;
          const isGroup = grouping > 0 && i % grouping === 0;
          lines.push(<line key={`h-${i}`} x1={m} y1={y} x2={w - m} y2={y} strokeWidth={isGroup ? t * 2 : t} />);
        }
        break;
      }
      case 'dot': {
        const cols = Math.floor(contentWidth / g);
        const rows = Math.floor(contentHeight / g);
        for (let ix = 0; ix <= cols; ix++) {
          for (let iy = 0; iy <= rows; iy++) {
            dots.push(<circle key={`${ix}-${iy}`} cx={m + ix * g} cy={m + iy * g} r={t / 2} />);
          }
        }
        break;
      }
      case 'lined': {
        const rows = Math.floor(contentHeight / g);
        for (let i = 0; i <= rows; i++) {
          const y = m + i * g;
          const isGroup = grouping > 0 && i % grouping === 0;
          lines.push(<line key={i} x1={m} y1={y} x2={w - m} y2={y} strokeWidth={isGroup ? t * 2 : t} />);
        }
        break;
      }
      case 'music': {
        const staffHeight = g * 4;
        const staffSpacing = g * 3;
        const totalStaffHeight = staffHeight + staffSpacing;
        const numStaffs = Math.floor(contentHeight / totalStaffHeight);
        for (let s = 0; s < numStaffs; s++) {
          const startY = m + s * totalStaffHeight;
          for (let l = 0; l < 5; l++) {
            lines.push(<line key={`${s}-${l}`} x1={m} y1={startY + l * g} x2={w - m} y2={startY + l * g} strokeWidth={t} />);
          }
        }
        break;
      }
      case 'isometric': {
        const angle = Math.PI / 3; // 60 degrees
        const hGap = g * Math.cos(angle / 2);
        const vGap = g;
        
        // Horizontal lines
        const rows = Math.floor(contentHeight / vGap);
        for (let i = 0; i <= rows; i++) {
          const y = m + i * vGap;
          lines.push(<line key={`h-${i}`} x1={m} y1={y} x2={w - m} y2={y} strokeWidth={t} />);
        }

        // Angled lines (60 and 120 degrees)
        // This is a bit more complex as they need to cover the whole area
        // We'll use a larger area and clip it
        const diagCount = Math.floor((w + h) / g) * 2;
        for (let i = -diagCount; i <= diagCount; i++) {
          // 60 degrees
          const x1_60 = m + i * g;
          const y1_60 = m;
          const x2_60 = x1_60 + h * Math.tan(Math.PI / 6);
          const y2_60 = h - m;
          lines.push(<line key={`a60-${i}`} x1={x1_60} y1={y1_60} x2={x2_60} y2={y2_60} strokeWidth={t} />);

          // 120 degrees
          const x1_120 = m + i * g;
          const y1_120 = m;
          const x2_120 = x1_120 - h * Math.tan(Math.PI / 6);
          const y2_120 = h - m;
          lines.push(<line key={`a120-${i}`} x1={x1_120} y1={y1_120} x2={x2_120} y2={y2_120} strokeWidth={t} />);
        }
        break;
      }
      case 'isometric-dot': {
        const hGap = g * Math.cos(Math.PI / 6);
        const vGap = g;
        const cols = Math.floor(contentWidth / hGap);
        const rows = Math.floor(contentHeight / vGap);
        for (let ix = 0; ix <= cols; ix++) {
          for (let iy = 0; iy <= rows; iy++) {
            const x = m + ix * hGap;
            const y = m + iy * vGap + (ix % 2 === 0 ? 0 : vGap / 2);
            dots.push(<circle key={`${ix}-${iy}`} cx={x} cy={y} r={t / 2} />);
          }
        }
        break;
      }
      case 'hex': {
        const hexSize = g / Math.sqrt(3);
        const hGap = g;
        const vGap = hexSize * 1.5;
        const cols = Math.floor(contentWidth / hGap) + 1;
        const rows = Math.floor(contentHeight / vGap) + 1;

        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c <= cols; c++) {
            const x = m + c * hGap + (r % 2 === 0 ? 0 : hGap / 2);
            const y = m + r * vGap;
            
            // Draw hexagon points
            const points = [];
            for (let i = 0; i < 6; i++) {
              const a = (Math.PI / 3) * i + Math.PI / 6;
              points.push(`${x + hexSize * Math.cos(a)},${y + hexSize * Math.sin(a)}`);
            }
            paths.push(<polygon key={`${r}-${c}`} points={points.join(' ')} fill="none" stroke={color} strokeWidth={t} />);
          }
        }
        break;
      }
    }

    return (
      <g stroke={color} fill={type.includes('dot') ? color : 'none'} style={{ opacity }}>
        <clipPath id="page-clip">
          <rect x={m} y={m} width={contentWidth} height={contentHeight} />
        </clipPath>
        <g clipPath="url(#page-clip)">
          {lines}
          {dots}
          {paths}
        </g>
      </g>
    );
  };

  return (
    <svg 
      viewBox={`0 0 ${w} ${h}`} 
      className="w-full h-auto shadow-lg bg-white"
      style={{ 
        aspectRatio: `${width}/${height}`,
      }}
    >
      {renderPattern()}
    </svg>
  );
};
const PlannerPreview = ({ type }: { type: string }) => {
  const containerStyle = {
    width: '794px',
    height: '1123px',
    backgroundColor: 'white',
    color: '#000',
    border: '1px solid #333',
    padding: '20px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  };

  const boxStyle = "border border-[#333] p-4 flex flex-col gap-2 relative overflow-hidden min-height-0 break-words";
  const headerStyle = "font-bold text-sm border-b border-[#333] pb-1 mb-2 uppercase tracking-wider shrink-0";

  const renderWeekly = () => (
    <div className="grid grid-cols-5 grid-rows-2 gap-4 flex-1 min-h-0 overflow-hidden">
      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
        <div key={day} className={boxStyle}>
          <div className={headerStyle}>{day}</div>
          <div className="flex-1 min-h-0 overflow-hidden"></div>
        </div>
      ))}
      <div className={`${boxStyle} col-span-2`}>
        <div className={headerStyle}>Saturday</div>
        <div className="flex-1 min-h-0 overflow-hidden"></div>
      </div>
      <div className={`${boxStyle} col-span-2`}>
        <div className={headerStyle}>Sunday</div>
        <div className="flex-1 min-h-0 overflow-hidden"></div>
      </div>
      <div className={boxStyle}>
        <div className={headerStyle}>Notes</div>
        <div className="flex-1 min-h-0 overflow-hidden"></div>
      </div>
    </div>
  );

  const renderDaily = () => (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <div className="flex justify-between items-end border-b-2 border-[#333] pb-2 shrink-0">
        <h1 className="text-3xl font-bold uppercase tracking-widest">Daily Focus</h1>
        <div className="text-lg">Date: ____________________</div>
      </div>
      
      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        <div className="col-span-4 flex flex-col gap-6 min-h-0">
          <div className={`${boxStyle} shrink-0`}>
            <div className={headerStyle}>Top 3 Priorities</div>
            <div className="space-y-4 py-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-[#333] shrink-0"></div>
                  <div className="flex-1 border-b border-[#333]"></div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${boxStyle} flex-1 min-h-0`}>
            <div className={headerStyle}>Notes & Ideas</div>
            <div className="flex-1 min-h-0"></div>
          </div>
        </div>
        
        <div className={`${boxStyle} col-span-8 flex-1 min-h-0`}>
          <div className={headerStyle}>Hourly Schedule</div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex-1 border-b border-[#eee] flex items-center gap-4 min-h-0">
                <span className="text-[10px] text-gray-400 w-8 shrink-0">{6 + i}:00</span>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHabit = () => (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-[#333] pb-2 shrink-0">Habit Architect</h1>
      <div className="grid border-t border-l border-[#333] flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: '150px repeat(31, 1fr)' }}>
        <div className="border-r border-b border-[#333] p-2 font-bold text-xs bg-gray-50 shrink-0">Habit</div>
        {Array.from({ length: 31 }).map((_, i) => (
          <div key={i} className="border-r border-b border-[#333] p-1 text-[8px] flex items-center justify-center bg-gray-50 shrink-0">{i + 1}</div>
        ))}
        
        {Array.from({ length: 20 }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="border-r border-b border-[#333] p-2 h-8 shrink-0"></div>
            {Array.from({ length: 31 }).map((_, j) => (
              <div key={j} className="border-r border-b border-[#333] h-8 shrink-0"></div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="flex flex-col gap-8 flex-1 min-h-0 overflow-hidden">
      <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-[#333] pb-2 shrink-0">Monthly Budget</h1>
      
      <div className="grid grid-cols-2 gap-8 shrink-0">
        <div className={boxStyle}>
          <div className={headerStyle}>Income Sources</div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b border-[#eee] pb-1">
                <div className="w-1/2 h-4"></div>
                <div className="w-20 border-l border-[#eee]"></div>
              </div>
            ))}
          </div>
        </div>
        <div className={boxStyle}>
          <div className={headerStyle}>Summary</div>
          <div className="space-y-4">
            <div className="flex justify-between font-bold text-sm"><span>Total Income</span><span>$ ______</span></div>
            <div className="flex justify-between font-bold text-sm"><span>Total Expenses</span><span>$ ______</span></div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-[#333]"><span>Net Balance</span><span>$ ______</span></div>
          </div>
        </div>
      </div>

      <div className={`${boxStyle} flex-1 min-h-0`}>
        <div className={headerStyle}>Expenses Tracker</div>
        <div className="grid grid-cols-12 border-b border-[#333] font-bold text-xs pb-1 mb-2 shrink-0">
          <div className="col-span-2">Date</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 border-b border-[#eee] py-2 shrink-0">
              <div className="col-span-2"></div>
              <div className="col-span-6"></div>
              <div className="col-span-2"></div>
              <div className="col-span-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMeal = () => (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-[#333] pb-2 shrink-0">Weekly Meal Plan</h1>
      <div className="grid grid-cols-8 flex-1 border-t border-l border-[#333] min-h-0 overflow-hidden">
        <div className="border-r border-b border-[#333] bg-gray-50 shrink-0"></div>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="border-r border-b border-[#333] p-2 font-bold text-center bg-gray-50 shrink-0">{day}</div>
        ))}
        
        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(meal => (
          <React.Fragment key={meal}>
            <div className="border-r border-b border-[#333] p-4 font-bold text-xs flex items-center justify-center bg-gray-50 shrink-0">{meal}</div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border-r border-b border-[#333] p-2 shrink-0"></div>
            ))}
          </React.Fragment>
        ))}
        <div className="col-span-1 border-r border-b border-[#333] p-4 font-bold text-xs flex items-center justify-center bg-gray-50 shrink-0">Grocery List</div>
        <div className="col-span-7 border-r border-b border-[#333] p-4 shrink-0"></div>
      </div>
    </div>
  );

  const renderStudy = () => (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-[#333] pb-2 shrink-0">Study Tracker</h1>
      
      <div className="grid grid-cols-3 gap-6 shrink-0">
        <div className={`${boxStyle} col-span-2`}>
          <div className={headerStyle}>Current Goals</div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 border border-[#333] shrink-0"></div>
                <div className="flex-1 border-b border-[#eee]"></div>
              </div>
            ))}
          </div>
        </div>
        <div className={boxStyle}>
          <div className={headerStyle}>Focus Score</div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-[#333] rounded-full flex items-center justify-center text-2xl font-bold">/ 10</div>
          </div>
        </div>
      </div>

      <div className={`${boxStyle} flex-1 min-h-0`}>
        <div className={headerStyle}>Session Log</div>
        <div className="grid grid-cols-12 border-b border-[#333] font-bold text-xs pb-1 mb-2 shrink-0">
          <div className="col-span-3">Subject</div>
          <div className="col-span-5">Topic</div>
          <div className="col-span-2 text-center">Duration</div>
          <div className="col-span-2 text-center">Status</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 border-b border-[#eee] py-3 shrink-0">
              <div className="col-span-3"></div>
              <div className="col-span-5"></div>
              <div className="col-span-2"></div>
              <div className="col-span-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const content = () => {
    switch (type) {
      case 'weekly': return renderWeekly();
      case 'daily': return renderDaily();
      case 'habit': return renderHabit();
      case 'budget': return renderBudget();
      case 'meal': return renderMeal();
      case 'study': return renderStudy();
      default: return null;
    }
  };

  return (
    <div className="print-area" style={containerStyle}>
      {content()}
    </div>
  );
};

const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
};

const A4_WIDTH = 210;
const A4_HEIGHT = 297;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlanner, setSelectedPlanner] = useState<PlannerTemplate | null>(null);
  const [config, setConfig] = useState<Config>({
    type: 'grid',
    gap: 5,
    color: '#1a1a1a',
    thickness: 0.2,
    opacity: 0.5,
    margin: 10,
    pageSize: 'A4',
    orientation: 'portrait',
    grouping: 0,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    let title = 'SimplePrintouts – Free Printable Paper & Planners';
    let description = 'SimplePrintouts – Free Printable Paper & Planner Templates. Generate high-quality PDFs for grid paper, dot grids, music staff, and custom planners.';
    
    if (currentPage === 'generator') {
      title = 'Custom Paper Generator | SimplePrintouts';
      description = 'Design your own custom printable paper. Adjust spacing, margins, and colors for grid, dot, isometric, and hex patterns.';
    }
    if (currentPage === 'planners') {
      title = 'Printable Planners & Trackers | SimplePrintouts';
      description = 'Browse our collection of free printable planners, habit trackers, and budget sheets designed for focus and productivity.';
    }
    if (currentPage === 'planner-detail' && selectedPlanner) {
      title = `${selectedPlanner.title} | SimplePrintouts`;
      description = selectedPlanner.desc;
    }
    
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [currentPage, selectedPlanner]);

  const downloadPDF = () => {
    const { type, gap, color, thickness, margin, pageSize, orientation, grouping } = config;
    const baseWidth = PAGE_SIZES[pageSize].width;
    const baseHeight = PAGE_SIZES[pageSize].height;
    const width = orientation === 'portrait' ? baseWidth : baseHeight;
    const height = orientation === 'portrait' ? baseHeight : baseWidth;

    const doc = new jsPDF({ 
      orientation: orientation, 
      unit: 'mm', 
      format: pageSize.toLowerCase() 
    });

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(thickness);

    const drawPattern = (d: jsPDF) => {
      const contentWidth = width - 2 * margin;
      const contentHeight = height - 2 * margin;

      switch (type) {
        case 'grid': {
          const cols = Math.floor(contentWidth / gap);
          const rows = Math.floor(contentHeight / gap);
          for (let i = 0; i <= cols; i++) {
            const x = margin + i * gap;
            const isGroup = grouping > 0 && i % grouping === 0;
            d.setLineWidth(isGroup ? thickness * 2 : thickness);
            d.line(x, margin, x, height - margin);
          }
          for (let i = 0; i <= rows; i++) {
            const y = margin + i * gap;
            const isGroup = grouping > 0 && i % grouping === 0;
            d.setLineWidth(isGroup ? thickness * 2 : thickness);
            d.line(margin, y, width - margin, y);
          }
          break;
        }
        case 'dot': {
          d.setFillColor(r, g, b);
          const cols = Math.floor(contentWidth / gap);
          const rows = Math.floor(contentHeight / gap);
          for (let ix = 0; ix <= cols; ix++) {
            for (let iy = 0; iy <= rows; iy++) {
              d.circle(margin + ix * gap, margin + iy * gap, thickness / 2, 'F');
            }
          }
          break;
        }
        case 'lined': {
          const rows = Math.floor(contentHeight / gap);
          for (let i = 0; i <= rows; i++) {
            const y = margin + i * gap;
            const isGroup = grouping > 0 && i % grouping === 0;
            d.setLineWidth(isGroup ? thickness * 2 : thickness);
            d.line(margin, y, width - margin, y);
          }
          break;
        }
        case 'music': {
          const staffHeight = gap * 4;
          const staffSpacing = gap * 3;
          const totalStaffHeight = staffHeight + staffSpacing;
          const numStaffs = Math.floor(contentHeight / totalStaffHeight);
          for (let s = 0; s < numStaffs; s++) {
            const startY = margin + s * totalStaffHeight;
            for (let l = 0; l < 5; l++) {
              d.line(margin, startY + l * gap, width - margin, startY + l * gap);
            }
          }
          break;
        }
        case 'isometric': {
          // Horizontal
          const rows = Math.floor(contentHeight / gap);
          for (let i = 0; i <= rows; i++) {
            const y = margin + i * gap;
            d.line(margin, y, width - margin, y);
          }
          
          // Angled lines
          const tan30 = Math.tan(Math.PI / 6);
          const diagCount = Math.floor((width + height) / gap) * 2;
          for (let i = -diagCount; i <= diagCount; i++) {
            // 60 degrees
            const x1_60 = margin + i * gap;
            const y1_60 = margin;
            const x2_60 = x1_60 + (height - 2 * margin) * tan30;
            const y2_60 = height - margin;
            
            // Clip manually for jsPDF
            const lx1 = Math.max(margin, Math.min(width - margin, x1_60));
            const lx2 = Math.max(margin, Math.min(width - margin, x2_60));
            if (lx1 !== lx2) d.line(lx1, y1_60, lx2, y2_60);

            // 120 degrees
            const x1_120 = margin + i * gap;
            const y1_120 = margin;
            const x2_120 = x1_120 - (height - 2 * margin) * tan30;
            const y2_120 = height - margin;
            
            const rx1 = Math.max(margin, Math.min(width - margin, x1_120));
            const rx2 = Math.max(margin, Math.min(width - margin, x2_120));
            if (rx1 !== rx2) d.line(rx1, y1_120, rx2, y2_120);
          }
          break;
        }
        case 'isometric-dot': {
          d.setFillColor(r, g, b);
          const hGap = gap * Math.cos(Math.PI / 6);
          const vGap = gap;
          const cols = Math.floor(contentWidth / hGap);
          const rows = Math.floor(contentHeight / vGap);
          for (let ix = 0; ix <= cols; ix++) {
            for (let iy = 0; iy <= rows; iy++) {
              const x = margin + ix * hGap;
              const y = margin + iy * vGap + (ix % 2 === 0 ? 0 : vGap / 2);
              if (x <= width - margin && y <= height - margin) {
                d.circle(x, y, thickness / 2, 'F');
              }
            }
          }
          break;
        }
        case 'hex': {
          const hexSize = gap / Math.sqrt(3);
          const hGap = gap;
          const vGap = hexSize * 1.5;
          const cols = Math.floor(contentWidth / hGap) + 1;
          const rows = Math.floor(contentHeight / vGap) + 1;

          for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
              const x = margin + c * hGap + (r % 2 === 0 ? 0 : hGap / 2);
              const y = margin + r * vGap;
              
              const points = [];
              for (let i = 0; i < 6; i++) {
                const a = (Math.PI / 3) * i + Math.PI / 6;
                const px = x + hexSize * Math.cos(a);
                const py = y + hexSize * Math.sin(a);
                points.push({ x: px, y: py });
              }
              
              // Draw hexagon if within margins
              for (let i = 0; i < 6; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % 6];
                if (p1.x >= margin && p1.x <= width - margin && p1.y >= margin && p1.y <= height - margin &&
                    p2.x >= margin && p2.x <= width - margin && p2.y >= margin && p2.y <= height - margin) {
                  d.line(p1.x, p1.y, p2.x, p2.y);
                }
              }
            }
          }
          break;
        }
      }
    };

    drawPattern(doc);
    doc.save(`simpleprintouts-${type}-${pageSize.toLowerCase()}.pdf`);
  };

  const downloadPlannerPDF = (planner: PlannerTemplate) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setDrawColor(200); // Lighter gray for minimal look
    doc.setLineWidth(0.1);
    doc.setFontSize(16);
    doc.setTextColor(60); // Dark gray text
    doc.text(planner.title, 10, 15);
    
    const margin = 10;
    const width = A4_WIDTH - 2 * margin;
    const height = A4_HEIGHT - 2 * margin - 10; // Extra space for title
    const startY = 25;

    if (planner.slug === 'weekly-planner') {
      const dayHeight = height / 8;
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Notes'];
      days.forEach((day, i) => {
        const y = startY + i * dayHeight;
        doc.rect(margin, y, width, dayHeight);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(day, margin + 2, y + 5);
      });
    } else if (planner.slug === 'daily-planner') {
      doc.rect(margin, startY, width, 10);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Date: ____________________', margin + 2, startY + 7);
      
      const prioritiesY = startY + 15;
      doc.setTextColor(60);
      doc.text('Top Priorities:', margin, prioritiesY);
      for (let i = 0; i < 3; i++) {
        doc.rect(margin, prioritiesY + 5 + i * 8, 5, 5);
        doc.line(margin + 7, prioritiesY + 10 + i * 8, width + margin, prioritiesY + 10 + i * 8);
      }

      const scheduleY = prioritiesY + 35;
      doc.text('Schedule:', margin, scheduleY);
      for (let i = 0; i < 16; i++) {
        const hour = 6 + i;
        const y = scheduleY + 5 + i * 8;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`${hour}:00`, margin, y + 5);
        doc.line(margin + 10, y + 6, width + margin, y + 6);
      }

      const notesY = scheduleY + 135;
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text('Notes:', margin, notesY);
      doc.rect(margin, notesY + 5, width, 30);
    } else if (planner.slug === 'habit-tracker') {
      const rowHeight = 8;
      const colWidth = (width - 40) / 31;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Habit', margin, startY + 5);
      for (let i = 1; i <= 31; i++) {
        doc.text(i.toString(), margin + 40 + (i - 1) * colWidth, startY + 5);
      }
      for (let i = 0; i < 25; i++) {
        const y = startY + 8 + i * rowHeight;
        doc.rect(margin, y, 40, rowHeight);
        for (let j = 0; j < 31; j++) {
          doc.rect(margin + 40 + j * colWidth, y, colWidth, rowHeight);
        }
      }
    } else if (planner.slug === 'budget-planner') {
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text('Income', margin, startY + 5);
      doc.rect(margin, startY + 8, width, 30);
      doc.text('Expenses', margin, startY + 45);
      doc.rect(margin, startY + 48, width, 150);
      doc.line(margin + width / 2, startY + 48, margin + width / 2, startY + 198);
      doc.setTextColor(100);
      doc.text('Item', margin + 2, startY + 53);
      doc.text('Amount', margin + width / 2 + 2, startY + 53);
      doc.setTextColor(60);
      doc.text('Total Summary', margin, startY + 205);
      doc.rect(margin, startY + 208, width, 20);
    } else if (planner.slug === 'meal-planner') {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const rowHeight = (height - 10) / 7;
      const colWidth = width / 3;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Breakfast', margin + colWidth / 4, startY + 5);
      doc.text('Lunch', margin + colWidth + colWidth / 4, startY + 5);
      doc.text('Dinner', margin + 2 * colWidth + colWidth / 4, startY + 5);
      days.forEach((day, i) => {
        const y = startY + 8 + i * rowHeight;
        doc.text(day, margin - 8, y + rowHeight / 2, { angle: 90 });
        doc.rect(margin, y, colWidth, rowHeight);
        doc.rect(margin + colWidth, y, colWidth, rowHeight);
        doc.rect(margin + 2 * colWidth, y, colWidth, rowHeight);
      });
    } else if (planner.slug === 'study-tracker') {
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text('Goals for this session:', margin, startY + 5);
      doc.rect(margin, startY + 8, width, 20);
      doc.text('Study Log:', margin, startY + 35);
      const rowHeight = 10;
      doc.setTextColor(100);
      doc.text('Subject', margin + 2, startY + 42);
      doc.text('Time Spent', margin + width / 2 + 2, startY + 42);
      for (let i = 0; i < 15; i++) {
        const y = startY + 45 + i * rowHeight;
        doc.rect(margin, y, width, rowHeight);
        doc.line(margin + width / 2, y, margin + width / 2, y + rowHeight);
      }
      doc.setTextColor(60);
      doc.text('Notes / Review:', margin, startY + 205);
      doc.rect(margin, startY + 208, width, 40);
    }

    doc.save(`simpleprintouts-${planner.slug}.pdf`);
  };

  const renderHomepage = () => (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center bg-[#F8F7F4] border-b border-[#E5E5E1]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif italic font-bold mb-6 tracking-tight">
            Free Printable Paper & <br />Planner Templates
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Generate high-quality printable paper and planners instantly. SimplePrintouts provides 
            minimal, distraction-free templates designed for deep work, organization, and creativity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => setCurrentPage('generator')}
                className="bg-black text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
              >
                Print It <ArrowRight className="w-5 h-5" />
              </button>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Download and print instantly</span>
            </div>
            <button 
              onClick={() => setCurrentPage('planners')}
              className="bg-white border border-[#E5E5E1] px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all h-[60px]"
            >
              Browse Planners
            </button>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6">High-Quality Printable Paper for Every Need</h2>
            <p className="text-gray-600 mb-4">
              SimplePrintouts is your go-to source for **free printouts** and professional-grade **printable paper**. Whether you are a student, designer, or organization enthusiast, our tool allows you to generate the perfect template in seconds.
            </p>
            <p className="text-gray-600 mb-4">
              Our **grid paper printable** options range from standard 5mm squares to complex isometric and hexagonal grids. We also offer a wide variety of **printable planners** including daily focus sheets, weekly organizers, and habit trackers—all optimized for A4, A5, and Letter sizes.
            </p>
            <p className="text-gray-600">
              Stop searching for the perfect notebook. With SimplePrintouts, you can customize line weight, spacing, and color to create exactly what you need. Download your custom PDF and print it instantly for a distraction-free, offline experience.
            </p>
          </div>
          <div className="bg-[#F0EFEC] p-8 rounded-2xl border border-[#E5E5E1]">
            <h3 className="font-bold mb-4">Focus-Driven Templates</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {[
                'Grid Paper 5mm', 
                'Dotted Paper A4', 
                'Weekly Planner PDF', 
                'Daily Planner for Focus', 
                'Habit Tracker Monthly', 
                'ADHD Study Log', 
                'Minimal Planner PDF', 
                'Productivity Planner',
                'Offline Meal Plan',
                'Mindful Budget'
              ].map((link) => (
                <li key={link} onClick={() => setCurrentPage('generator')} className="text-gray-500 hover:text-black cursor-pointer underline">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: 'Grid Paper', slug: 'grid-paper', icon: Grid3X3 },
            { title: 'Dot Grid', slug: 'dotted-paper', icon: CircleDot },
            { title: 'Isometric', slug: 'isometric-paper', icon: Maximize2 },
            { title: 'Hex Grid', slug: 'hex-paper', icon: Layout },
          ].map((cat) => (
            <button 
              key={cat.slug}
              onClick={() => {
                setConfig({...config, type: cat.slug.split('-')[0] as TemplateType});
                setCurrentPage('generator');
              }}
              className="p-8 border border-[#E5E5E1] rounded-2xl hover:border-black transition-all text-center group"
            >
              <cat.icon className="w-10 h-10 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold">{cat.title}</h3>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const renderGenerator = () => {
    const { type, gap, color, thickness, opacity, margin, pageSize, orientation, grouping } = config;

    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-[#E5E5E1] flex flex-col transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
          <div className="p-6 border-b border-[#E5E5E1] flex items-center gap-3 shrink-0">
            <Settings2 className="w-5 h-5" />
            <h2 className="font-bold">Customize</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">Paper Type</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'grid', icon: Grid3X3, label: 'Grid' },
                  { id: 'dot', icon: CircleDot, label: 'Dot Grid' },
                  { id: 'lined', icon: Type, label: 'Lined' },
                  { id: 'music', icon: Music, label: 'Music Staff' },
                  { id: 'isometric', icon: Maximize2, label: 'Isometric' },
                  { id: 'isometric-dot', icon: CircleDot, label: 'Iso Dot' },
                  { id: 'hex', icon: Layout, label: 'Hex Grid' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig({ ...config, type: t.id as TemplateType })}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${config.type === t.id ? 'bg-black text-white border-black' : 'hover:bg-gray-50 border-[#E5E5E1]'}`}
                  >
                    <t.icon className="w-4 h-4 mb-2" />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Page Settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400">Size</label>
                  <select 
                    value={pageSize} 
                    onChange={(e) => setConfig({...config, pageSize: e.target.value as PageSize})}
                    className="w-full p-2 text-xs border border-[#E5E5E1] rounded"
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400">Orientation</label>
                  <select 
                    value={orientation} 
                    onChange={(e) => setConfig({...config, orientation: e.target.value as Orientation})}
                    className="w-full p-2 text-xs border border-[#E5E5E1] rounded"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
            </section>
            
            <section className="space-y-6">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Pattern Settings</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2"><span>Spacing</span><span>{gap}mm</span></div>
                  <input type="range" min="2" max="30" value={gap} onChange={(e) => setConfig({...config, gap: Number(e.target.value)})} className="w-full accent-black" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2"><span>Margin</span><span>{margin}mm</span></div>
                  <input type="range" min="0" max="40" value={margin} onChange={(e) => setConfig({...config, margin: Number(e.target.value)})} className="w-full accent-black" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2"><span>Weight</span><span>{thickness}mm</span></div>
                  <input type="range" min="0.05" max="1" step="0.05" value={thickness} onChange={(e) => setConfig({...config, thickness: Number(e.target.value)})} className="w-full accent-black" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2"><span>Opacity</span><span>{Math.round(opacity * 100)}%</span></div>
                  <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={(e) => setConfig({...config, opacity: Number(e.target.value)})} className="w-full accent-black" />
                </div>
                {(type === 'grid' || type === 'lined') && (
                  <div>
                    <div className="flex justify-between text-xs mb-2"><span>Grouping</span><span>{grouping === 0 ? 'None' : `Every ${grouping}`}</span></div>
                    <input type="range" min="0" max="10" step="1" value={grouping} onChange={(e) => setConfig({...config, grouping: Number(e.target.value)})} className="w-full accent-black" />
                  </div>
                )}
                <div>
                  <div className="flex justify-between text-xs mb-2"><span>Color</span><span className="font-mono">{color}</span></div>
                  <input type="color" value={color} onChange={(e) => setConfig({...config, color: e.target.value})} className="w-full h-8 cursor-pointer rounded border-0" />
                </div>
              </div>
            </section>
          </div>
          <div className="p-6 border-t border-[#E5E5E1] space-y-3">
            <div className="flex flex-col gap-2">
              <button onClick={downloadPDF} className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800">
                <Download className="w-4 h-4" /> Print It
              </button>
              <span className="text-[10px] text-gray-400 font-mono uppercase text-center">Download and print instantly</span>
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 overflow-auto p-12 flex justify-center bg-[#F0EFEC]">
          <div className="print-container w-full max-w-[600px] relative">
            <PaperPattern config={config} />
          </div>
        </main>
      </div>
    );
  };

  const renderPlanners = () => (
    <div className="flex-1 overflow-y-auto p-12 bg-[#F8F7F4]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif italic font-bold mb-4">Printable Planners & Trackers</h1>
          <p className="text-gray-600">Download high-quality PDF planners for your daily organization. Choose from weekly planners, habit trackers, and more.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-8">
          {PLANNER_TEMPLATES.map((p) => (
            <div key={p.slug} className="bg-white p-8 rounded-2xl border border-[#E5E5E1] hover:shadow-lg transition-all group">
              <p.icon className="w-8 h-8 mb-6 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-xl font-bold mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm mb-6">{p.desc}</p>
              <button 
                onClick={() => {
                  setSelectedPlanner(p);
                  setCurrentPage('planner-detail');
                }}
                className="text-sm font-bold flex items-center gap-2 group-hover:underline"
              >
                View Template <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlannerDetail = () => {
    if (!selectedPlanner) return null;
    return (
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-5xl mx-auto py-16 px-6">
          <button 
            onClick={() => setCurrentPage('planners')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Planners
          </button>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h1 className="text-4xl font-bold mb-6">{selectedPlanner.h1}</h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {selectedPlanner.seoText}
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all w-fit"
                >
                  <Printer className="w-5 h-5" /> Print It
                </button>
                <span className="text-[10px] text-gray-400 font-mono uppercase">Download and print instantly</span>
              </div>
            </div>
            <div className="bg-[#F0EFEC] p-4 rounded-2xl border border-[#E5E5E1] flex justify-center items-start h-[600px] overflow-auto relative">
              <div className="origin-top scale-[0.5] sm:scale-[0.45] md:scale-[0.5] lg:scale-[0.5]">
                <PlannerPreview type={selectedPlanner.slug.split('-')[0]} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5E5E1] pt-12">
            <h2 className="text-2xl font-bold mb-6">Variations & Formats</h2>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                `${selectedPlanner.title} PDF`,
                `${selectedPlanner.title} A4`,
                `${selectedPlanner.title} Free`,
                `${selectedPlanner.title} Monthly`,
              ].map((v) => (
                <li key={v} className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-[#E5E5E1] flex items-center justify-between px-6 shrink-0 z-50 no-print">
        <div className="flex items-center gap-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-3">
            <span className="font-serif italic text-2xl font-bold tracking-tight">SimplePrintouts</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setCurrentPage('home')} className={`text-sm font-medium ${currentPage === 'home' ? 'text-black' : 'text-gray-500 hover:text-black'}`}>Home</button>
            <button onClick={() => setCurrentPage('generator')} className={`text-sm font-medium ${currentPage === 'generator' ? 'text-black' : 'text-gray-500 hover:text-black'}`}>Generator</button>
            <button onClick={() => setCurrentPage('planners')} className={`text-sm font-medium ${currentPage === 'planners' || currentPage === 'planner-detail' ? 'text-black' : 'text-gray-500 hover:text-black'}`}>Planners</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-center">
            <button onClick={() => setCurrentPage('generator')} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Print It</button>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col p-8 pt-24 md:hidden no-print">
          <button onClick={() => {setCurrentPage('home'); setIsMobileMenuOpen(false)}} className="text-2xl font-bold py-4 border-b">Home</button>
          <button onClick={() => {setCurrentPage('generator'); setIsMobileMenuOpen(false)}} className="text-2xl font-bold py-4 border-b">Generator</button>
          <button onClick={() => {setCurrentPage('planners'); setIsMobileMenuOpen(false)}} className="text-2xl font-bold py-4 border-b">Planners</button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {currentPage === 'home' && renderHomepage()}
        {currentPage === 'generator' && renderGenerator()}
        {currentPage === 'planners' && renderPlanners()}
        {currentPage === 'planner-detail' && renderPlannerDetail()}
      </div>

      {/* Footer */}
      <footer className="h-12 bg-white border-t border-[#E5E5E1] flex items-center justify-between px-8 shrink-0 no-print">
        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
          © 2026 SimplePrintouts · Free Printable Paper & Planners
        </p>
        <div className="flex gap-4">
          <span className="text-[10px] text-gray-400 font-mono uppercase">SEO Optimized</span>
          <span className="text-[10px] text-gray-400 font-mono uppercase">AdSense Ready</span>
        </div>
      </footer>
    </div>
  );
}
