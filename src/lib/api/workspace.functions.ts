import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as service from "@/domain/services/workspace.service.server";

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const claims = context.claims as Record<string, unknown>;
    const metadata = (claims["user_metadata"] ?? {}) as Record<string, unknown>;
    const email = typeof claims["email"] === "string" ? (claims["email"] as string) : "";
    const fullName =
      typeof metadata["full_name"] === "string" && metadata["full_name"]
        ? (metadata["full_name"] as string)
        : email.split("@")[0] || "Usuário";

    return service.getWorkspace(context.supabase, context.userId, { fullName, email });
  });
