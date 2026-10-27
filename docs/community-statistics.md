# Community statistics connection

The Community page reads `/api/community-stats`. No sample or invented statistics are published. Missing days and missing metrics stay blank, not zero. The public Discord invite continues to supply approximate current member and online counts separately.

## Cloudflare Pages

The Pages Function uses the existing `VISITS_DB` D1 binding and creates a separate `community_daily_stats` table. Add a strong random **secret** named `COMMUNITY_STATS_INGEST_KEY` in the Pages project settings, then redeploy. Do not put this key or a Discord bot token in `dist`, GitHub, browser code, or chat.

An always-running Discord bot must record `GUILD_MEMBER_ADD` and `GUILD_MEMBER_REMOVE` with the `GUILD_MEMBERS` privileged intent enabled in the developer portal and its Gateway connection. This needs a server administrator to install/authorize the bot. Historical events before recording cannot be recovered from the invite count. Do not derive join and leave counts from changes in total members.

Record online counts at a documented interval, for example every five minutes, using guild counts with `with_counts=true`. The daily maximum is a sampled, approximate peak, not unique members active in a day. If using Presence events instead, enable the corresponding privileged intent and establish a complete baseline. Avoid storing user identities for this aggregate report.

Use UTC dates and durable storage in the collector. Upload cumulative day totals periodically and at UTC day rollover. Repeated uploads replace the same day's totals, making retries idempotent. Missing metrics must be `null`. A partially observed day should include only events actually recorded, not an inferred full-day total. Downtime loses events unless the collector can replay them; document interruptions.

Authenticated request:

```http
PUT /api/community-stats
Authorization: Bearer <COMMUNITY_STATS_INGEST_KEY>
Content-Type: application/json
```

Payload shape (values must come from the collector):

```text
{"date":"YYYY-MM-DD","joined":<integer or null>,"left":<integer or null>,"onlinePeak":<integer or null>}
```

The read endpoint returns `days`, `updatedAt`, and `tracking`. Only aggregate numbers are public. The UI shows the most recent 7 or 30 UTC dates, membership bars, daily peak online, keyboard-accessible date inspection and a daily table.

## Hosting limitation

The Sites deployment is static and does not execute Cloudflare Pages Functions. It shows an honest empty state until a same-origin history endpoint is available. The separate Cloudflare Pages project can execute this function after its binding and secret are configured. The collector and Discord authorization have not been provisioned by this change.

## Primary references

- Discord Gateway intents: https://docs.discord.com/developers/events/gateway#gateway-intents
- Discord membership events: https://docs.discord.com/developers/events/gateway-events#guild-member-add
- Discord guild counts: https://docs.discord.com/developers/resources/guild#get-guild
