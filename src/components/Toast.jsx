import { useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-500',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      text: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      text: 'text-yellow-800'
    }
  }

  const style = styles[type] || styles.success

  return (
    <div 
      className={`fixed top-20 right-4 ${style.bg} border-l-4 rounded-lg shadow-2xl p-4 flex items-center gap-3 animate-slide-in max-w-md`}
      style={{ zIndex: 10000 }}
    >
      {style.icon}
      <p className={`${style.text} font-medium flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`${style.text} hover:opacity-70 transition-opacity`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

