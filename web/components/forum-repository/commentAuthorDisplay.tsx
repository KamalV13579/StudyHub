import { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { getOrUpsertForumMembershipAnonymousStatus } from "@/utils/supabase/queries/forum-membership";
import { Badge } from "@/components/ui/badge";

export const CommentAuthorDisplay = ({
  supabase,
  authorId,
  forumId,
  createdAt,
  originalPostAuthorId,
}: {
  supabase: SupabaseClient;
  authorId: string;
  forumId: string;
  createdAt: string;
  originalPostAuthorId: string;
}) => {
  const [displayName, setDisplayName] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const isOriginalPoster = authorId === originalPostAuthorId;

  useEffect(() => {
    let isMounted = true;
    const fetchAuthorDetails = async () => {
      setIsLoading(true);
      try {
        const isAnonymous = await getOrUpsertForumMembershipAnonymousStatus(
          supabase,
          forumId,
          authorId,
        );

        if (isMounted) {
          if (isAnonymous) {
            setDisplayName("Anonymous");
          } else {
            const { data: profile, error } = await supabase
              .from("profile")
              .select("name")
              .eq("id", authorId)
              .single();

            if (error || !profile) {
              console.error(
                "Error fetching profile or profile not found:",
                error,
              );
              setDisplayName("Unknown User");
            } else {
              setDisplayName(profile.name);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error in fetchAuthorDetails:", error);
          setDisplayName("Unknown User");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (authorId && forumId) {
      fetchAuthorDetails();
    } else {
      setDisplayName("Unknown User");
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, authorId, forumId]);

  return (
    <>
      Posted by {isLoading ? "Loading..." : displayName}
      {isOriginalPoster && !isLoading && (
        <Badge variant="secondary" className="ml-2">
          OP
        </Badge>
      )}{" "}
      on {new Date(createdAt).toLocaleString()}
    </>
  );
};
