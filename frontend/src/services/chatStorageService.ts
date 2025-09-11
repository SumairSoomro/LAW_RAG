import { supabase } from '../lib/supabase';
import { ChatSession, ChatMessage, SessionWithMessages, SourceReference } from '../types/api';

export class ChatStorageService {
  // Create a new chat session
  static async createSession(userId: string): Promise<ChatSession> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ user_id: userId, title: 'New Chat' }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create chat session:', error);
      throw new Error('Failed to create chat session');
    }

    return data;
  }

  // Get the current/latest chat session for a user, or create one if none exists
  static async getCurrentSession(userId: string): Promise<ChatSession> {
    try {
      // Try to get the latest session
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to fetch chat sessions:', error);
        throw new Error('Failed to fetch chat sessions');
      }

      // If no sessions exist, create one
      if (!sessions || sessions.length === 0) {
        return await this.createSession(userId);
      }

      return sessions[0];
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      // If there's any error, try to create a new session as fallback
      return await this.createSession(userId);
    }
  }

  // Get all messages for a session
  static async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch chat messages:', error);
      throw new Error('Failed to fetch chat messages');
    }

    // Parse sources JSON back to objects
    return (data || []).map(msg => ({
      ...msg,
      sources: msg.sources ? JSON.parse(msg.sources) : undefined
    }));
  }

  // Get session with all its messages
  static async getSessionWithMessages(sessionId: string): Promise<SessionWithMessages> {
    const [session, messages] = await Promise.all([
      this.getSession(sessionId),
      this.getSessionMessages(sessionId)
    ]);

    return { session, messages };
  }

  // Get a specific session
  static async getSession(sessionId: string): Promise<ChatSession> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Failed to fetch chat session:', error);
      throw new Error('Failed to fetch chat session');
    }

    return data;
  }

  // Save a message to a session
  static async saveMessage(
    sessionId: string,
    type: 'user' | 'ai',
    content: string,
    sources?: SourceReference[],
    foundInDocument?: boolean,
    searchResults?: number,
    error?: boolean
  ): Promise<ChatMessage> {
    const messageData = {
      session_id: sessionId,
      type,
      content,
      sources: sources ? JSON.stringify(sources) : null,
      found_in_document: foundInDocument,
      search_results: searchResults,
      error: error || false
    };

    const { data, error: insertError } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save message:', insertError);
      throw new Error('Failed to save message');
    }

    // Update the session's updated_at timestamp
    await this.updateSessionTimestamp(sessionId);

    // Parse sources back from JSON
    return {
      ...data,
      sources: data.sources ? JSON.parse(data.sources) : undefined
    };
  }

  // Update session timestamp
  private static async updateSessionTimestamp(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to update session timestamp:', error);
    }
  }

  // Get all sessions for a user (for future session management UI)
  static async getUserSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user sessions:', error);
      throw new Error('Failed to fetch user sessions');
    }

    return data || [];
  }

  // Update session title
  static async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to update session title:', error);
      throw new Error('Failed to update session title');
    }
  }

  // Delete a session
  static async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to delete session:', error);
      throw new Error('Failed to delete session');
    }
  }
}