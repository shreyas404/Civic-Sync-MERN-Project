import { Trophy, Star } from 'lucide-react';

function Header({ user }) {
  if (!user) return null;

  // Calculate points progress (example logic: next tier is multiple of 500)
  const currentPoints = user.points || 0;
  const nextTier = Math.ceil((currentPoints + 1) / 500) * 500;
  const progressPercent = (currentPoints / nextTier) * 100;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 md:ml-64 flex items-center justify-between px-6">
      {/* Mobile Brand (visible only when sidebar is hidden) */}
      <div className="md:hidden flex items-center gap-2">
        <span className="bg-purple-700 text-white p-1 rounded-md">
          <Star size={18} />
        </span>
        <span className="font-bold text-gray-900 tracking-tight">Civic-Sync</span>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:block"></div>

      {/* User Status Section */}
      <div className="flex items-center gap-4">
        
        {/* Points Progress */}
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>{currentPoints}</span>
            <span className="text-gray-300">/</span>
            <span>{nextTier} pts</span>
          </div>
          <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Points Pill */}
        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-sm shadow-sm border border-green-200">
          <Trophy size={16} className="text-green-600" />
          <span>{currentPoints} pts</span>
        </div>

        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold shadow-sm" title={user.email}>
          {user.email.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Header;