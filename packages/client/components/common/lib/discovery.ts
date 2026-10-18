export type ListingType = "server" | "bot";

export type Listing = {
  id: string;
  type: ListingType;
  targetId: string;
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  iconUrl: string | null;
  bannerUrl: string | null;
  inviteCode: string | null;
  memberCount: number | null;
  ownerId: string;
  ownerName: string;
  featured: boolean;
  status: "approved" | "hidden";
  hiddenReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Target = { id: string; name: string; iconUrl: string | null };

export type ListingsPage = {
  items: Listing[];
  total: number;
  page: number;
  per: number;
};

export type ListingQuery = {
  type: ListingType;
  q?: string;
  category?: string;
  sort?: "members" | "new" | "name";
  page?: number;
  per?: number;
};

export type ListingInput = {
  type?: ListingType;
  targetId?: string;
  description: string;
  categories: string[];
  tags: string[];
  inviteCode?: string;
};

export type AdminUser = {
  id: string;
  username: string;
  discriminator: string;
  displayName: string | null;
  avatarId: string | null;
  badges: number;
  flags: number;
  privileged: boolean;
  bot: boolean;
  flagState: { suspended: boolean; deleted: boolean; banned: boolean };
};

export type AdminServerBrief = { id: string; name: string; owner: string };

export type AdminAuditRow = {
  id: string;
  at: number;
  adminId: string;
  adminName: string;
  action: string;
  targetType: "user" | "server" | "message" | "report" | "listing";
  targetId: string;
  reason: string;
  before: unknown;
  after: unknown;
  ip: string;
  failed?: boolean;
};

export type AdminUserDetail = {
  user: AdminUser;
  account: { email: string; disabled: boolean };
  sessions: { id: string; name: string; lastSeen: unknown }[];
  servers: AdminServerBrief[];
  ownedServers: AdminServerBrief[];
  suspensions: {
    kind: "suspend" | "ban";
    until: number | null;
    at: number;
    adminId: string;
  }[];
  audit: AdminAuditRow[];
};

export type AdminServerDetail = {
  server: {
    id: string;
    name: string;
    owner: string;
    flags: number;
    official: boolean;
    verified: boolean;
    memberCount: number;
    channels: string[];
    roles: { id: string; name: string; rank: number; colour: string | null }[];
  };
  owner: AdminUser | null;
  listing: {
    id: string;
    status: string;
    featured: boolean;
    name: string;
  } | null;
  audit: AdminAuditRow[];
};

export type AdminMessage = {
  id: string;
  channel: string;
  author: string;
  content: string | null;
  attachmentCount: number;
};

export type AdminMessageDetail = {
  message: AdminMessage;
  channel: { id: string; server: string | null; name: string | null } | null;
  server: { id: string; name: string } | null;
  author: AdminUser | null;
  context: AdminMessage[];
  authors: AdminUser[];
};

export type AdminReportStatus = "Created" | "Resolved" | "Rejected";

export type AdminReport = {
  id: string;
  authorId: string;
  content: {
    type: "Message" | "Server" | "User";
    id: string;
    reportReason: string;
    messageId: string | null;
  };
  additionalContext: string | null;
  status: AdminReportStatus;
  rejectionReason: string | null;
  closedAt: number | null;
  notes: string | null;
  author: { id: string; username: string; displayName: string | null } | null;
  target: {
    message?: Omit<AdminMessageDetail, "context"> | null;
    server?: { id: string; name: string } | null;
    user?: { id: string; username: string; displayName: string | null } | null;
  };
};

export type AdminWrite = { reason: string; confirm: string };

export class DiscoveryError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly unavailable = false,
  ) {
    super(message);
  }
}

const BASE = "/discover-api";

