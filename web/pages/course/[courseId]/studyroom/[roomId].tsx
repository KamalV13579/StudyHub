import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
  Fragment,
} from "react";
import { X, ImageIcon, Upload } from "lucide-react";
import { InView } from "react-intersection-observer";
import MessageView from "@/components/studyroom/message-view";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import {
  getStudyRoom,
  getStudyRoomMembers,
} from "@/utils/supabase/queries/studyroom";
import StudyRoomHeader from "@/components/studyroom/studyroom-header";
import { DraftMessage } from "@/utils/supabase/models/message";
import {
  getPaginatedMessages,
  sendMessage,
} from "@/utils/supabase/queries/message";
import { useDebounce } from "use-debounce";
import {
  addMessageToCacheFn,
  updateMessageInCacheFn,
  deleteMessageFromCacheFn,
} from "@/utils/supabase/cache/message-cache";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { InfiniteData } from "@tanstack/react-query";
import { Message } from "@/utils/supabase/models/message";
import { StudyRoomUserSidebar } from "@/components/studyroom/studyroom-user-bar";
import { CourseSidebar } from "@/components/course/sidebar";

export type ChannelPageProps = { user: User };
export default function CourseHomePage({ user }: ChannelPageProps) {
  const router = useRouter();
  const { courseId, roomId: studyRoomId } = router.query;
  const supabase = createSupabaseComponentClient();

  const queryUtils = useQueryClient();

  // Fetches the currently selected course
  const { data: course, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseInfo(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: studyRooms } = useQuery({
    queryKey: ["studyRooms", courseId],
    queryFn: () => getStudyRooms(supabase, courseId, user.id),
    enabled: !!courseId,
  });

  const { data: resourceRepository } = useQuery({
    queryKey: ["resourceRepository", courseId],
    queryFn: () => getResourceRepository(supabase, courseId),
    enabled: !!courseId,
  });

  const { data: forumRepository } = useQuery({
    queryKey: ["forumRepository", courseId],
    queryFn: () => getForumRepository(supabase, courseId),
    enabled: !!courseId,
  });

  // Fetches the study rooms for current course
  const { data: studyRoom, isLoading: studyRoomLoading } = useQuery({
    queryKey: ["study_room", studyRoomId],
    queryFn: async () => {
      console.log("roomId", studyRoomId);
      if (!studyRoomId) return null;
      return getStudyRoom(supabase, studyRoomId as string);
    },
    enabled: !!courseId,
  });

  // Fetches messages for currently selected study room
  const { data: messages, fetchNextPage: fetchNext } = useInfiniteQuery({
    queryKey: ["messages", studyRoomId],
    queryFn: async ({ pageParam = 0 }) => {
      return await getPaginatedMessages(
        supabase,
        studyRoomId as string,
        pageParam
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => pages.length * lastPage.length,
    enabled: !!studyRoomId,
  });

  // Handles filter query for messages
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [debouncedFilterQuery] = useDebounce(filterQuery, 500);

  // Determine if any message filter(s) are active
  const isFilterActive = debouncedFilterQuery.length > 0;

  // Fetch the filtered messsages for the currently selected study room
  const { data: filteredMessages, fetchNextPage: filteredFetchNext } =
    useInfiniteQuery({
      queryKey: ["filteredMessages", studyRoomId],
      queryFn: async ({ pageParam = 0 }) => {
        return await getPaginatedMessages(
          supabase,
          studyRoomId as string,
          pageParam,
          debouncedFilterQuery
        );
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) => pages.length * lastPage.length,
      enabled: !!studyRoomId && isFilterActive,
    });

  // Fetches all the members in a study room
  const { data: members } = useQuery({
    queryKey: ["members", courseId],
    queryFn: async () => {
      return await getStudyRoomMembers(supabase, studyRoomId as string);
    },
    enabled: !!courseId,
  });

  // The following functions contribute to optimistic updating

  const addMessageToCache = useCallback(
    (newMessage: z.infer<typeof DraftMessage>) =>
      addMessageToCacheFn(
        queryUtils,
        studyRoomId,
        members,
        supabase
      )(newMessage),
    [studyRoomId, members, queryUtils, supabase]
  );

  const updateMessageInCache = useCallback(
    (updatedMessage: z.infer<typeof DraftMessage>) =>
      updateMessageInCacheFn(
        queryUtils,
        studyRoomId,
        members,
        supabase
      )(updatedMessage),
    [studyRoomId, members, queryUtils, supabase]
  );

  const deleteMessageFromCache = useCallback(
    (messageId: string) =>
      deleteMessageFromCacheFn(queryUtils, studyRoomId)(messageId),
    [studyRoomId, queryUtils]
  );

  // Realtime for messages

  // Replace your existing real-time message handler with this more robust version:
  useEffect(() => {
    if (!studyRoomId || !user) return;

    const messageSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "study_room_message",
          filter: `study_room_id.eq.${studyRoomId}`,
        },
        async (payload) => {
          try {
            // Skip messages that we've already optimistically added
            if (payload.new.author_id === user.id) {
              // Just ensure the message is in the correct format
              queryUtils.setQueryData(
                ["messages", studyRoomId],
                (
                  oldData: InfiniteData<z.infer<typeof Message>[]> | undefined
                ) => {
                  if (!oldData) return oldData;

                  // Check if message already exists to prevent duplicates
                  const messageExists = oldData.pages.some((page) =>
                    page.some((msg) => msg.id === payload.new.id)
                  );

                  if (messageExists) return oldData;

                  // If not, we need to add it - which shouldn't normally happen
                  console.warn(
                    "Message from current user not found in cache, adding it now"
                  );

                  return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page, index) =>
                      index === 0
                        ? [
                            Message.parse({
                              id: payload.new.id,
                              content: payload.new.content,
                              author_id: payload.new.author_id,
                              study_room_id: payload.new.study_room_id,
                              attachment_url: payload.new.attachment_url,
                              created_at: new Date(payload.new.created_at),
                              author: members?.find(
                                (m) => m.id === user.id
                              ) || {
                                id: user.id,
                                name: "Current User",
                                handle: "current-user",
                                avatar_url: null,
                                major: "Undeclared",
                              },
                            }),
                            ...page,
                          ]
                        : page
                    ),
                  };
                }
              );
              return;
            }

            // For messages from other users, fetch author info if needed
            let authorData = members?.find(
              (m) => m.id === payload.new.author_id
            );

            if (!authorData) {
              try {
                const { data: fetchedAuthor, error } = await supabase
                  .from("profile")
                  .select("*")
                  .eq("id", payload.new.author_id)
                  .single();

                if (error) {
                  console.error("Error fetching author:", error);
                  authorData = {
                    id: payload.new.author_id,
                    name: "Unknown User",
                    handle: "unknown",
                    avatar_url: null,
                    major: "Undeclared",
                  };
                } else {
                  authorData = fetchedAuthor;

                  // Update members cache for future use
                  if (members) {
                    queryUtils.setQueryData(
                      ["members", studyRoomId],
                      [...members, fetchedAuthor]
                    );
                  }
                }
              } catch (fetchError) {
                console.error("Failed to fetch author info:", fetchError);
                // Use fallback author data
                authorData = {
                  id: payload.new.author_id,
                  name: "Unknown User",
                  handle: "unknown",
                  avatar_url: null,
                  major: "Undeclared",
                };
              }
            }

            // Add the message to the cache with proper error handling
            queryUtils.setQueryData(
              ["messages", studyRoomId],
              (
                oldData: InfiniteData<z.infer<typeof Message>[]> | undefined
              ) => {
                if (!oldData) {
                  // If there's no existing data, create a new structure
                  try {
                    const newMessage = Message.parse({
                      id: payload.new.id,
                      content: payload.new.content,
                      author: authorData,
                      attachment_url: payload.new.attachment_url,
                      created_at: new Date(payload.new.created_at),
                    });

                    return {
                      pageParams: [0],
                      pages: [[newMessage]],
                    };
                  } catch (parseError) {
                    console.error("Failed to parse message:", parseError);
                    return undefined;
                  }
                }

                // Check if message already exists to prevent duplicates
                const messageExists = oldData.pages.some((page) =>
                  page.some((msg) => msg.id === payload.new.id)
                );

                if (messageExists) return oldData;

                // Try to safely parse and add the new message
                try {
                  const newMessage = Message.parse({
                    id: payload.new.id,
                    content: payload.new.content,
                    author: authorData,
                    attachment_url: payload.new.attachment_url,
                    created_at: new Date(payload.new.created_at),
                  });

                  // Add the message at the top of the first page
                  return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page, index) =>
                      index === 0 ? [newMessage, ...page] : page
                    ),
                  };
                } catch (parseError) {
                  console.error("Failed to parse message:", parseError);
                  return oldData; // Return unchanged data on error
                }
              }
            );
          } catch (error) {
            console.error("Error handling real-time message:", error);
            // Continue execution despite errors
          }
        }
      )
      .subscribe();

    // Handle other events (UPDATE, DELETE) similarly with proper error handling

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [studyRoomId, user, members, queryUtils, supabase]);
  // Storing online users

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const onUserJoin = useCallback((joiningUserIds: string[]) => {
    setOnlineUsers((prevUsers) => [...prevUsers, ...joiningUserIds]);
  }, []);

  const onUserLeave = useCallback((leavingUserIds: string[]) => {
    setOnlineUsers((prevUsers) =>
      prevUsers.filter((user) => !leavingUserIds.includes(user))
    );
  }, []);

  // Realtime online users

  useEffect(() => {
    const presenceSubscription = supabase.channel("presence-channel", {
      config: {
        presence: {
          key: user?.id,
        },
      },
    });

    presenceSubscription.on(
      "presence",
      { event: "join" },
      (payload: { newPresences: { user_id: string }[] }) => {
        const joiningUserIds = payload.newPresences.map(
          (presence) => presence.user_id
        );
        onUserJoin(joiningUserIds);
      }
    );

    presenceSubscription.on(
      "presence",
      { event: "leave" },
      (payload: { leftPresences: { user_id: string }[] }) => {
        const leavingUserIds = payload.leftPresences.map(
          (presence) => presence.user_id
        );
        onUserLeave(leavingUserIds);
      }
    );

    presenceSubscription.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        if (user) {
          await presenceSubscription.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });

          const state = presenceSubscription.presenceState();
          const allOnlineUsers = Object.keys(state);
          onUserJoin(allOnlineUsers);
        }
      }
    });

    return () => {
      presenceSubscription.unsubscribe();
    };
  }, [supabase, user, onUserJoin, onUserLeave]);

  // Tracking typing statuses

  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Using memos to keep statuses

  const typingText = useMemo(() => {
    if (typingUsers.length === 0) return "";

    const filteredUsers = typingUsers.filter((id) => id !== user?.id);
    if (filteredUsers.length === 0) return "";

    // Rest of your existing logic...
    const typingUserNames = filteredUsers
      .slice(0, 3)
      .map(
        (userId) => members?.find((m) => m.id === userId)?.name || "Someone"
      );

    if (filteredUsers.length > 3) return "Several people are typing...";
    if (filteredUsers.length === 1) return `${typingUserNames[0]} is typing...`;

    return `${typingUserNames.join(", ")} are typing...`;
  }, [typingUsers, members, user?.id]);

  // Determing if someone is typing

  const [isTyping, setIsTyping] = useState(false);

  // Typing realtime

  useEffect(() => {
    if (!studyRoomId || !user) return;

    const typingChannel = supabase.channel(`channel-${studyRoomId}`, {
      config: {
        broadcast: {
          self: true,
        },
      },
    });

    // Handle typing start events (IGNORE CURRENT USER)
    typingChannel.on(
      "broadcast",
      { event: "typingStart" },
      (payload: { payload: { message: string } }) => {
        const typingUserId = payload.payload.message;
        if (typingUserId === user.id) return; // Ignore self

        setTypingUsers((prevUsers) =>
          prevUsers.includes(typingUserId)
            ? prevUsers
            : [...prevUsers, typingUserId]
        );
      }
    );

    // Handle typing end events (IGNORE CURRENT USER)
    typingChannel.on(
      "broadcast",
      { event: "typingEnd" },
      (payload: { payload: { message: string } }) => {
        const typingUserId = payload.payload.message;
        if (typingUserId === user.id) return; // Ignore self

        setTypingUsers((prevUsers) =>
          prevUsers.filter((userId) => userId !== typingUserId)
        );
      }
    );

    typingChannel.subscribe();

    if (isTyping) {
      typingChannel.send({
        type: "broadcast",
        event: "typingStart",
        payload: { message: user.id },
      });
    } else {
      typingChannel.send({
        type: "broadcast",
        event: "typingEnd",
        payload: { message: user.id },
      });
    }

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [studyRoomId, supabase, user, isTyping]);

  // Realtime updates for user join / leave, or changing profile image

  useEffect(() => {
    if (!studyRoomId) return;

    const userChangeChannel = supabase.channel("user-change");
    userChangeChannel.on("broadcast", { event: "userStatusChange" }, () => {
      queryUtils.refetchQueries({ queryKey: ["members", studyRoomId] });
    });

    userChangeChannel.subscribe();

    return () => {
      supabase.removeChannel(userChangeChannel);
    };
  }, [courseId, supabase, queryUtils, members, studyRoomId]);

  // States for draft messages

  const [draftMessageText, setDraftMessageText] = useState<string>("");

  // States for uploading files

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // References to the message text area and the end for quick reference
  const messageTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // This ensures the newest messages are shown first (scroll to bottom)

  useEffect(() => {
    if (messages?.pages.length === 1 || filteredMessages?.pages.length === 1) {
      messageEndRef.current?.scrollIntoView();
    }
  }, [messageEndRef, messages, filteredMessages]);

  // Handling for whenever a key is pressed down (enter)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement === messageTextAreaRef.current &&
        e.key === "Enter" &&
        !e.shiftKey
      ) {
        e.preventDefault();

        if (draftMessageText.trim() !== "" || !!selectedFile) {
          if (!studyRoomId) {
            return toast.error("No study room selected!");
          }

          const draftMessage: z.infer<typeof DraftMessage> = {
            id: uuidv4(),
            content: draftMessageText,
            author_id: user!.id,
            study_room_id: studyRoomId as string,
            attachment_url: null,
            created_at: new Date(),
          };

          addMessageToCache(draftMessage);

          const pendingMessage = draftMessageText;
          const pendingFile = selectedFile;

          console.log(pendingMessage);

          setDraftMessageText("");
          setSelectedFile(null);
          setIsTyping(false);

          sendMessage(supabase, draftMessage, selectedFile)
            .then((postedMessage) => {
              console.log("Message successfully posted:", postedMessage);
              if (postedMessage) {
                updateMessageInCache(postedMessage);
              }
              messageEndRef.current?.scrollIntoView();
            })
            .catch((error) => {
              console.error("Message submission error:", error);
              toast("Message failed to send. Please try again.");
              deleteMessageFromCache(draftMessage.id);
              setDraftMessageText(pendingMessage);
              setSelectedFile(pendingFile);
              setIsTyping(true);
            });
        }
      }
    },
    [
      addMessageToCache,
      studyRoomId,
      deleteMessageFromCache,
      selectedFile,
      supabase,
      updateMessageInCache,
      draftMessageText,
      user,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.pages.length]);

  // TODO: Add reaction implementation

  if (!course) return <div>Loading course info...</div>;

  return (
    <>
      {user && (
        <div className="flex flex-row">
          <div className="flex-shrink-0 border-r">
            <CourseSidebar
              user={user}
              course={course}
              studyRooms={studyRooms}
              resourceRepository={resourceRepository}
              forumRepository={forumRepository}
            />
          </div>
          <div className="ml-[70px] flex flex-col w-full h-screen max-h-screen overflow-hidden">
            <StudyRoomHeader
              user={user}
              filterQuery={filterQuery}
              setFilterQuery={setFilterQuery}
              selectedStudyRoom={studyRoom ?? undefined}
            />
            <div className="flex flex-row grow">
              <div className="flex flex-col grow max-h-[calc(100vh-56px)]">
                <ScrollArea
                  className={cn(
                    "flex flex-col grow",
                    !!selectedFile
                      ? "h-[calc(100vh-286px)]"
                      : "h-[calc(100vh-238px)]"
                  )}
                >
                  {/* Note: The messages appear bottom-to-top because of `flex-col-reverse`.  */}
                  <div className="flex flex-col-reverse grow p-3">
                    <div ref={messageEndRef}></div>
                    {/* If the filter is active, show the filter results. */}
                    {isFilterActive &&
                      filteredMessages?.pages.map((page) => {
                        return page.map((message, messageIndex) => {
                          return (
                            <Fragment key={message.id}>
                              {messageIndex === 45 && (
                                <InView
                                  onChange={(inView, entry) => {
                                    if (inView && entry.intersectionRatio > 0) {
                                      filteredFetchNext();
                                      entry.target.remove();
                                    }
                                  }}
                                ></InView>
                              )}
                              <MessageView
                                user={user}
                                channelMembers={members ?? []}
                                message={message}
                              />
                            </Fragment>
                          );
                        });
                      })}
                    {/* If no filter is active, show the regular results. */}
                    {!isFilterActive && (
                      <>
                        {messages?.pages?.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p>No messages yet. Be the first to send one!</p>
                          </div>
                        ) : (
                          messages?.pages?.map((page) => {
                            return page.map((message, messageIndex) => {
                              return (
                                <Fragment key={message.id}>
                                  {messageIndex === 45 && (
                                    <InView
                                      onChange={(inView, entry) => {
                                        if (
                                          inView &&
                                          entry.intersectionRatio > 0
                                        ) {
                                          fetchNext();
                                          entry.target.remove();
                                        }
                                      }}
                                    ></InView>
                                  )}
                                  <MessageView
                                    user={user}
                                    channelMembers={members ?? []}
                                    message={message}
                                  />
                                </Fragment>
                              );
                            });
                          })
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
                {/* Message send area */}
                <div className="flex flex-col w-full px-6 pb-6 pt-3 border-t">
                  {selectedFile && (
                    <div className="flex flex-row w-full gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedFile(null)}
                      >
                        <ImageIcon />
                        {selectedFile.name}
                        <X />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-row w-full pt-3">
                    <Textarea
                      ref={messageTextAreaRef}
                      value={draftMessageText}
                      onChange={(e) => {
                        setDraftMessageText(e.target.value);
                        setIsTyping(e.target.value.length > 0);
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          // Trigger message submission
                          handleKeyDown(e.nativeEvent);
                        }
                      }}
                      onBlur={() => setIsTyping(false)}
                      className="grow mr-3 bg-sidebar resize-none"
                      placeholder="Type your message here."
                    />
                    <div className="flex flex-col gap-2">
                      {/* 
                      This hidden input provides us the functionality to handle selecting
                      new  pages. This input only accepts images, and when a file is selected,
                      the file is stored in the `selectedFile` state.
                      */}
                      <Input
                        className="hidden"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          setSelectedFile(
                            (e.target.files ?? []).length > 0
                              ? e.target.files![0]
                              : null
                          );
                          messageTextAreaRef.current?.focus();
                        }}
                      />

                      <Button
                        variant="secondary"
                        size="icon"
                        disabled={!!selectedFile}
                        onClick={() => {
                          if (fileInputRef && fileInputRef.current)
                            fileInputRef.current.click();
                        }}
                      >
                        <Upload />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm italic py-2 h-3">{typingText}</p>
                </div>
              </div>
              {/* User sidebar */}
              <StudyRoomUserSidebar
                studyRoom={studyRoom ?? undefined}
                studyRoomMembers={members ?? []}
                onlineUserIds={onlineUsers}
                userId={user.id}
                className="overflow-visible w-[270px]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and
  // pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Return the user and profile as props.
  return {
    props: {
      user: userData.user,
    },
  };
}
