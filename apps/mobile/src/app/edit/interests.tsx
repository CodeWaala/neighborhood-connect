import { replaceInterests } from '@neighborhood-connect/api-client';
import { router } from 'expo-router';
import { useState } from 'react';

import { EditHint, EditScaffold } from '@/components/EditScaffold';
import { Loading } from '@/components/Loading';
import { InterestPicker } from '@/components/pickers/InterestPicker';
import { useMyProfile } from '@/hooks/useMyProfile';
import { saveErrorMessage, useSaveProfile } from '@/hooks/useSaveProfile';

export default function EditInterestsScreen() {
  const me = useMyProfile();
  if (!me.data) return <Loading />;
  return <InterestsEditor initialIds={me.data.interests.map((i) => i.id)} />;
}

function InterestsEditor({ initialIds }: { initialIds: string[] }) {
  const [ids, setIds] = useState(initialIds);
  const save = useSaveProfile(replaceInterests);
  const changed = ids.length !== initialIds.length || ids.some((id) => !initialIds.includes(id));

  return (
    <EditScaffold
      title="Interests"
      onCancel={() => router.back()}
      onSave={() => save.mutate(ids)}
      canSave={changed && ids.length > 0}
      saving={save.isPending}
      error={saveErrorMessage(save.error)}
    >
      <EditHint>We match you with neighbors who share at least one of these.</EditHint>
      <InterestPicker layout="list" selectedIds={ids} onChange={setIds} />
      <EditHint>
        {ids.length === 0 ? 'Select at least one interest to keep getting matches.' : `${ids.length} selected`}
      </EditHint>
    </EditScaffold>
  );
}
