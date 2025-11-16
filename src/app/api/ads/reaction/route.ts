// /api/ads/reaction.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Ad from "@/app/models/Ads";
import { v4 as uuidv4 } from "uuid";

// ---------------- TYPES ----------------
interface Comment {
  _id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: Date;
  likes: string[];
  replies: Comment[];
}

interface AdDoc {
  _id: string;
  likes: string[];
  comments: Comment[];
  shares: number;
  save: () => Promise<void>;
}

// ---------------- HELPER ----------------
const addReplyToComment = (comments: Comment[], replyToId: string, reply: Comment): boolean => {
  for (const c of comments) {
    if (c._id === replyToId) {
      c.replies.push(reply);
      return true;
    }
    if (c.replies.length && addReplyToComment(c.replies, replyToId, reply)) return true;
  }
  return false;
};

const toggleCommentLikeRecursive = (comments: Comment[], commentId: string, userId: string): boolean => {
  for (const c of comments) {
    if (c._id === commentId) {
      if (c.likes.includes(userId)) c.likes = c.likes.filter(id => id !== userId);
      else c.likes.push(userId);
      return true;
    }
    if (c.replies.length && toggleCommentLikeRecursive(c.replies, commentId, userId)) return true;
  }
  return false;
};

// ---------------- HANDLER ----------------
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { adId, action, userId, text, username, avatar, replyTo, commentId }: {
      adId: string;
      action: 'like' | 'comment' | 'comment_like' | 'share';
      userId?: string;
      text?: string;
      username?: string;
      avatar?: string;
      replyTo?: string;
      commentId?: string;
    } = await req.json();

    if (!adId || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const ad = (await Ad.findById(adId)) as unknown as AdDoc;
    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });

    // ---------------- LIKE / UNLIKE AD ----------------
    if (action === 'like') {
      if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

      let liked = false;
      if (ad.likes.includes(userId)) {
        ad.likes = ad.likes.filter(id => id !== userId);
      } else {
        ad.likes.push(userId);
        liked = true;
      }

      await ad.save();
      return NextResponse.json({ likes: ad.likes, liked });
    }

    // ---------------- COMMENT / REPLY ----------------
    if (action === 'comment') {
      if (!userId || !username || !text) {
        return NextResponse.json({ error: "Comment data missing" }, { status: 400 });
      }

      const newComment: Comment = {
        _id: uuidv4(),
        userId,
        username,
        avatar: avatar || "avatar.png",
        text,
        createdAt: new Date(),
        likes: [],
        replies: [],
      };

      if (replyTo) {
        addReplyToComment(ad.comments, replyTo, newComment);
      } else {
        ad.comments.push(newComment);
      }

      await ad.save();
      return NextResponse.json({ success: true, comments: ad.comments });
    }

    // ---------------- COMMENT LIKE ----------------
    if (action === 'comment_like') {
      if (!userId || !commentId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

      toggleCommentLikeRecursive(ad.comments, commentId, userId);
      await ad.save();
      return NextResponse.json({ success: true, comments: ad.comments });
    }

    // ---------------- SHARE ----------------
    if (action === 'share') {
      ad.shares = (ad.shares || 0) + 1;
      await ad.save();
      return NextResponse.json({ shares: ad.shares });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error("❌ Reaction error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
