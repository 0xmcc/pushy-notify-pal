export function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/iOSPWA5.mp4" type="video/mp4" />
      </video>
    </div>
  )
} 