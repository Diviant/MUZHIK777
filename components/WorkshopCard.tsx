
import React from 'react';

interface WorkshopCardProps {
  badge?: string;
  title: string;
  price?: string;
  details?: string;
  description?: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  accentColor?: string;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ 
  badge, title, price, details, description, footerLeft, footerRight, accentColor = "#F5C518" 
}) => {
  return (
    <div className="bg-[#121212] card-border p-6 rounded-[28px] relative overflow-hidden text-left border border-white/5 shadow-xl transition-all active:scale-[0.99] mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          {badge && (
            <span className="text-[7px] font-black uppercase italic tracking-widest mb-1 opacity-80" style={{ color: accentColor }}>
              {badge}
            </span>
          )}
          <h3 className="text-lg font-black text-white uppercase italic leading-none tracking-tighter">{title}</h3>
        </div>
        {price && <span className="text-sm font-black italic" style={{ color: accentColor }}>{price}</span>}
      </div>
      
      {details && <p className="text-zinc-500 text-[9px] font-black uppercase mb-4">{details}</p>}
      
      {description && (
        <p className="text-zinc-400 text-[11px] font-medium leading-relaxed mb-6 border-l-2 pl-4 line-clamp-2 italic" style={{ borderColor: `${accentColor}33` }}>
          "{description}"
        </p>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-3">
        {footerLeft}
        {footerRight}
      </div>
    </div>
  );
};

export default WorkshopCard;
