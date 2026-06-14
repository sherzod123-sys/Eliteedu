import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

// ─── LOADER ───────────────────────────────────────────────
export const PremiumLoader = () => (
  <div className="h-screen flex items-center justify-center bg-[#020617]">
    <div className="text-center select-none">
      <div className="relative mx-auto mb-8 w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600/30" />
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-violet-500 border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-transparent border-b-violet-400 border-l-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight mb-1">Elite<span className="text-indigo-400">LMS</span></h2>
      <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
    </div>
  </div>
);

// ─── SIDEBAR ITEM ─────────────────────────────────────────
export const SidebarItem = ({ icon, label, active, onClick, open, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 relative group ${
      active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <div className="relative shrink-0">
      <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
        {icon}
      </span>
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-black px-1 leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    {open && (
      <>
        <span className="font-semibold text-sm flex-1 text-left truncate">{label}</span>
        {badge > 0 && (
          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shrink-0">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </>
    )}
    {!open && active && (
      <span className="absolute left-full ml-3 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-slate-700 z-50">
        {label}
      </span>
    )}
  </button>
);

// ─── STAT CARD ────────────────────────────────────────────
export const StatCard = ({ icon, label, value, gradient, trend }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${gradient} text-white group hover:scale-[1.02] transition-all duration-300 cursor-default`}>
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />
    <div className="relative z-10">
      <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
        {icon}
      </div>
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-4xl font-black tracking-tight">{value}</p>
      {trend && (
        <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
          <span className="text-emerald-300">↑</span> {trend}
        </p>
      )}
    </div>
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────
export const EmptyState = ({ message, icon, action }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-16 rounded-3xl text-center">
    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
      {icon || <AlertCircle className="w-8 h-8 text-slate-600" />}
    </div>
    <p className="text-slate-400 font-semibold mb-4">{message}</p>
    {action}
  </div>
);

// ─── ONLINE BADGE ─────────────────────────────────────────
export const OnlineBadge = ({ isOnline, lastSeen, className = '' }) => {
  const getLabel = () => {
    if (isOnline) return null;
    if (!lastSeen) return 'Offline';
    const diff  = Date.now() - new Date(lastSeen).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Hozirgina';
    if (mins < 60)  return `${mins} daq oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    return `${days} kun oldin`;
  };

  if (isOnline) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 ${className}`}>
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        Online
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
      {getLabel()}
    </span>
  );
};

// ─── SPINNER ─────────────────────────────────────────────
export const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

// ─── BADGE ───────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300',
    blue:    'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    green:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    red:     'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    orange:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    purple:  'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'indigo', showLabel = true, height = 'h-2' }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    indigo: 'from-indigo-500 to-violet-500',
    green:  'from-emerald-500 to-teal-500',
    orange: 'from-amber-500 to-orange-500',
    red:    'from-rose-500 to-pink-500',
  };
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-400">Progress</span>
          <span className="text-indigo-400">{pct}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${colors[color] || colors.indigo} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── TOOLTIP ─────────────────────────────────────────────
export const Tooltip = ({ children, text, position = 'top' }) => (
  <div className="relative group/tooltip">
    {children}
    <div className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all z-50 shadow-xl border border-slate-700`}>
      {text}
    </div>
  </div>
);

// ─── AVATAR ──────────────────────────────────────────────
export const Avatar = ({ src, name, size = 'md', online, className = '' }) => {
  const sizes = { xs: 'w-7 h-7 text-[10px]', sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-2xl object-cover ring-2 ring-slate-800`}
        onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=4F46E5&color=fff&bold=true`; }}
      />
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${dotSizes[size]} rounded-full border-2 border-slate-950 ${online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      )}
    </div>
  );
};