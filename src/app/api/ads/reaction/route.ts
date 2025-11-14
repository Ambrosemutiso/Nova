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
  save: () => Promise<void>;
}

// ---------------- HANDLER ----------------
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { adId, action, userId, text, username, avatar, replyTo }: {
      adId: string;
      action: "like" | "comment" | "fetch_comments";
      userId?: string;
      text?: string;
      username?: string;
      avatar?: string;
      replyTo?: string;
    } = await req.json();

    if (!adId || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const ad = (await Ad.findById(adId)) as unknown as AdDoc;
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // ---------------- LIKE / UNLIKE ----------------
    if (action === "like") {
      if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

      if (ad.likes.includes(userId)) {
        ad.likes = ad.likes.filter((id: string) => id !== userId);
      } else {
        ad.likes.push(userId);
      }

      await ad.save();
      return NextResponse.json({ likes: ad.likes, liked: ad.likes.includes(userId) });
    }

    // ---------------- COMMENT / REPLY ----------------
    if (action === "comment") {
      if (!text || !userId || !username) {
        return NextResponse.json({ error: "Comment data missing" }, { status: 400 });
      }

      const newComment: Comment = {
        _id: uuidv4(),
        userId,
        username,
        avatar: avatar || "https://via.placeholder.com/40",
        text,
        createdAt: new Date(),
        likes: [],
        replies: [],
      };

      // If replying to another comment
      if (replyTo) {
        const addReply = (comments: Comment[]): boolean => {
          for (const c of comments) {
            if (c._id === replyTo) {
              c.replies.push(newComment);
              return true;
            }
            if (c.replies.length && addReply(c.replies)) return true;
          }
          return false;
        };
        addReply(ad.comments);
      } else {
        ad.comments.push(newComment);
      }

      await ad.save();
      return NextResponse.json({ success: true, comments: ad.comments });
    }

    // ---------------- FETCH COMMENTS ----------------
    if (action === "fetch_comments") {
      return NextResponse.json({ comments: ad.comments });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("❌ Reaction error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
