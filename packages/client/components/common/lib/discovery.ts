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
};
