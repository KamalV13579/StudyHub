/**
 * This file contains the method used to broadcast to all connected clients that
 * the current user's status has changed.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { SupabaseClient } from "@supabase/supabase-js";

/**
 * @param supabase: SupabaseClient - The Supabase client used to send the message.
 */
export const broadcastUserChange = async (supabase: SupabaseClient) => {
  const channel = supabase.channel("user-change");
  channel.subscribe((status) => {
    if (status !== "SUBSCRIBED") {
      return null;
    }
    channel.send({
      type: "broadcast",
      event: "userStatusChange",
      payload: {},
    });
  });
};
