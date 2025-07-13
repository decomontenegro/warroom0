import { useLucideDrawerAnimation } from '@/components/ui/lucide-icon-drawer'
import { Home, User, Settings, Search, Mail, Phone } from 'lucide-react'

function LucideIconExample() {
  const animationRef = useLucideDrawerAnimation()

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Lucide Icons with Drawer Animation
        </h1>
        
        <div ref={animationRef} className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-2">
            <Home className="w-12 h-12 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Home</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <User className="w-12 h-12 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">User</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <Settings className="w-12 h-12 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Settings</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <Search className="w-12 h-12 text-yellow-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Search</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <Mail className="w-12 h-12 text-red-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Mail</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <Phone className="w-12 h-12 text-cyan-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            About this component
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The lucide-icon-drawer adds an animated "drawing" effect to Lucide icons. 
            The icons above will animate their paths in a continuous loop, creating 
            an eye-catching visual effect perfect for loading states or feature highlights.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LucideIconExample