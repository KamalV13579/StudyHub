import { z } from "zod";
import { DraftMessage, Message } from "../models/message";
import { InfiniteData , Query, QueryClient } from "@tanstack/react-query";
import { Profile } from "../models/profile";

export const addMessageToCacheFn = 
    (
        queryUtils: QueryClient,
        studyRoomId: string | string[] | undefined,
        members: z.infer<typeof Profile>[] | undefined,
    ) => 
    (newMessage: z.infer<typeof DraftMessage>) => {
        queryUtils.setQueryData(
            ["messages", studyRoomId],
            (oldData: InfiniteData<z.infer<typeof Message>[]>) => {
                const user = members?.find(
                    (member) => member.id === newMessage.author_id
                );

                return { 
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page, index) => 
                    index === 0
                    ? [Message.parse({ author: user, ...newMessage}), ...page] 
                    : page
                    ),
                }
            }
        );
    };

    export const updateMessageInCacheFn = 
        (
            queryUtils: QueryClient,
            studyRoomId: string | string[] | undefined,
            members: z.infer<typeof Profile>[] | undefined
        ) => 
        (updatedMessage: z.infer<typeof DraftMessage>) => { 
            queryUtils.setQueryData(
                ["messages", studyRoomId],
                (oldData: InfiniteData<z.infer<typeof Message>[]>) => { 
                    const user = members?.find(
                        (member) => member.id === updatedMessage.author_id
                    );

                    return { 
                        pageParams: oldData.pageParams,
                        pages: oldData.pages.map((page) =>
                            page.map((message) =>
                                message.id === updatedMessage.id
                                    ? Message.parse({ author: user, ...updatedMessage})
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
            (oldData: InfiniteData<z.infer<typeof Message>[]>) => { 
                return { 
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => 
                        page.filter((message) => message.id !== messageId)
                    ),
                };
            }
        );
    };