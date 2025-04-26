import React, { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { getOrUpsertForumMembershipAnonymousStatus } from "@/utils/supabase/queries/forum-membership";

export const PostAuthorDisplay = ({ supabase, forumId, authorId, createdAt }: { supabase: SupabaseClient, forumId: string, authorId: string, createdAt: string }) => {
  const [displayName, setDisplayName] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStatusAndName = async () => {
      setIsLoading(true);
      try {
        const isAnonymous = await getOrUpsertForumMembershipAnonymousStatus(supabase, forumId, authorId);
        let name = 'Anonymous';

        if (!isAnonymous) {
          const { data: profile, error: profileError } = await supabase
            .from('profile')
            .select('name')
            .eq('id', authorId)
            .single();

          if (profileError || !profile?.name) {
            console.warn(`Could not fetch username for ${authorId}, falling back to ID.`);
            name = `User ${authorId.substring(0, 8)}...`;
          } else {
            name = profile.name;
          }
        }

        if (isMounted) {
          setDisplayName(name);
        }
      } catch (error) {
        console.error("Error fetching author display info:", error);
        if (isMounted) {
          setDisplayName(`User ${authorId.substring(0, 8)}...`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatusAndName();

    return () => {
      isMounted = false;
    };
  }, [supabase, forumId, authorId]);

  return (
    <>
      Posted by {isLoading ? 'Loading...' : displayName} on {new Date(createdAt).toLocaleString()}
    </>
  );
};