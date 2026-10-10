# Phase 4: Wire Connections & Messaging ✅

## Goal

Build a Connections list page showing pending/accepted connections. Wire the messaging page to real API data for fetching and sending messages. Gate messaging behind accepted connections.

## Prerequisites

- Phase 3 complete (users can send connection requests)

---

## Tasks

### 4.1 Create Connections List Page ✅

**File:** `apps/web/src/pages/Connections.tsx` (new)

Build a new page showing the user's connections:

**Sections:**
1. **Pending Requests** — Connections where `status === 'pending'` and the current user is the `recipientId`
   - Show requester's name, profile snippet
   - "Accept" and "Decline" buttons
2. **Sent Requests** — Connections where `status === 'pending'` and the current user is the `requesterId`
   - Show "Waiting for response" status
3. **Active Connections** — Connections where `status === 'accepted'`
   - Show the other user's name
   - "Message" button → navigate to `/messages/:connectionId`

**Data fetching:**
```typescript
const { data: connections } = useQuery({
  queryKey: ['connections'],
  queryFn: () => connectionsApi.listConnections(),
});
```

**Note:** The current `GET /v1/connections` returns raw connection records without profile data. This needs an API enhancement (see below).

**UI design:**
- Match the existing app aesthetic (rounded-2xl cards, primary-soft accents)
- Show avatar initial circles like Discovery/Messages pages
- Empty state: "No connections yet. Discover neighbors to start connecting!"

---

### 4.2 Accept / Decline UI ✅

**File:** `apps/web/src/pages/Connections.tsx`

Wire accept/decline buttons:

```typescript
const updateMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'declined' }) =>
    connectionsApi.updateConnection(id, status),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
});
```

**Accept:** Sets status to `accepted`, moves card to "Active Connections"
**Decline:** Sets status to `declined`, removes card from list

Add confirmation dialog for decline (using existing `AlertDialog` component).

---

### 4.3 Messages: Fetch Real Messages ✅

**File:** `apps/web/src/pages/Messages.tsx`

Replace hardcoded `initialMessages` and `contactsData`:

```typescript
const { connectionId } = useParams<{ connectionId: string }>();
const { data: messages, isLoading } = useQuery({
  queryKey: ['messages', connectionId],
  queryFn: () => messagesApi.listMessages(connectionId!),
  refetchInterval: 5000, // Poll every 5 seconds for new messages
  enabled: !!connectionId,
});
```

**Key changes:**
- Change route from `/messages/:contactId` to `/messages/:connectionId`
- Remove hardcoded `contactsData` and `initialMessages`
- Fetch the connection details to get the other user's profile (name, context)
- Map message `senderId` to "me" vs "them" using the auth context `userId`
- Auto-scroll to bottom when new messages arrive

**URL update in App.tsx:**
```typescript
<Route path="/messages/:connectionId" element={<Messages />} />
```

---

### 4.4 Messages: Send Real Messages ✅

**File:** `apps/web/src/pages/Messages.tsx`

Wire the send button:

```typescript
const sendMutation = useMutation({
  mutationFn: (body: string) => messagesApi.sendMessage(connectionId!, body),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['messages', connectionId] });
    setNewMessage('');
  },
});
```

**Key changes:**
- Replace `handleSend` local state push with mutation call
- Optimistic update: add message to local list immediately, rollback on error
- Disable send button while mutation is in flight

---

### 4.5 Update Routing & Navigation ✅

**File:** `apps/web/src/App.tsx`

Add the connections route:
```typescript
<Route path="/connections" element={<Connections />} />
```

Update navigation links throughout the app:
- Messages header "Back" goes to `/connections` instead of `/discovery`
- Discovery could have a link to connections
- Prepare for bottom nav (Phase 6)

---

## API Enhancements Required

### Enhance `GET /v1/connections` Response ✅

**File:** `apps/api/src/connections/connections.service.ts`

The current `listConnections` returns raw connection records. Enhance to include profile data:

```typescript
async listConnections(userId: string) {
  return this.prisma.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    orderBy: { requestedAt: 'desc' },
    include: {
      requester: {
        select: {
          id: true,
          profile: {
            select: { displayName: true, bio: true, role: true, avatarUrl: true },
          },
        },
      },
      recipient: {
        select: {
          id: true,
          profile: {
            select: { displayName: true, bio: true, role: true, avatarUrl: true },
          },
        },
      },
    },
  });
}
```

### Add connection detail endpoint (or merge into messages) ✅

For the Messages page header, we need the other user's profile info. Options:
- **Option A:** Fetch connection details via `GET /v1/connections/:id` (new endpoint)
- **Option B:** Include connection details in the messages response
- **Recommended: Option A** — add a `getConnection(id)` method to the service and controller

---

## Verification Checklist

- [x] Connections page shows pending requests received
- [x] Connections page shows sent requests waiting for response
- [x] Connections page shows accepted connections
- [x] Accept button changes status to "accepted" in database
- [x] Decline button changes status to "declined" in database
- [x] Accepted connections show a "Message" button
- [x] Messages page loads real messages for a connection
- [x] Sending a message creates it in the database
- [x] New messages appear without page reload (polling)
- [x] Messages show correct sender ("me" vs "them")
- [x] Messaging is blocked for non-accepted connections (API returns 400)
- [x] Route `/messages/:connectionId` works correctly
- [x] Back navigation from messages goes to connections