async function call<T>(
  path: string,
  token: string | undefined,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(BASE + path, {
      method: init.method ?? "GET",
      headers: {
        ...(token ? { "x-session-token": token } : {}),
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new DiscoveryError("unreachable", "Discovery is not reachable.", true);
  }

  if (response.status === 404 || response.status >= 502) {
    const known = await response
      .clone()
      .json()
      .then((data) => typeof data?.error === "string")
      .catch(() => false);
    if (!known || response.status >= 502) {
      throw new DiscoveryError(
        "unreachable",
        "Discovery is not reachable.",
        true,
      );
    }
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new DiscoveryError(
      data?.error ?? "error",
      data?.message ?? "Something went wrong. Try again in a moment.",
    );
  }

  return data as T;
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const discovery = {
  categories: () =>
    call<{ categories: string[] }>("/categories", undefined).then(
      (data) => data.categories,
    ),

  listings: (params: ListingQuery) =>
    call<ListingsPage>("/listings" + query(params), undefined),

  mine: (token: string, serverIds: string[] = []) =>
    call<{ listings: Listing[]; servers: Target[]; bots: Target[] }>(
      "/mine" + query({ servers: serverIds.join(",") }),
      token,
    ),

  isAdmin: (token: string) =>
    call<{ admin: boolean }>("/me/admin", token)
      .then((data) => data.admin)
      .catch(() => false),

  publish: (token: string, input: ListingInput) =>
    call<Listing>("/listings", token, { method: "POST", body: input }),

  update: (token: string, id: string, input: Partial<ListingInput>) =>
    call<Listing>(`/listings/${id}`, token, { method: "PATCH", body: input }),

  remove: (token: string, id: string) =>
    call<unknown>(`/listings/${id}`, token, { method: "DELETE" }),

  report: (token: string, id: string, reason: string) =>
    call<unknown>(`/listings/${id}/report`, token, {
      method: "POST",
      body: { reason },
    }),

  adminListings: (token: string, status?: string) =>
    call<{ items: Listing[] } | Listing[]>(
      "/admin/listings" + query({ status }),
      token,
    ).then((data) => (Array.isArray(data) ? data : data.items)),

  adminAction: (
    token: string,
    id: string,
    action: "hide" | "approve" | "feature" | "unfeature",
  ) =>
    call<unknown>(`/admin/listings/${id}/${action}`, token, {
      method: "POST",
    }),

  admin: {
    users: (token: string, q: string) =>
      call<{ items: AdminUser[] }>("/admin/users" + query({ q }), token).then(
        (data) => data.items,
      ),

    user: (token: string, id: string) =>
      call<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`, token),

    suspend: (
      token: string,
      id: string,
      body: AdminWrite & { days: number | null },
    ) =>
      call<unknown>(`/admin/users/${encodeURIComponent(id)}/suspend`, token, {
        method: "POST",
        body,
      }),

    userAction: (
      token: string,
      id: string,
      action: "unsuspend" | "ban" | "unban" | "logout",
      body: AdminWrite,
    ) =>
      call<unknown>(`/admin/users/${encodeURIComponent(id)}/${action}`, token, {
        method: "POST",
        body,
      }),

    servers: (token: string, q: string) =>
      call<{ items: AdminServerBrief[] }>(
        "/admin/servers" + query({ q }),
        token,
      ).then((data) => data.items),

    server: (token: string, id: string) =>
      call<AdminServerDetail>(`/admin/servers/${encodeURIComponent(id)}`, token),

    serverFlags: (
      token: string,
      id: string,
      body: AdminWrite & { official?: boolean; verified?: boolean },
    ) =>
      call<unknown>(`/admin/servers/${encodeURIComponent(id)}/flags`, token, {
        method: "POST",
        body,
      }),

    serverAction: (
      token: string,
      id: string,
      action: "takeover" | "delete",
      body: AdminWrite,
    ) =>
      call<unknown>(`/admin/servers/${encodeURIComponent(id)}/${action}`, token, {
        method: "POST",
        body,
      }),

    message: (token: string, id: string) =>
      call<AdminMessageDetail>(
        `/admin/messages/${encodeURIComponent(id)}`,
        token,
      ),

    deleteMessage: (token: string, id: string, body: AdminWrite) =>
      call<unknown>(`/admin/messages/${encodeURIComponent(id)}`, token, {
        method: "DELETE",
        body,
      }),

    reports: (token: string, status: AdminReportStatus) =>
      call<{ items: AdminReport[] }>(
        "/admin/reports" + query({ status }),
        token,
      ).then((data) => data.items),

    reportAction: (
      token: string,
      id: string,
      action: "resolve" | "reject",
      body: AdminWrite & { notes?: string },
    ) =>
      call<unknown>(`/admin/reports/${encodeURIComponent(id)}/${action}`, token, {
        method: "POST",
        body,
      }),

    audit: (token: string, params: { target?: string; admin?: string; before?: string }) =>
      call<{ items: AdminAuditRow[]; next: string | null }>(
        "/admin/audit" + query(params),
        token,
      ),
  },
};

const adminCache = new Map<string, Promise<boolean>>();

export function checkAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return Promise.resolve(false);
  let cached = adminCache.get(token);
  if (!cached) {
    cached = discovery.isAdmin(token);
    adminCache.set(token, cached);
  }
  return cached;
}
