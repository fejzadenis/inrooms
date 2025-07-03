import React, { useEffect, useRef } from 'react';

interface ParallaxEffectProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function ParallaxEffect({ 
  children, 
  speed = 0.1, 
  direction = 'up',
  className = ''
}: ParallaxEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    let startPosition = 0;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!element) return;
          
          const scrollPosition = window.scrollY;
          const elementPosition = element.getBoundingClientRect().top + scrollPosition;
          const viewportHeight = window.innerHeight;
          
          // Only apply parallax when element is in viewport
          if (
            elementPosition < scrollPosition + viewportHeight &&
            elementPosition + element.offsetHeight > scrollPosition
          ) {
            const relativePosition = scrollPosition - elementPosition;
            let transform = '';
            
            switch (direction) {
              case 'up':
                transform = `translateY(${-relativePosition * speed}px)`;
                break;
              case 'down':
                transform = `translateY(${relativePosition * speed}px)`;
                break;
              case 'left':
                transform = `translateX(${-relativePosition * speed}px)`;
                break;
              case 'right':
                transform = `translateX(${relativePosition * speed}px)`;
                break;
            }
            
            element.style.transform = transform;
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction]);
  
  return (
    <div ref={ref} className={`parallax ${className}`}>
      {children}
    </div>
  );
}