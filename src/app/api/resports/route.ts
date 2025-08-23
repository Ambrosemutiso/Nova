import {dbConnect} from "@/lib/dbConnect";
import { Report } from "@/app/models/report";

export async function GET() {
  try {
    await dbConnect();
    const reports = await Report.find();
    return new Response(JSON.stringify(reports), { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reports" }), { status: 500 });
  }
}
