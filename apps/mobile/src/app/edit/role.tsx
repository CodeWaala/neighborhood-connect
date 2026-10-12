import { updateProfile, type ProfileRole } from '@neighborhood-connect/api-client';
import { router } from 'expo-router';
import { useState } from 'react';

import { EditHint, EditScaffold } from '@/components/EditScaffold';
import { Loading } from '@/components/Loading';
import { RolePicker } from '@/components/pickers/RolePicker';
import { useMyProfile } from '@/hooks/useMyProfile';
import { saveErrorMessage, useSaveProfile } from '@/hooks/useSaveProfile';

export default function EditRoleScreen() {
  const me = useMyProfile();
  if (!me.data) return <Loading />;
  return <RoleEditor initialRole={me.data.profile.role} />;
}

function RoleEditor({ initialRole }: { initialRole: ProfileRole }) {
  const [role, setRole] = useState<ProfileRole>(initialRole);
  const save = useSaveProfile((next: ProfileRole) => updateProfile({ role: next }));

  return (
    <EditScaffold
      title="I am a..."
      onCancel={() => router.back()}
      onSave={() => save.mutate(role)}
      canSave={role !== initialRole}
      saving={save.isPending}
      error={saveErrorMessage(save.error)}
    >
      <EditHint>This helps us match you with neighbors in a similar stage of life.</EditHint>
      <RolePicker value={role} onChange={setRole} />
    </EditScaffold>
  );
}
