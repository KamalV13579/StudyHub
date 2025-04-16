import { useRouter } from "next/router";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { getCourseInfo } from "@/utils/supabase/queries/course";
import { 
  useCallback, 
  useEffect,
  useState, 
  useMemo,
  useRef,
 } from "react";
import { User } from "@supabase/supabase-js";
import { CourseLayout } from "@/components/course/courseLayout";
import { getStudyRoom, getStudyRoomMembers } from "@/utils/supabase/queries/studyroom";
import {
  DraftMessage,
} from "@/utils/supabase/models/message";
import { 
  getPaginatedMessages, 
  sendMessage,
} from "@/utils/supabase/queries/message";
import { useDebounce } from "use-debounce";
import { 
  addMessageToCacheFn,
  updateMessageInCacheFn,
  deleteMessageFromCacheFn
} from "@/utils/supabase/cache/message-cache";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export default function CourseHomePage() {
  const router = useRouter();
  const { courseId, studyRoomId } = router.query;
  const supabase = createSupabaseComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const queryUtils = useQueryClient();

  // Fetches current user
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    fetchUser();
  }, [supabase, router]);


  // Fetches the currently selected course
  const { data: course, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => {
      console.log("courseId", courseId);
      if (!courseId) return Promise.resolve(null);
      return getCourseInfo(supabase, courseId as string);
    },
    enabled: !!courseId,
  });

  // Fetches the study rooms for current course
  const { data: studyRoom, isLoading: studyRoomLoading } = useQuery({
    queryKey: ["study_room", router.query.roomId],
    queryFn: async () => {
      console.log("roomId", router.query.roomId);
      if (!router.query.roomId) return null;
      return getStudyRoom(supabase, router.query.roomId as string);
    },
    enabled: !!courseId,
  });

  // Fetches messages for currently selected study room
  const { data: messages, fetchNextPage: fetchNext } = useInfiniteQuery({
    queryKey: ["messages", router.query.roomId],
    queryFn: async ({ pageParam = 0 }) => {
      return await getPaginatedMessages(
        supabase,
        router.query.roomId as string,
        pageParam
      )
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
    enabled: !!courseId
  });

  // The following functions contribute to optimistic updating

  const addMessageToCache = useCallback(
    (newMessage: z.infer<typeof DraftMessage>) => 
      addMessageToCacheFn(queryUtils, studyRoomId, members)(newMessage),
    [studyRoomId, members, queryUtils]
  )

  const updateMessageInCache = useCallback(
    (updatedMessage: z.infer<typeof DraftMessage>) => 
      updateMessageInCacheFn(queryUtils, studyRoomId, members)(updatedMessage),
    [studyRoomId, members, queryUtils]
  );

  const deleteMessageFromCache = useCallback(
    (messageId: string) =>
      deleteMessageFromCacheFn(queryUtils, studyRoomId)(messageId),
    [studyRoomId, queryUtils]
  );

  // Realtime for messages

  useEffect(() => { 
    if(!studyRoomId) return;

    const messageSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `study_room_id.eq${studyRoomId}`
        },
        (payload) => { 
          const newMessage = { 
            id: payload.new.id,
            content: payload.new.content,
            author_id: payload.new.author_id,
            study_room_id: payload.new.study_room_id,
            attachment_url: payload.new.attachment_url,
            created_at: new Date(payload.new.created_at)
          };
          if (user && newMessage.author_id !== user.id) { 
            addMessageToCache(newMessage)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `study_room_id.eq.${studyRoomId}`,
        },
        (payload) => { 
          const updatedMessage = {
            id: payload.new.id,
            content: payload.new.content,
            author_id: payload.new.author_id,
            study_room_id: payload.new.study_room_id,
            attachment_url: payload.new.attachment_url,
            created_at: new Date(payload.new.created_at)
          };
          updateMessageInCache(updatedMessage)
        }
      )
      .on(
        "postgres_changes",
        { 
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id.eq.${studyRoomId}`,
        },
        (payload) => { 
          deleteMessageFromCache(payload.old.id)
        }
      )
      .subscribe();

      // TODO: Implement reaction realtime

      return () => { 
        messageSubscription.unsubscribe();
      }
  }, [
    addMessageToCache,
    studyRoomId,
    deleteMessageFromCache,
    supabase,
    user?.id,
  ]);

  // Storing online users

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const onUserJoin = (joiningUserIds: string[]) => { 
    setOnlineUsers((prevUsers) => [...prevUsers, ...joiningUserIds]);
  };

  const onUserLeave = (leavingUserIds: string[]) => {
    setOnlineUsers((prevUsers) => 
      prevUsers.filter((user) => !leavingUserIds.includes(user))
    );
  };


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
    }
  }, [supabase, user?.id, onUserJoin, onUserLeave])

  // Tracking typing statuses

  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Using memos to keep statuses

  const typingText = useMemo(() => { 
    if (typingUsers.length === 0) { 
      return "";
    }
    if (typingUsers.length === 1 && user && typingUsers[0] !== user.id) { 
      const typingUser = members?.find(
        (member) => member.id === typingUsers[0]
      );
      return `${typingUser?.name} is typing...`;
    }
    if (typingUsers.length > 3 && user && !typingUsers.includes(user.id)) { 
      return `Several users are typing...`;
    }

    const typingUserNames = typingUsers.map((userId) => { 
      if (user && userId === user.id) { 
        return "You";
      }
      const typingUser = members?.find((member) => member.id === userId);
      return typingUser?.handle;
    });
    
    return `${typingUserNames.join(", ")} are typing...`;
  }, [typingUsers, members])

  // Determing if someone is typing

  const [isTyping, setIsTyping] = useState(false);

  // Typing realtime

  useEffect(() => { 
    if (!studyRoomId) return;

    const typingChannel = supabase.channel(`channel-${studyRoomId}`, { 
      config: { 
        broadcast: { 
          self: true,
        },
      },
    });

    typingChannel.on(
      "broadcast",
      { event: "typingStart" },
      (payload: { payload: { message: string } }) => { 
        const typingUserId = payload.payload.message;
        setTypingUsers((prevUsers: string[]) => { 
          if (!prevUsers.includes(typingUserId)) {
            return [...prevUsers, typingUserId]
          }
          return prevUsers
        });
      }
    );

    typingChannel.on(
      "broadcast",
      { event: "typingEnd" },
      (payload: { payload: { message: string } }) => { 
        const typingUserId = payload.payload.message;
        setTypingUsers((prevUsers: string[]) => { 
          return prevUsers.filter((user: string) => user !== typingUserId)
        });
      }
    );

    typingChannel.subscribe();

    if (isTyping) { 
      typingChannel.send({
        type: "broadcast",
        event: "typingStart",
        payload: { message: user?.id || "" }
      });
    } else { 
      typingChannel.send({
        type: "broadcast",
        event: "typingEnd",
        payload: { message: user?.id || "" }
      })
    }

    return () => { 
      supabase.removeChannel(typingChannel);
    };
  }, [studyRoomId, isTyping, supabase, user?.id])

  // Realtime updates for user join / leave, or changing profile image

  useEffect(() => { 
    if (!studyRoomId) return;

    const userChangeChannel = supabase.channel("user-change");
    userChangeChannel.on("broadcast", { event: "userStatusChange" }, () => { 
      queryUtils.refetchQueries({ queryKey: ["members", studyRoomId] })
    });

    userChangeChannel.subscribe();

    return () => { 
      supabase.removeChannel(userChangeChannel);
    };
  }, [courseId, supabase, queryUtils, members]);

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
      messageEndRef.current?.scrollIntoView()
    } 
  }, [messageEndRef, messages, filteredMessages])

  // Handling for whenever a key is pressed down (enter)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { 
      setIsTyping(true);

      if(
        document.activeElement === messageTextAreaRef.current && 
        e.key === "Enter" && 
        !e.shiftKey
      ) {
        e.preventDefault();
        
        if (draftMessageText.trim() !== "" || !!selectedFile) {
          const draftMessage = { 
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

          setDraftMessageText("");
          setSelectedFile(null);
          setIsTyping(false);

          sendMessage(supabase, draftMessage, selectedFile)
            .then((postedMessage) => { 
              updateMessageInCache(postedMessage);
              messageEndRef.current?.scrollIntoView();
            })
            .catch(() => { 
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
      user?.id,
    ]
  );

  useEffect(() => { 
    window.addEventListener("keydown", handleKeyDown);

    return () => { 
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // TODO: Add reaction implementation

  if (studyRoomLoading) return <div>Loading study room info...</div>;
  if (error || !course) return <div>Error loading study room</div>;

  return (
    <>
      {user && (
        <CourseLayout>
          <div>
            <h1>
              Welcome to {studyRoom?.title}!
            </h1>
          </div>
        </CourseLayout>
      )}
    </>
  );
}