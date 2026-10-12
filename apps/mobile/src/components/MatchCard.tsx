import { Baby, Clock, Coffee, Dog, MessageCircle, Sparkles, Trees } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import type { DiscoveryMatch } from '@/lib/discovery-api';
import { useThemeColors } from '@/lib/theme-colors';

function interestIcon(label: string, color: string): ReactNode {
  const props = { size: 14, color };
  switch (label) {
    case 'Stroller walks':
      return <Baby {...props} />;
    case 'Coffee outings':
      return <Coffee {...props} />;
    case 'Park visits':
      return <Trees {...props} />;
    case 'Dog walks':
      return <Dog {...props} />;
    case 'Casual chats':
      return <MessageCircle {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

function roleLabel(role: string) {
  if (role === 'pet') return 'Pet parent';
  if (role === 'both') return 'Parent & pet parent';
  return 'Parent';
}

/** Summarize availability entries into a short human-readable string. */
export function formatAvailability(availability: DiscoveryMatch['availability']): string {
  if (availability.length === 0) return 'Not specified';

  const windowLabels = [...new Set(availability.map((a) => a.availabilityWindow.label))];
  const dayCodes = [...new Set(availability.map((a) => a.dayOfWeek))];

  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const weekend = ['sat', 'sun'];
  const isAllWeekdays = weekdays.every((d) => dayCodes.includes(d));
  const isAllWeekend = weekend.every((d) => dayCodes.includes(d));

  let dayLabel: string;
  if (isAllWeekdays && isAllWeekend) dayLabel = 'every day';
  else if (isAllWeekdays) dayLabel = 'on weekdays';
  else if (isAllWeekend) dayLabel = 'on weekends';
  else dayLabel = `${dayCodes.length} days/week`;

  return `${windowLabels.join(' & ')} ${dayLabel}`;
}

export function MatchCard({
  match,
  onConnect,
  onViewProfile,
  isConnecting,
}: {
  match: DiscoveryMatch;
  onConnect: () => void;
  onViewProfile: () => void;
  isConnecting: boolean;
}) {
  const colors = useThemeColors();
  const displayName = match.profile?.displayName ?? 'Neighbor';
  const role = match.profile?.role ?? 'parent';
  const interests = match.interests.map((i) => i.interest.label);

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-5">
      <View className="flex-row items-center gap-3">
        <Avatar name={displayName} size={48} />
        <View>
          <Text className="font-sans font-semibold text-foreground">{displayName}</Text>
          <Text className="font-sans text-sm text-muted-foreground">{roleLabel(role)}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {interests.map((interest) => (
          <View key={interest} className="flex-row items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1">
            {interestIcon(interest, colors.primary)}
            <Text className="font-sans text-xs font-medium text-primary">{interest}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center gap-1.5">
        <Clock size={16} color={colors.mutedForeground} />
        <Text className="font-sans text-sm text-muted-foreground">{formatAvailability(match.availability)}</Text>
      </View>

      <View className="flex-row gap-3">
        <Button label="Connect" size="sm" className="flex-1" loading={isConnecting} onPress={onConnect} />
        <Button label="View Profile" variant="outline" size="sm" className="flex-1" onPress={onViewProfile} />
      </View>
    </View>
  );
}
