import { auth } from "@/lib/auth";
import { Client } from "pg";

// This route streams stock movement events to the admin UI in real time via
// Server-Sent Events, backed by a dedicated Postgres LISTEN/NOTIFY connection
// (see the `stock_log_notify_trigger` migration). It intentionally opens its
// own raw `pg.Client` rather than reusing the pooled Prisma connection: LISTEN
// requires a long-lived session-level connection, which is incompatible with
// Prisma's/PgBouncer's transaction-pooled connections.
//
// Requires the Node.js runtime (not Edge) since it needs a raw TCP socket.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allows the stream to stay open for extended periods on platforms that
// enforce a function duration limit (e.g. Vercel Pro/Enterprise). On plans
// without an extended duration, the client-side EventSource reconnect logic
// (see StockLogRealtime) transparently re-establishes the stream on drop.
export const maxDuration = 300;

const HEARTBEAT_INTERVAL_MS = 20_000;

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const encoder = new TextEncoder();

  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        await client.connect();
        await client.query("LISTEN stock_log_changes");

        client.on("notification", (msg) => {
          if (msg.channel !== "stock_log_changes" || !msg.payload) return;
          try {
            send("stock_log", JSON.parse(msg.payload));
          } catch (err) {
            console.error("Failed to parse stock_log_changes payload:", err);
          }
        });

        client.on("error", (err) => {
          console.error("Stock log LISTEN connection error:", err);
          controller.close();
        });

        send("connected", { ok: true });

        // Keeps intermediary proxies/load balancers from timing out an
        // otherwise-idle SSE connection between stock movement events.
        heartbeat = setInterval(() => {
          try {
            send("heartbeat", { t: Date.now() });
          } catch {
            /* stream already closed */
          }
        }, HEARTBEAT_INTERVAL_MS);
      } catch (err) {
        console.error("Failed to start stock log LISTEN stream:", err);
        controller.close();
      }
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      client.query("UNLISTEN stock_log_changes").catch(() => {});
      client.end().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
