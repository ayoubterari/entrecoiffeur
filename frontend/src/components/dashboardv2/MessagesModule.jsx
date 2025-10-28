import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../lib/convex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { MessageSquare, Send, Clock, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const MessagesModule = ({ userId }) => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Get conversations and unread count
  const conversations = useQuery(api.messaging.getUserConversations,
    userId ? { userId } : "skip"
  )
  const unreadCount = useQuery(api.messaging.getUnreadMessageCount,
    userId ? { userId } : "skip"
  )

  // Get messages for selected conversation
  const messages = useQuery(
    api.messaging.getConversationMessages,
    selectedConversation && userId ? { 
      conversationId: selectedConversation._id, 
      userId: userId 
    } : "skip"
  )

  // Mutations
  const sendMessageMutation = useMutation(api.messaging.sendMessage)
  const markAsRead = useMutation(api.messaging.markConversationAsRead)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && userId) {
      markAsRead({ 
        conversationId: selectedConversation._id, 
        userId: userId 
      })
    }
  }, [selectedConversation, userId])

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !selectedConversation || !userId) return

    try {
      const receiverId = selectedConversation.userRole === 'seller' 
        ? selectedConversation.buyerId 
        : selectedConversation.sellerId

      await sendMessageMutation({
        conversationId: selectedConversation._id,
        senderId: userId,
        receiverId: receiverId,
        content: message.trim(),
        messageType: "text"
      })
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const isUnread = (conversation) => {
    if (!userId) return false
    if (conversation.userRole === 'buyer') {
      return !conversation.isReadByBuyer
    } else {
      return !conversation.isReadBySeller
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'À l\'instant'
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays}j`
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          Gérez vos conversations avec les clients
        </p>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="mt-2">
            {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
          </Badge>
        )}
      </div>

      {/* Messages Layout */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 h-[calc(100vh-12rem)]">
        {/* Conversations List - Full width on mobile, 1/3 on desktop */}
        <Card className={cn(
          "lg:col-span-1 flex flex-col h-full",
          selectedConversation && "hidden lg:flex"
        )}>
          <CardHeader className="shrink-0">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <CardDescription>
              {conversations?.length || 0} conversation{conversations?.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {!conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Aucune conversation</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Vos conversations avec les clients apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="divide-y overflow-y-auto h-full">
                {conversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => handleConversationClick(conversation)}
                    className={cn(
                      "w-full p-4 text-left transition-colors hover:bg-muted/50",
                      selectedConversation?._id === conversation._id && "bg-muted",
                      isUnread(conversation) && "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(
                          "bg-primary text-primary-foreground",
                          isUnread(conversation) && "bg-blue-600"
                        )}>
                          {conversation.otherParticipant?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold truncate">
                            {conversation.otherParticipant?.firstName} {conversation.otherParticipant?.lastName}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.lastMessage || 'Nouvelle conversation'}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conversation.userRole === 'seller' ? '🏪 Vendeur' : '🛒 Acheteur'}
                          </Badge>
                          {isUnread(conversation) && (
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area - Full width on mobile when conversation selected, 2/3 on desktop */}
        <Card className={cn(
          "lg:col-span-2 flex flex-col h-full",
          !selectedConversation && "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    ←
                  </Button>
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedConversation.otherParticipant?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {selectedConversation.otherParticipant?.firstName} {selectedConversation.otherParticipant?.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                      <User className="h-3 w-3" />
                      {selectedConversation.userRole === 'seller' ? 'Acheteur' : 'Vendeur'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-2 sm:p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {!messages || messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="mb-4 rounded-full bg-muted p-6">
                        <MessageSquare className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold mb-2">Commencez la conversation</h4>
                      <p className="text-sm text-muted-foreground">
                        Envoyez votre premier message à {selectedConversation.otherParticipant?.firstName}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={cn(
                            "flex",
                            msg.senderId === userId ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              msg.senderId === userId
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs",
                              msg.senderId === userId
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              {formatMessageTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <Separator className="mb-4 shrink-0" />

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="space-y-2 shrink-0">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      maxLength={500}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!message.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{message.length}/500 caractères</span>
                    <span>Appuyez sur Entrée pour envoyer</span>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Sélectionnez une conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MessagesModule
