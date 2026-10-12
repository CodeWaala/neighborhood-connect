import { useRouter } from 'expo-router';
import { MapPin, Shield } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Screen } from '@/components/Screen';
import { searchNeighborhoods } from '@/lib/neighborhoods-api';
import { useThemeColors } from '@/lib/theme-colors';
import { useOnboarding } from '@/onboarding/OnboardingContext';
import type { Neighborhood } from '@neighborhood-connect/types';

export default function OnboardingStart() {
  const router = useRouter();
  const colors = useThemeColors();
  const { neighborhoodId, neighborhoodName, displayName, setNeighborhood, setDisplayName } = useOnboarding();

  const [query, setQuery] = useState(neighborhoodName ?? '');
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2 || (query === neighborhoodName && neighborhoodId)) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        setResults(await searchNeighborhoods(query));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, neighborhoodId, neighborhoodName]);

  function handleSelect(n: Neighborhood) {
    const label = `${n.name}, ${n.city}`;
    setNeighborhood(n.id, label);
    setQuery(label);
    setResults([]);
  }

  const canContinue = !!neighborhoodId && displayName.trim().length > 0;

  return (
    <Screen>
      <OnboardingProgress step={1} />
      <ScrollView contentContainerClassName="flex-1 justify-center gap-6 p-6" keyboardShouldPersistTaps="handled">
        <View className="h-16 w-16 self-center items-center justify-center rounded-full bg-primary-soft">
          <MapPin size={28} color={colors.primary} />
        </View>

        <View className="gap-2">
          <Text className="text-center font-sans text-2xl font-bold text-foreground">
            Let&rsquo;s get you set up
          </Text>
          <Text className="text-center font-sans text-base text-muted-foreground">
            We&rsquo;ll use your name and neighborhood to connect you with parents and pet owners
            nearby.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="font-sans text-sm font-medium text-foreground">Your first name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. Sarah"
            placeholderTextColor={colors.placeholder}
            className="rounded-xl border border-border bg-card px-4 py-3 font-sans text-base text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="font-sans text-sm font-medium text-foreground">Your neighborhood</Text>
          <View className="flex-row items-center">
            <TextInput
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                if (neighborhoodId && text !== neighborhoodName) setNeighborhood('', '');
              }}
              placeholder="Search by ZIP or neighborhood name"
              placeholderTextColor={colors.placeholder}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-sans text-base text-foreground"
            />
            {isSearching && <ActivityIndicator className="absolute right-3" />}
          </View>

          {results.length > 0 && (
            <View className="overflow-hidden rounded-xl border border-border bg-card">
              {results.map((n, i) => (
                <Pressable
                  key={n.id}
                  onPress={() => handleSelect(n)}
                  className={`px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <Text className="font-sans font-medium text-foreground">{n.name}</Text>
                  <Text className="font-sans text-sm text-muted-foreground">
                    {[n.city, n.region, n.postalCode].filter(Boolean).join(', ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {neighborhoodId && (
            <Text className="flex-row items-center font-sans text-xs text-primary">
              <MapPin size={12} color={colors.primary} /> {neighborhoodName}
            </Text>
          )}
        </View>

        <View className="flex-row items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Shield size={20} color={colors.primary} />
          <Text className="flex-1 font-sans text-sm text-muted-foreground">
            Your exact address is never shown. Neighbors only see your general area.
          </Text>
        </View>

        <Button
          label="Continue"
          onPress={() => router.push('/onboarding/role')}
          disabled={!canContinue}
        />
      </ScrollView>
    </Screen>
  );
}
