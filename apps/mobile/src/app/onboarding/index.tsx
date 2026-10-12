import { searchNeighborhoods, type Neighborhood } from '@neighborhood-connect/api-client';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Check, MapPin, Search, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { neighborhoodDetail } from '@/onboarding/format';
import { useOnboarding } from '@/onboarding/OnboardingContext';
import { OnboardingScaffold } from '@/onboarding/OnboardingScaffold';
import { fonts, radius, spacing, textStyles, useTheme } from '@/theme';

const MIN_QUERY_LENGTH = 2;

/** Step 1: first name and neighborhood. */
export default function NameAndNeighborhoodStep() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { displayName, neighborhood, update } = useOnboarding();

  const [query, setQuery] = useState(neighborhood?.name ?? '');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  // Search only while the text differs from the chosen neighborhood
  const searching = debouncedQuery.length >= MIN_QUERY_LENGTH && debouncedQuery !== neighborhood?.name;
  const { data: results, isFetching, isError } = useQuery({
    queryKey: ['neighborhoods', 'search', debouncedQuery],
    queryFn: () => searchNeighborhoods(debouncedQuery),
    enabled: searching,
    staleTime: 5 * 60_000,
  });

  function handleQueryChange(text: string) {
    setQuery(text);
    if (neighborhood && text !== neighborhood.name) {
      update({ neighborhood: null });
    }
  }

  function handleSelect(n: Neighborhood) {
    update({ neighborhood: n });
    setQuery(n.name);
  }

  const canContinue = displayName.trim().length > 0 && neighborhood !== null;

  return (
    <OnboardingScaffold
      step={1}
      title="Let’s get you set up"
      subtitle="We’ll use your name and neighborhood to connect you with parents and pet owners nearby."
      // Nothing is saved yet, so going back signs out of the new account and returns to Welcome
      onBack={() => void signOut()}
      backLabel="Back to welcome"
      footer={<Button label="Continue" disabled={!canContinue} onPress={() => router.push('/onboarding/role')} />}
    >
      <TextField
        label="Your first name"
        value={displayName}
        onChangeText={(text) => update({ displayName: text })}
        placeholder="e.g. Sarah"
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        maxLength={50}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.foreground }]}>Your neighborhood</Text>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: searchFocused ? colors.primary : colors.border },
            searchFocused && styles.searchBoxFocused,
          ]}
        >
          <Search size={20} color={colors.mutedForeground} strokeWidth={2} />
          <TextInput
            accessibilityLabel="Your neighborhood"
            value={query}
            onChangeText={handleQueryChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by ZIP or neighborhood name"
            placeholderTextColor={colors.placeholder}
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {isFetching && <ActivityIndicator size="small" color={colors.mutedForeground} />}
        </View>

        {neighborhood && (
          <NeighborhoodRow neighborhood={neighborhood} selected />
        )}

        {searching && !isFetching && (isError || results?.length === 0) && (
          <Text style={[textStyles.label, { color: colors.mutedForeground }]}>
            {isError ? 'Couldn’t search right now. Check your connection.' : 'No neighborhoods match that search.'}
          </Text>
        )}

        {searching && results && results.length > 0 && (
          <View style={[styles.results, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {results.slice(0, 5).map((n, i) => (
              <NeighborhoodRow key={n.id} neighborhood={n} divider={i > 0} onPress={() => handleSelect(n)} />
            ))}
          </View>
        )}
      </View>

      <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ShieldCheck size={20} color={colors.primary} strokeWidth={2} />
        <Text style={[textStyles.label, styles.noteText, { color: colors.mutedForeground }]}>
          Your exact address is never shown. Neighbors only see your general area.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}

interface NeighborhoodRowProps {
  neighborhood: Neighborhood;
  /** Result rows are tappable; the chosen neighborhood (no `onPress`) is shown on its own. */
  onPress?: () => void;
  selected?: boolean;
  divider?: boolean;
}

function NeighborhoodRow({ neighborhood, onPress, selected = false, divider = false }: NeighborhoodRowProps) {
  const { colors } = useTheme();
  const detail = neighborhoodDetail(neighborhood);
  const label = [neighborhood.name, detail].filter(Boolean).join(', ');

  const content = (
    <>
      <MapPin size={20} color={selected ? colors.primary : colors.mutedForeground} strokeWidth={2} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>{neighborhood.name}</Text>
        {detail.length > 0 && (
          <Text style={[textStyles.label, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>{detail}</Text>
        )}
      </View>
      {selected && <Check size={20} color={colors.primary} strokeWidth={2.5} />}
    </>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={`Selected: ${label}`}
        style={[styles.row, styles.selected, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.primarySoft },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  searchBox: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBoxFocused: {
    borderWidth: 2,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 17,
    // The box border shows focus; drop the browser outline in the web preview
    outlineWidth: 0,
  },
  results: {
    borderRadius: radius.button,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selected: {
    borderRadius: radius.button,
    borderWidth: 1.5,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
});
