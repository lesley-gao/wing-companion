import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Box,
  Divider,
  Badge,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { Send as SendIcon, Person as PersonIcon } from "@mui/icons-material";
import { apiGet, apiPost, handleApiResponse } from "../utils/api";
import { useAppSelector } from "../store/hooks";

interface ConversationUser {
  id: number;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  rating: number;
  preferredLanguage: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
}

interface Message {
  id: number;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  senderId: number;
  receiverId: number;
  requestId?: number;
  requestType: string;
  threadId?: string;
}

interface ConversationSummary {
  threadId: string;
  otherUser: ConversationUser;
  lastMessage: Message;
  unreadCount: number;
  lastActivity: string;
}

interface Conversation {
  threadId: string;
  otherUser: ConversationUser;
  messages: Message[];
}

const Messaging: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Get current user from Redux store
  const currentUser = useAppSelector((state) => state.auth.user);
  
  // Get theme for dark mode styling
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/api/Message/conversations");
      const data = await handleApiResponse<ConversationSummary[]>(response);
      setConversations(data);
    } catch (error) {
      setError("Failed to load conversations");
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (threadId: string) => {
    try {
      const response = await apiGet(`/api/Message/conversation/${threadId}`);
      const data = await handleApiResponse<Conversation>(response);
      setSelectedConversation(data);
      setShowConversation(true);
    } catch (error) {
      setError("Failed to load conversation");
      console.error("Error loading conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await apiPost("/api/Message", {
        receiverId: selectedConversation.otherUser.id,
        content: newMessage,
        threadId: selectedConversation.threadId,
      });

      const message = await handleApiResponse<Message>(response);

      // Add the new message to the conversation
      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, message],
            }
          : null
      );

      setNewMessage("");

      // Reload conversations to update the last message
      await loadConversations();
    } catch (error) {
      setError("Failed to send message");
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadConversations}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: "80vh" }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          color: isDarkMode ? 'primary.light' : 'text.primary',
          mb: 3 
        }}
      >
        Messages
      </Typography>

      {conversations.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: "center",
            backgroundColor: isDarkMode ? 'background.paper' : 'background.paper',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No conversations yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When someone sends you a help message, it will appear here.
          </Typography>
        </Paper>
      ) : (
        <Paper 
          sx={{ 
            maxHeight: 600, 
            overflow: "auto",
            backgroundColor: isDarkMode ? 'background.paper' : 'background.paper',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <List>
            {conversations.map((conversation, index) => (
              <React.Fragment key={conversation.threadId}>
                <ListItem
                  button
                  onClick={() => loadConversation(conversation.threadId)}
                  sx={{
                    "&:hover": { 
                      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "action.hover" 
                    },
                    cursor: "pointer",
                    backgroundColor:
                      conversation.lastMessage.senderId === currentUser?.id
                        ? "transparent"
                        : isDarkMode 
                          ? "rgba(76, 175, 80, 0.1)" 
                          : "var(--color-secondary)",
                    borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="primary"
                      invisible={conversation.unreadCount === 0}
                    >
                      <Avatar>
                        {conversation.otherUser.profilePicture ? (
                          <img
                            src={conversation.otherUser.profilePicture}
                            alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {conversation.lastMessage.requestType && (
                          <Chip
                            label={conversation.lastMessage.requestType}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {conversation.lastMessage.senderId ===
                          currentUser?.id ? (
                            <>
                              To: {conversation.otherUser.firstName}{" "}
                              {conversation.otherUser.lastName}
                            </>
                          ) : (
                            <>
                              From: {conversation.otherUser.firstName}{" "}
                              {conversation.otherUser.lastName}
                            </>
                          )}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {conversation.lastMessage.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(conversation.lastActivity)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < conversations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Conversation Dialog */}
      <Dialog
        open={showConversation}
        onClose={() => setShowConversation(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? 'background.paper' : 'background.paper',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6">
              {selectedConversation?.otherUser.firstName}{" "}
              {selectedConversation?.otherUser.lastName}
              {selectedConversation?.otherUser.isVerified && (
                <Chip
                  label="Verified"
                  size="small"
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontSize: "1.2rem" }}
            >
              <strong>Email:</strong> {selectedConversation?.otherUser.email}
            </Typography>
            {selectedConversation?.otherUser.phoneNumber && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: "1.2rem" }}>
                <strong>Phone:</strong>{" "}
                {selectedConversation?.otherUser.phoneNumber}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: "1.2rem", mb: 2 }}>
              <strong>Language:</strong>{" "}
              {selectedConversation?.otherUser.preferredLanguage}
            </Typography>
 
          </Box>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 300, maxHeight: 400 }}>
          <Box sx={{ mb: 2 }}>
            {selectedConversation?.messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent:
                    message.senderId === selectedConversation.otherUser.id
                      ? "flex-start"
                      : "flex-end",
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: "95%",
                    backgroundColor:
                      message.senderId === selectedConversation.otherUser.id
                        ? isDarkMode ? "rgba(255, 255, 255, 0.08)" : "grey.100"
                        : "primary.main",
                    color:
                      message.senderId === selectedConversation.otherUser.id
                        ? isDarkMode ? "text.primary" : "text.primary"
                        : "white",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none",
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatDate(message.createdAt)}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', alignItems: 'stretch', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                '& fieldset': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? 'primary.light' : 'primary.main',
                },
              },
              '& .MuiInputBase-input': {
                color: isDarkMode ? 'text.primary' : 'text.primary',
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'text.secondary' : 'text.secondary',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ minHeight: '56px' }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Messaging;
