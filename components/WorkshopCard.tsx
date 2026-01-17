
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
  badge, title, price, details, description, footerLeft, footerRight, accentColor = "#D4AF37" 
}) => {
  return (
    <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[30px] relative overflow-hidden text-left shadow-2xl transition-all active-press mb-4 group stagger-item">
      {/* Decorative Accent to fix potential transparent gaps */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/[0.03]"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex flex-col max-w-[70%]">
          {badge && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[7.5px] font-black uppercase tracking-[0.3em] italic text-[#FFF5D1] bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                {badge}
              </span>
            </div>
          )}
          <h3 className="text-2xl font-black text-white uppercase italic leading-[1.05] tracking-tighter group-hover:text-[#D4AF37] transition-all">{title}</h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          {price && <span className="text-2xl font-black italic tracking-tighter leading-none gold-text drop-shadow-md">{price}</span>}
          {details && <span className="text-[7.5px] text-zinc-600 font-black uppercase tracking-widest mt-3 italic leading-none mono opacity-60">{details}</span>}
        </div>
      </div>
      
      {/* Content */}
      {description && (
        <div className="relative mb-5 z-10 bg-black/40 p-5 rounded-[20px] border border-white/5 shadow-inner">
          <p className="text-zinc-400 text-[12px] font-medium leading-relaxed italic opacity-90">
            {description}
          </p>
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-white/5 gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          {footerLeft}
        </div>
        <div className="flex-none flex items-center gap-3">
          {footerRight}
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
