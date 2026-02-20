import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();

        console.log("Polar Webhook received:", payload.type);

        if (payload.type === 'subscription.created' || payload.type === 'subscription.updated') {
            const subscription = payload.data as any;
            const userId = subscription.metadata?.user_id || subscription.customer?.metadata?.user_id;
            const email = subscription.customer?.email;

            if (userId || email) {
                const query = supabase.from('profiles').update({
                    subscription_id: subscription.id,
                    subscription_status: subscription.status === 'active' ? 'active' : 'inactive'
                });

                if (userId) {
                    await query.eq('id', userId);
                } else {
                    await query.eq('email', email);
                }
            }
        }

        if ((payload.type as string) === 'subscription.revoked' || (payload.type as string) === 'subscription.deleted') {
            const subscription = payload.data as any;
            const userId = subscription.metadata?.user_id || subscription.customer?.metadata?.user_id;

            if (userId) {
                await supabase.from('profiles')
                    .update({ subscription_status: 'inactive' })
                    .eq('id', userId);
            }
        }
    },
});
