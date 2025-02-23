import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { getInitials } from '../../lib/utils';
import { userSupabase } from '../../lib/supabase';
import clsx from 'clsx';

interface UserAvatarProps {
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

interface UserPresence {
  lastActive: Date;
  isOnline: boolean;
  isIdle: boolean;
}

export function UserAvatar({ user, size = 'md', showStatus = true }: UserAvatarProps) {
  const [presence, setPresence] = useState<UserPresence>({
    lastActive: new Date(),
    isOnline: false,
    isIdle: false
  });

  const avatarSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const statusSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  };

  useEffect(() => {
    let lastActivityTimeout: NodeJS.Timeout;
    let idleTimeout: NodeJS.Timeout;
    let presenceInterval: NodeJS.Timeout;

    // Subscribe to presence channel
    const channel = userSupabase.channel(`presence:${user.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userPresence = state[user.id];
        
        if (userPresence?.[0]) {
          const lastSeen = new Date(userPresence[0].last_seen_at);
          setPresence({
            lastActive: lastSeen,
            isOnline: true,
            isIdle: false
          });
        }
      })
      .subscribe();

    // Track user activity
    const trackActivity = () => {
      // Clear existing timeouts
      clearTimeout(lastActivityTimeout);
      clearTimeout(idleTimeout);
      
      // Update presence state to online
      setPresence(prev => ({
        ...prev,
        isOnline: true,
        isIdle: false
      }));

      // Track presence in Supabase
      channel.track({
        user_id: user.id,
        last_seen_at: new Date().toISOString(),
        status: 'online'
      });

      // Set idle timeout (30 minutes)
      idleTimeout = setTimeout(() => {
        setPresence(prev => ({
          ...prev,
          isOnline: true,
          isIdle: true
        }));
        
        channel.track({
          user_id: user.id,
          last_seen_at: new Date().toISOString(),
          status: 'idle'
        });
      }, 30 * 60 * 1000);

      // Set offline timeout (1 hour)
      lastActivityTimeout = setTimeout(() => {
        setPresence(prev => ({
          ...prev,
          isOnline: false,
          isIdle: false
        }));
        
        channel.track({
          user_id: user.id,
          last_seen_at: new Date().toISOString(),
          status: 'offline'
        });
      }, 60 * 60 * 1000);
    };

    // Update presence every minute
    presenceInterval = setInterval(trackActivity, 60 * 1000);

    // Track initial activity
    trackActivity();

    // Add activity listeners
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity);
    });

    // Cleanup
    return () => {
      clearTimeout(lastActivityTimeout);
      clearTimeout(idleTimeout);
      clearInterval(presenceInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      userSupabase.removeChannel(channel);
    };
  }, [user.id]);

  const getStatusColor = () => {
    if (presence.isOnline && !presence.isIdle) {
      return 'bg-emerald-500'; // Online - green
    } else if (presence.isIdle) {
      return 'bg-blue-500'; // Idle - blue
    }
    return 'bg-gray-400'; // Offline - gray
  };

  const getStatusText = () => {
    if (presence.isOnline && !presence.isIdle) {
      return 'Online';
    } else if (presence.isIdle) {
      return 'Idle';
    }
    return 'Offline';
  };

  return (
    <div className="relative">
      <Avatar className={clsx("bg-violet-100", avatarSizes[size])}>
        <AvatarImage 
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`} 
          alt={user.full_name}
        />
        <AvatarFallback className="bg-violet-100 text-violet-600 font-medium">
          {getInitials(user.full_name)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span 
          className={clsx(
            "absolute bottom-0 right-0",
            statusSizes[size],
            "rounded-full ring-2 ring-white transition-colors duration-300",
            getStatusColor()
          )}
        >
          <span className="sr-only">{getStatusText()}</span>
        </span>
      )}
    </div>
  );
}