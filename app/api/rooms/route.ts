import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = "API3XxQuAVkxBbo";
    const API_SECRET = "he3SYucgdqqO1DerNDJfxxSNfDNCf1PjJNxCFBfKRl9L";
    const LIVEKIT_URL = "wss://livekit.lemigo.xyz";

    if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
      return new NextResponse('LiveKit config is missing', { status: 500 });
    }

    const roomService = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET);
    
    // Fetch active rooms from the LiveKit server
    const rooms = await roomService.listRooms();
    
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
