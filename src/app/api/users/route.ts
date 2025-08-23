import {dbConnect} from "@/lib/dbConnect";
import User from "@/app/models/user";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}
