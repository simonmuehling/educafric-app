import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { requireAuth, requireAnyRole } from "../middleware/auth";

const router = Router();

// ===== GET CONVERSATIONS LIST =====
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.id;
    const userRole = user.role || user.activeRole;

    console.log(`[CHAT_API] GET /conversations for user ${userId} (${userRole})`);

    const result = await db.execute(sql`
      SELECT c.*, 
        CASE WHEN c.participant_one_id = ${userId} THEN c.participant_one_unread ELSE c.participant_two_unread END as unread_count,
        CASE WHEN c.participant_one_id = ${userId} THEN c.participant_two_id ELSE c.participant_one_id END as other_participant_id,
        CASE WHEN c.participant_one_id = ${userId} THEN c.participant_two_role ELSE c.participant_one_role END as other_participant_role
      FROM chat_conversations c
      WHERE c.participant_one_id = ${userId} OR c.participant_two_id = ${userId}
      ORDER BY c.last_message_at DESC
    `);

    const conversations = result.rows || [];

    // Enrich with participant info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        const otherResult = await db.execute(sql`
          SELECT id, first_name, last_name, profile_photo, phone
          FROM users WHERE id = ${conv.other_participant_id}
          LIMIT 1
        `);
        const otherUser = otherResult.rows?.[0] as any;

        return {
          id: conv.id,
          participantOneId: conv.participant_one_id,
          participantOneRole: conv.participant_one_role,
          participantTwoId: conv.participant_two_id,
          participantTwoRole: conv.participant_two_role,
          studentId: conv.student_id,
          schoolId: conv.school_id,
          lastMessageAt: conv.last_message_at,
          lastMessagePreview: conv.last_message_preview,
          status: conv.status,
          unreadCount: parseInt(conv.unread_count) || 0,
          otherParticipant: otherUser ? {
            id: otherUser.id,
            name: `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim(),
            role: conv.other_participant_role,
            profilePhoto: otherUser.profile_photo,
            phone: otherUser.phone
          } : null
        };
      })
    );

    res.json({ success: true, conversations: enrichedConversations });
  } catch (error) {
    console.error("[CHAT_API] Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

// ===== GET OR CREATE CONVERSATION =====
router.post("/conversations", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { targetUserId, studentId } = req.body;
    const userId = user.id;
    const userRole = user.role || user.activeRole;
    const schoolId = user.schoolId || user.school_id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "Target user ID required" });
    }

    console.log(`[CHAT_API] POST /conversations - Creating/finding conversation between ${userId} and ${targetUserId}`);

    // Get target user info
    const targetResult = await db.execute(sql`
      SELECT id, first_name, last_name, role, school_id
      FROM users WHERE id = ${parseInt(targetUserId)}
      LIMIT 1
    `);
    const targetUser = targetResult.rows?.[0] as any;

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if conversation already exists
    const existingResult = await db.execute(sql`
      SELECT * FROM chat_conversations
      WHERE (participant_one_id = ${userId} AND participant_two_id = ${parseInt(targetUserId)})
         OR (participant_one_id = ${parseInt(targetUserId)} AND participant_two_id = ${userId})
      LIMIT 1
    `);

    if (existingResult.rows && existingResult.rows.length > 0) {
      const existing = existingResult.rows[0] as any;
      return res.json({ 
        success: true, 
        conversation: {
          id: existing.id,
          participantOneId: existing.participant_one_id,
          participantOneRole: existing.participant_one_role,
          participantTwoId: existing.participant_two_id,
          participantTwoRole: existing.participant_two_role,
          studentId: existing.student_id,
          schoolId: existing.school_id,
          lastMessageAt: existing.last_message_at,
          status: existing.status
        }, 
        isNew: false 
      });
    }

    // Create new conversation
    const insertResult = await db.execute(sql`
      INSERT INTO chat_conversations (
        participant_one_id, participant_one_role,
        participant_two_id, participant_two_role,
        student_id, school_id, last_message_at, status
      ) VALUES (
        ${userId}, ${userRole},
        ${parseInt(targetUserId)}, ${targetUser.role},
        ${studentId ? parseInt(studentId) : null},
        ${schoolId || targetUser.school_id || 1},
        NOW(), 'active'
      )
      RETURNING *
    `);

    const newConversation = insertResult.rows?.[0] as any;
    console.log(`[CHAT_API] Created new conversation ${newConversation?.id}`);

    res.json({ 
      success: true, 
      conversation: {
        id: newConversation.id,
        participantOneId: newConversation.participant_one_id,
        participantOneRole: newConversation.participant_one_role,
        participantTwoId: newConversation.participant_two_id,
        participantTwoRole: newConversation.participant_two_role,
        studentId: newConversation.student_id,
        schoolId: newConversation.school_id,
        lastMessageAt: newConversation.last_message_at,
        status: newConversation.status
      }, 
      isNew: true 
    });
  } catch (error) {
    console.error("[CHAT_API] Error creating conversation:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

// ===== GET MESSAGES FOR A CONVERSATION =====
router.get("/conversations/:conversationId/messages", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const conversationId = parseInt(req.params.conversationId);
    const userId = user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`[CHAT_API] GET /conversations/${conversationId}/messages for user ${userId}`);

    // Verify user is part of conversation
    const convResult = await db.execute(sql`
      SELECT * FROM chat_conversations WHERE id = ${conversationId} LIMIT 1
    `);
    const conversation = convResult.rows?.[0] as any;

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.participant_one_id !== userId && conversation.participant_two_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get messages
    const messagesResult = await db.execute(sql`
      SELECT * FROM chat_messages
      WHERE conversation_id = ${conversationId} AND is_deleted = false
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const messages = (messagesResult.rows || []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderRole: m.sender_role,
      content: m.content,
      messageType: m.message_type,
      attachmentUrl: m.attachment_url,
      attachmentName: m.attachment_name,
      isRead: m.is_read,
      readAt: m.read_at,
      isEdited: m.is_edited,
      isDeleted: m.is_deleted,
      replyToId: m.reply_to_id,
      metadata: m.metadata,
      createdAt: m.created_at
    }));

    // Mark messages as read
    if (messages.length > 0) {
      await db.execute(sql`
        UPDATE chat_messages SET is_read = true, read_at = NOW()
        WHERE conversation_id = ${conversationId}
          AND sender_id != ${userId}
          AND is_read = false
      `);

      // Reset unread counter for this user
      if (conversation.participant_one_id === userId) {
        await db.execute(sql`
          UPDATE chat_conversations SET participant_one_unread = 0
          WHERE id = ${conversationId}
        `);
      } else {
        await db.execute(sql`
          UPDATE chat_conversations SET participant_two_unread = 0
          WHERE id = ${conversationId}
        `);
      }
    }

    res.json({ 
      success: true, 
      messages: messages.reverse(),
      conversation: {
        id: conversation.id,
        participantOneId: conversation.participant_one_id,
        participantTwoId: conversation.participant_two_id,
        studentId: conversation.student_id
      },
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error("[CHAT_API] Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

// ===== SEND MESSAGE =====
router.post("/conversations/:conversationId/messages", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const conversationId = parseInt(req.params.conversationId);
    const { content, messageType = 'text', attachmentUrl, attachmentName, replyToId } = req.body;
    const userId = user.id;
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const userRole = user.role || user.activeRole;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    console.log(`[CHAT_API] POST /conversations/${conversationId}/messages from user ${userId}`);

    // Verify user is part of conversation
    const convResult = await db.execute(sql`
      SELECT * FROM chat_conversations WHERE id = ${conversationId} LIMIT 1
    `);
    const conversation = convResult.rows?.[0] as any;

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.participant_one_id !== userId && conversation.participant_two_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Insert message
    const msgResult = await db.execute(sql`
      INSERT INTO chat_messages (
        conversation_id, sender_id, sender_name, sender_role,
        content, message_type, attachment_url, attachment_name,
        reply_to_id, is_read, created_at
      ) VALUES (
        ${conversationId}, ${userId}, ${userName}, ${userRole},
        ${content.trim()}, ${messageType}, ${attachmentUrl || null}, ${attachmentName || null},
        ${replyToId ? parseInt(replyToId) : null}, false, NOW()
      )
      RETURNING *
    `);

    const newMessage = msgResult.rows?.[0] as any;

    // Update conversation
    const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
    
    if (conversation.participant_one_id === userId) {
      await db.execute(sql`
        UPDATE chat_conversations 
        SET last_message_at = NOW(), 
            last_message_preview = ${preview},
            participant_two_unread = participant_two_unread + 1
        WHERE id = ${conversationId}
      `);
    } else {
      await db.execute(sql`
        UPDATE chat_conversations 
        SET last_message_at = NOW(), 
            last_message_preview = ${preview},
            participant_one_unread = participant_one_unread + 1
        WHERE id = ${conversationId}
      `);
    }

    console.log(`[CHAT_API] Message ${newMessage?.id} sent in conversation ${conversationId}`);

    res.json({ 
      success: true, 
      message: {
        id: newMessage.id,
        conversationId: newMessage.conversation_id,
        senderId: newMessage.sender_id,
        senderName: newMessage.sender_name,
        senderRole: newMessage.sender_role,
        content: newMessage.content,
        messageType: newMessage.message_type,
        isRead: newMessage.is_read,
        createdAt: newMessage.created_at
      }
    });
  } catch (error) {
    console.error("[CHAT_API] Error sending message:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

// ===== GET POTENTIAL CHAT CONTACTS (For Teacher: Parents of students in their classes) =====
router.get("/contacts", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.id;
    const userRole = user.role || user.activeRole;
    const schoolId = user.schoolId || user.school_id;

    console.log(`[CHAT_API] GET /contacts for ${userRole} ${userId}`);

    let contacts: any[] = [];

    if (userRole === 'Teacher') {
      // Get parents of students in teacher's classes
      const parentsResult = await db.execute(sql`
        SELECT DISTINCT u.id, u.first_name, u.last_name, u.phone, u.profile_photo, u.role,
               psr.student_id,
               (SELECT CONCAT(s.first_name, ' ', s.last_name) FROM users s WHERE s.id = psr.student_id) as student_name
        FROM users u
        INNER JOIN parent_student_relations psr ON psr.parent_id = u.id
        INNER JOIN enrollments e ON e.student_id = psr.student_id
        INNER JOIN classes c ON c.id = e.class_id
        INNER JOIN teacher_subject_assignments tsa ON tsa.class_id = c.id
        WHERE tsa.teacher_id = ${userId}
          AND u.role = 'Parent'
          AND c.school_id = ${schoolId}
        ORDER BY u.last_name, u.first_name
      `);
      
      contacts = (parentsResult.rows || []).map((row: any) => ({
        id: row.id,
        name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        role: 'Parent',
        phone: row.phone,
        profilePhoto: row.profile_photo,
        studentId: row.student_id,
        studentName: row.student_name
      }));
    } else if (userRole === 'Parent') {
      // Get teachers of parent's children
      const teachersResult = await db.execute(sql`
        SELECT DISTINCT u.id, u.first_name, u.last_name, u.phone, u.profile_photo, u.role,
               s.name as subject_name, c.name as class_name,
               psr.student_id,
               (SELECT CONCAT(st.first_name, ' ', st.last_name) FROM users st WHERE st.id = psr.student_id) as student_name
        FROM users u
        INNER JOIN teacher_subject_assignments tsa ON tsa.teacher_id = u.id
        INNER JOIN classes c ON c.id = tsa.class_id
        INNER JOIN enrollments e ON e.class_id = c.id
        INNER JOIN parent_student_relations psr ON psr.student_id = e.student_id
        LEFT JOIN subjects s ON s.id = tsa.subject_id
        WHERE psr.parent_id = ${userId}
          AND u.role = 'Teacher'
        ORDER BY u.last_name, u.first_name
      `);
      
      contacts = (teachersResult.rows || []).map((row: any) => ({
        id: row.id,
        name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        role: 'Teacher',
        phone: row.phone,
        profilePhoto: row.profile_photo,
        subject: row.subject_name,
        className: row.class_name,
        studentId: row.student_id,
        studentName: row.student_name
      }));
    }

    // Remove duplicates by user id
    const uniqueContacts = contacts.reduce((acc: any[], contact) => {
      if (!acc.find(c => c.id === contact.id)) {
        acc.push(contact);
      }
      return acc;
    }, []);

    res.json({ success: true, contacts: uniqueContacts });
  } catch (error) {
    console.error("[CHAT_API] Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

// ===== MARK MESSAGES AS READ =====
router.post("/conversations/:conversationId/read", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const conversationId = parseInt(req.params.conversationId);
    const userId = user.id;

    const convResult = await db.execute(sql`
      SELECT * FROM chat_conversations WHERE id = ${conversationId} LIMIT 1
    `);
    const conversation = convResult.rows?.[0] as any;

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.participant_one_id !== userId && conversation.participant_two_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Mark all unread messages as read
    await db.execute(sql`
      UPDATE chat_messages SET is_read = true, read_at = NOW()
      WHERE conversation_id = ${conversationId}
        AND sender_id != ${userId}
        AND is_read = false
    `);

    // Reset unread counter
    if (conversation.participant_one_id === userId) {
      await db.execute(sql`
        UPDATE chat_conversations SET participant_one_unread = 0
        WHERE id = ${conversationId}
      `);
    } else {
      await db.execute(sql`
        UPDATE chat_conversations SET participant_two_unread = 0
        WHERE id = ${conversationId}
      `);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[CHAT_API] Error marking messages as read:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

// ===== GET UNREAD COUNT =====
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.id;

    const result = await db.execute(sql`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN participant_one_id = ${userId} THEN participant_one_unread
            WHEN participant_two_id = ${userId} THEN participant_two_unread
            ELSE 0
          END
        ), 0) as total_unread
      FROM chat_conversations
      WHERE participant_one_id = ${userId} OR participant_two_id = ${userId}
    `);

    const totalUnread = (result.rows?.[0] as any)?.total_unread || 0;

    res.json({ success: true, unreadCount: parseInt(totalUnread) });
  } catch (error) {
    console.error("[CHAT_API] Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Erreur serveur / Server error" });
  }
});

export default router;
