import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Ad from "@/app/models/Ads";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { adId, action, userId, text, username } = await req.json();
    if (!adId || !action) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const ad = await Ad.findById(adId);
    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });

    // LIKE / UNLIKE
    if (action === "like") {
      if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

      if (ad.likedBy.includes(userId)) {
        ad.likedBy = ad.likedBy.filter((id: string) => id !== userId);
        ad.likes--;
      } else {
        ad.likedBy.push(userId);
        ad.likes++;
      }
      await ad.save();
      return NextResponse.json({ likes: ad.likes, liked: ad.likedBy.includes(userId) });
    }

    // COMMENT
    if (action === "comment") {
      if (!text) return NextResponse.json({ error: "Comment text missing" }, { status: 400 });

      ad.comments.push({ userId, username, text });
      await ad.save();

      return NextResponse.json({ success: true, comments: ad.comments });
    }

    // FETCH COMMENTS
    if (action === "fetch_comments") {
      return NextResponse.json({ comments: ad.comments });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error("❌ Reaction error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
