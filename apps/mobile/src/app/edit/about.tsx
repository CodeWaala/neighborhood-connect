import { updateProfile, type Profile } from '@neighborhood-connect/api-client';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { EditScaffold } from '@/components/EditScaffold';
import { Loading } from '@/components/Loading';
import { TextField } from '@/components/TextField';
import { useMyProfile } from '@/hooks/useMyProfile';
import { saveErrorMessage, useSaveProfile } from '@/hooks/useSaveProfile';
import { fonts, radius, spacing, textStyles, useTheme } from '@/theme';

const BIO_MAX = 300;

export default function EditAboutScreen() {
  const me = useMyProfile();
  if (!me.data) return <Loading />;
  return <AboutEditor profile={me.data.profile} />;
}

function AboutEditor({ profile }: { profile: Profile }) {
  const { colors } = useTheme();
  const initialAge = profile.children?.[0]?.ageRange ?? '';
  const initialBio = profile.bio ?? '';
  const [age, setAge] = useState(initialAge);
  const [bio, setBio] = useState(initialBio);
  const [bioFocused, setBioFocused] = useState(false);
  const save = useSaveProfile(updateProfile);

  // Child age only applies to parents
  const showAge = profile.role === 'parent' || profile.role === 'both';
  const changed = bio.trim() !== initialBio.trim() || (showAge && age.trim() !== initialAge.trim());

  function handleSave() {
    save.mutate({
      bio: bio.trim(),
      ...(showAge ? { childAgeRange: age.trim() } : {}),
    });
  }

  return (
    <EditScaffold
      title="About me"
      onCancel={() => router.back()}
      onSave={handleSave}
      canSave={changed}
      saving={save.isPending}
      error={saveErrorMessage(save.error)}
    >
      <View style={styles.fields}>
        {showAge && (
          <View style={styles.field}>
            <TextField
              label="Your child’s age"
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 2-3 years"
              maxLength={40}
            />
            <Text style={[styles.help, { color: colors.mutedForeground }]}>Shown as an age range only.</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Short bio</Text>
          <TextInput
            accessibilityLabel="Short bio"
            value={bio}
            onChangeText={setBio}
            onFocus={() => setBioFocused(true)}
            onBlur={() => setBioFocused(false)}
            placeholder="Tell neighbors a bit about yourself..."
            placeholderTextColor={colors.placeholder}
            multiline
            maxLength={BIO_MAX}
            textAlignVertical="top"
            style={[
              styles.bio,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: bioFocused ? colors.primary : colors.border,
                borderWidth: bioFocused ? 2 : 1.5,
              },
            ]}
          />
          <Text accessibilityLiveRegion="polite" style={[styles.help, styles.count, { color: colors.mutedForeground }]}>
            {bio.length}/{BIO_MAX} characters
          </Text>
        </View>

        <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ShieldCheck size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[textStyles.label, styles.noteText, { color: colors.mutedForeground }]}>
            Your privacy matters. Skip your last name, address and kids’ names.
          </Text>
        </View>
      </View>
    </EditScaffold>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 22,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  help: {
    marginHorizontal: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  count: {
    alignSelf: 'flex-end',
    fontFamily: fonts.semibold,
  },
  bio: {
    height: 168,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 25,
    outlineWidth: 0,
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
