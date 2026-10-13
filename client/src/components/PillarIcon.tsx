import React from 'react';
import { Brain, Briefcase, Heart, Leaf, Activity, Sparkles } from 'lucide-react';

interface PillarIconProps {
  pillarId: string;
  className?: string;
}

export const PillarIcon: React.FC<PillarIconProps> = ({ pillarId, className = 'w-5 h-5' }) => {
  switch (pillarId.toLowerCase()) {
    case 'soul':
      // Lotus / Flower representation
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-1.5 3-3 6.5-3 10a3 3 0 0 0 6 0c0-3.5-1.5-7-3-10z" />
          <path d="M5.5 13C7 11 9 10 11 10c0 4-2 7-5.5 7a3 3 0 0 1 0-4z" />
          <path d="M18.5 13C17 11 15 10 13 10c0 4 2 7 5.5 7a3 3 0 0 0 0-4z" />
          <path d="M7 17.5c2 1.5 5 1.5 10 0" />
        </svg>
      );
    case 'mind':
      return <Brain className={className} />;
    case 'body':
      return <Activity className={className} />;
    case 'career':
      return <Briefcase className={className} />;
    case 'environment':
      return <Leaf className={className} />;
    case 'contribution':
      return <Heart className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
