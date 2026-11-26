// Script to seed a Premier Lending admin user, API token, and webhook into local Documenso
// Run from the documenso directory: npx tsx scripts/setup-portal.ts

import { hashSync } from '@documenso/lib/server-only/auth/hash';
import { createPersonalOrganisation } from '@documenso/lib/server-only/organisation/create-organisation';
import { createApiToken } from '@documenso/lib/server-only/public-api/create-api-token';
import { prisma } from '@documenso/prisma';
import { OrganisationType, Role, WebhookTriggerEvents } from '@prisma/client';

const WEBHOOK_URL = process.env.PORTAL_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/esign';
const WEBHOOK_SECRET = process.env.ESIGN_WEBHOOK_SECRET;
const ADMIN_EMAIL = process.env.DOCUMENSO_ADMIN_EMAIL || 'admin@premierlending.local';
const ADMIN_PASSWORD = process.env.DOCUMENSO_ADMIN_PASSWORD;
if (!WEBHOOK_SECRET || !ADMIN_PASSWORD) {
  throw new Error('Set ESIGN_WEBHOOK_SECRET and DOCUMENSO_ADMIN_PASSWORD before running this script');
}

async function main() {
  // Create or find user
  let user = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Premier Lending Admin',
        email: ADMIN_EMAIL,
        password: hashSync(ADMIN_PASSWORD),
        emailVerified: new Date(),
        roles: [Role.USER, Role.ADMIN],
      },
    });
    await createPersonalOrganisation({
      userId: user.id,
      inheritMembers: true,
      type: OrganisationType.ORGANISATION,
    });

    // Enable legacy envelopes flag
    const org = await prisma.organisation.findFirstOrThrow({
      where: { ownerUserId: user.id },
      include: { organisationClaim: true },
    });
    await prisma.organisationClaim.update({
      where: { id: org.organisationClaim.id },
      data: { flags: { allowLegacyEnvelopes: true } },
    });
    console.log('[setup] Created user:', ADMIN_EMAIL);
  } else {
    console.log('[setup] Found existing user:', ADMIN_EMAIL);
  }

  // Find the team
  const team = await prisma.team.findFirstOrThrow({
    where: { organisation: { ownerUserId: user.id } },
  });

  // Create webhook if not existing
  const existingWebhook = await prisma.webhook.findFirst({
    where: { teamId: team.id, webhookUrl: WEBHOOK_URL },
  });
  if (!existingWebhook) {
    await prisma.webhook.create({
      data: {
        userId: user.id,
        teamId: team.id,
        webhookUrl: WEBHOOK_URL,
        eventTriggers: [WebhookTriggerEvents.DOCUMENT_COMPLETED],
        secret: WEBHOOK_SECRET,
        enabled: true,
      },
    });
    console.log('[setup] Created webhook:', WEBHOOK_URL);
  } else {
    console.log('[setup] Webhook already exists:', WEBHOOK_URL);
  }

  // Always issue a fresh API token (non-expiring)
  const { token } = await createApiToken({
    userId: user.id,
    teamId: team.id,
    tokenName: `portal-web-local-${Date.now()}`,
    expiresIn: null,
  });

  console.log('\n========== COPY THESE INTO portal-web/.env.local ==========');
  console.log(`ESIGN_BASE_URL=http://localhost:3001`);
  console.log(`ESIGN_API_TOKEN=${token}`);
  console.log(`ESIGN_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
  console.log('===========================================================\n');
  console.log('[setup] Documenso admin login:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  console.log('[setup] Documenso UI: http://localhost:3001');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[setup] Error:', err);
    process.exit(1);
  });
