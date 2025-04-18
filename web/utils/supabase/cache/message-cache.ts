import { z } from "zod";
import { DraftMessage, Message } from "../models/message";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { Profile } from "../models/profile";
import { SupabaseClient } from "@supabase/supabase-js";

// Helper function to fetch a single member by ID
const fetchMemberById = async (supabase: SupabaseClient, userId: string) => {
  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching member profile:", error);
    return null;
  }

  return profile;
};

export const addMessageToCacheFn =
  (
    queryUtils: QueryClient,
    studyRoomId: string | string[] | undefined,
    members: z.infer<typeof Profile>[] | undefined,
    supabase: SupabaseClient
  ) =>
  async (newMessage: z.infer<typeof DraftMessage>) => {
    // First try to find the user in the already loaded members
    let user = members?.find((member) => member.id === newMessage.author_id);

    // If user not found in current members and we have supabase instance
    if (!user && supabase) {
      try {
        // Fetch the member profile directly from the database
        const profileData = await fetchMemberById(
          supabase,
          newMessage.author_id
        );

        if (profileData) {
          user = profileData;

          // Optionally update the members cache to include this user for future use
          if (members) {
            queryUtils.setQueryData(
              ["members", studyRoomId],
              [...members, profileData]
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch member data:", error);
      }
    }

    // Create a fallback user only if absolutely necessary
    const author = user || {
      id: newMessage.author_id,
      name: "Unknown User",
      handle: "unknown",
      avatar_url: null,
      major: "Undeclared",
      created_at: new Date().toISOString(),
    };

    queryUtils.setQueryData(
      ["messages", studyRoomId],
      (oldData: InfiniteData<z.infer<typeof Message>[]> | undefined) => {
        if (!oldData) return oldData; // safety check

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page, index) =>
            index === 0
              ? [Message.parse({ author, ...newMessage }), ...page]
              : page
          ),
        };
      }
    );
  };

export const updateMessageInCacheFn =
  (
    queryUtils: QueryClient,
    studyRoomId: string | string[] | undefined,
    members: z.infer<typeof Profile>[] | undefined,
    supabase: SupabaseClient
  ) =>
  async (updatedMessage: z.infer<typeof DraftMessage>) => {
    // First try to find the user in the already loaded members
    let user = members?.find(
      (member) => member.id === updatedMessage.author_id
    );

    // If user not found in current members and we have supabase instance
    if (!user && supabase) {
      try {
        // Fetch the member profile directly from the database
        const profileData = await fetchMemberById(
          supabase,
          updatedMessage.author_id
        );

        if (profileData) {
          user = profileData;

          // Optionally update the members cache to include this user for future use
          if (members) {
            queryUtils.setQueryData(
              ["members", studyRoomId],
              [...members, profileData]
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch member data:", error);
      }
    }

    // Create a fallback user only if absolutely necessary
    const author = user || {
      id: updatedMessage.author_id,
      name: "Unknown User",
      handle: "unknown",
      avatar_url: null,
      major: "Undeclared",
      created_at: new Date().toISOString(),
    };

    queryUtils.setQueryData(
      ["messages", studyRoomId],
      (oldData: InfiniteData<z.infer<typeof Message>[]> | undefined) => {
        if (!oldData) return oldData;

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.map((message) =>
              message.id === updatedMessage.id
                ? Message.parse({ author, ...updatedMessage })
                : message
            )
          ),
        };
      }
    );
  };

export const deleteMessageFromCacheFn =
  (queryUtils: QueryClient, studyRoomId: string | string[] | undefined) =>
  (messageId: string) => {
    queryUtils.setQueryData(
      ["messages", studyRoomId],
      (oldData: InfiniteData<z.infer<typeof Message>[]> | undefined) => {
        if (!oldData) return oldData;
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) =>
            page.filter((message) => message.id !== messageId)
          ),
        };
      }
    );
  };
