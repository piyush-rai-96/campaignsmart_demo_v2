import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Palette, Users, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import impactLogo from '@/assets/impact_analytics_logo.jpeg'

// Only working navigation items
const navItems = [
  { to: '/campaigns', icon: LayoutDashboard, label: 'Campaign Workspace' },
  { to: '/creative-studio', icon: Palette, label: 'Creative Studio' },
  { to: '/segments', icon: Users, label: 'Segment Library' },
  { to: '/promos', icon: Tag, label: 'Promotion Library' },
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 250 : 60 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="bg-[#1e2433] h-screen flex flex-col py-4 flex-shrink-0 relative group/sidebar"
    >
      {/* Expand/Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'absolute -right-3 top-16 z-50 w-6 h-6 rounded-full bg-[#1e2433] border border-white/20 shadow-lg',
          'flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a3142]',
          'transition-all duration-200 opacity-0 group-hover/sidebar:opacity-100'
        )}
      >
        {isExpanded ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Impact Analytics Logo & Title */}
      <div className={cn(
        'flex items-center gap-3 mb-6 transition-all duration-200',
        isExpanded ? 'px-4' : 'px-2.5 justify-center'
      )}>
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={impactLogo} 
            alt="Impact Analytics" 
            className="w-full h-full object-cover"
          />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-white font-semibold text-sm">Campaign Smart</p>
              <p className="text-gray-500 text-[10px]">by Impact Analytics</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Icons */}
      <nav className={cn(
        'flex-1 flex flex-col gap-1 w-full',
        isExpanded ? 'px-3' : 'px-2'
      )}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-lg flex items-center transition-all duration-200 relative group',
                isExpanded ? 'px-3 py-2.5 gap-3' : 'w-10 h-10 justify-center mx-auto',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Tooltip - only show when collapsed */}
            {!isExpanded && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1e2433] text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section - User */}
      <div className={cn(
        'mt-auto pt-4 border-t border-white/10',
        isExpanded ? 'px-3' : 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-white/5',
          isExpanded ? 'px-3 py-2' : 'justify-center py-2'
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            JD
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-white text-sm font-medium">John Doe</p>
                <p className="text-gray-500 text-[10px]">Marketing Team</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
