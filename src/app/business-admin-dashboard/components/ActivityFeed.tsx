import React from 'react';
import { ShoppingCart, Truck, Package, User, AlertTriangle, LucideIcon } from 'lucide-react';

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  message: string;
  time: string;
}

export default function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.length === 0 ? (
          <p className="px-4 sm:px-5 py-8 text-center text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-4 sm:px-5 py-3.5 flex items-start gap-3 hover:bg-muted/30 transition-colors duration-150">
              <div className={`w-8 h-8 rounded-lg ${activity.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <activity.icon size={15} className={activity.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}