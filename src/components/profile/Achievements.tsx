import React from 'react';
import type { Achievement, Badge } from '../../types/user';

interface AchievementsProps {
  achievements: Achievement[];
  badges: Badge[];
  points: number;
}

export function Achievements({ achievements, badges, points }: AchievementsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 text-white">
        <h3 className="text-lg font-medium">Engagement Score</h3>
        <p className="text-3xl font-bold mt-2">{points} points</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white p-4 rounded-lg shadow-sm text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-3">
                <i className={`lucide lucide-${badge.icon}`} />
              </div>
              <h4 className="font-medium text-gray-900">{badge.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <i className={`lucide lucide-${achievement.icon} text-green-600`} />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                <p className="text-sm text-gray-500">{achievement.description}</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}