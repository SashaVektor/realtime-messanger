"use client"
import useConversation from '@/app/hooks/useConvaersation'
import { FullConversation } from '@/app/types'
import { Conversation, User } from '@prisma/client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useMemo, useState } from 'react'
import { MdOutlineGroupAdd } from "react-icons/md"
import ConversationBox from './ConversationBox'
import GroupChatModal from './GroupChatModal'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/app/libs/pusher'
import { find } from 'lodash'

interface ConversationListProps {
    initialItems: FullConversation[]
    users: User[]
}

const ConversationList: FC<ConversationListProps> = ({ initialItems, users }) => {
    const [items, setItems] = useState(initialItems)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const session = useSession()

    const router = useRouter();

    const { conversationId, isOpen } = useConversation();

    const pusherKey = useMemo(() => {
        return session.data?.user?.email
    }, [session.data?.user?.email])

    useEffect(() => {
        if (!pusherKey) {
            return;
        }

        pusherClient.subscribe(pusherKey)

        const newHandler = (conversation: FullConversation) => {
            setItems((current) => {
                if (find(current, { id: conversation.id })) {
                    return current
                }

                return [conversation, ...current]
            })
        }

        const updateHandler = (conversation: FullConversation) => {
            setItems((current) => current.map((currentConv) => {
                if (currentConv.id === conversation.id) {
                    return {
                        ...currentConv, messages: conversation.messages
                    }
                }

                return currentConv
            }))
        }

        const removeHandler = (conversation: FullConversation) => {
            setItems((current) => {
                return [...current.filter((conv) => conv.id !== conversation.id)]
            })

            if(conversationId === conversation.id) {
                router.push("/conversations")
            }
        }

        pusherClient.bind("conversation:new", newHandler)
        pusherClient.bind("conversation:update", updateHandler)
        pusherClient.bind("conversation:remove", removeHandler)

        return () => {
            pusherClient.unsubscribe(pusherKey)
            pusherClient.unbind("conversation:new", newHandler)
            pusherClient.unbind("conversation:update", updateHandler)
            pusherClient.unbind("conversation:remove", removeHandler)
        }
    }, [conversationId, pusherKey, router])

    return <>
        <GroupChatModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            users={users}
        />
        <aside className={clsx("fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200",
            isOpen ? "hidden" : "block w-full left-0"
        )}>
            <div className='px-5'>
                <div className='flex justify-between mb-4 pt-4'>
                    <h2 className='text-2xl font-bold text-neutral-800'>
                        Messages
                    </h2>
                    <div className='rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition'
                        onClick={() => setIsModalOpen(true)}
                    >
                        <MdOutlineGroupAdd size={20} />
                    </div>
                </div>
                {items.map((item) => (
                    <ConversationBox
                        key={item.id}
                        data={item}
                        selected={conversationId === item.id}
                    />
                ))}
            </div>
        </aside>
    </>
}

export default ConversationList