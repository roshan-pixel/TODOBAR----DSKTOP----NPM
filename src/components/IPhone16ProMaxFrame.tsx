import React from 'react'
import { Smartphone, Monitor } from 'lucide-react'

interface IPhone16ProMaxFrameProps {
  children: React.ReactNode
  isSimulatedFrame: boolean
  onToggleFrame: () => void
}

export const IPhone16ProMaxFrame: React.FC<IPhone16ProMaxFrameProps> = ({
  children,
  isSimulatedFrame,
  onToggleFrame,
}) => {
  if (!isSimulatedFrame) {
    return <div className="w-full h-full relative overflow-hidden bg-[#030712]">{children}</div>
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center p-4 bg-[#070913] relative overflow-hidden select-none">
      {/* Top Toggle Bar */}
      <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/12 backdrop-blur-xl z-50">
        <span className="text-xs font-semibold text-white/90">iPhone 16 Pro Max (430×932 pt)</span>
        <button
          type="button"
          onClick={onToggleFrame}
          className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 hover:bg-white/20 text-[#00F0FF] border border-white/15 flex items-center gap-1 transition-colors"
        >
          <Monitor className="w-3 h-3" /> Full View
        </button>
      </div>

      {/* Titanium iPhone 16 Pro Max Bezel Chassis */}
      <div
        className="relative w-[430px] h-[932px] rounded-[56px] p-3 shadow-[0_0_0_2px_rgba(255,255,255,0.15),0_30px_100px_rgba(0,0,0,0.9),0_0_40px_rgba(0,240,255,0.12)] border-[3px] border-[#222432] bg-[#0c0d18] overflow-hidden"
        style={{
          boxShadow:
            'inset 0 0 0 1.5px rgba(255,255,255,0.18), 0 0 0 4px #1a1c28, 0 30px 90px rgba(0,0,0,0.9)',
        }}
      >
        {/* Inner OLED Display Container */}
        <div className="w-full h-full rounded-[48px] overflow-hidden bg-[#030712] relative flex flex-col">
          {/* Status Bar */}
          <div className="absolute top-0 inset-x-0 h-11 flex items-center justify-between px-7 pt-2 text-[12px] font-mono font-semibold text-white/90 z-40 pointer-events-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Cellular */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M2 20h2v-4H2v4zm4 0h2v-8H6v8zm4 0h2V8h-2v12zm4 0h2V4h-2v16zm4 0h2V0h-2v20z" />
              </svg>
              {/* Wifi */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3c3.7 0 7.07 1.48 9.54 3.91L12 18.52 2.46 10.91C4.93 8.48 8.3 7 12 7z" />
              </svg>
              {/* Battery */}
              <div className="w-5 h-2.5 rounded-sm border border-white/80 p-0.5 flex items-center">
                <div className="h-full w-full bg-white rounded-xs" />
              </div>
            </div>
          </div>

          {/* Children Screen Content */}
          <div className="w-full h-full flex flex-col relative overflow-hidden">{children}</div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-50">
            <div className="w-36 h-1 rounded-full bg-white/40 backdrop-blur-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
