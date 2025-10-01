import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { dbConnect } from './lib/dbConnect';
import dotenv from 'dotenv';
import Message from './app/models/message';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  try {
    await dbConnect(); 
  } catch (err) {
    console.error('❌ MongoDB connection failed. Server not started.');
    process.exit(1);
  }

  const server = createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('📡 New client connected');

    socket.on('join', ({ userId }) => {
      socket.join(userId);
      console.log(`🟢 User ${userId} joined their private room`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      try {
        const savedMessage = await Message.create({ senderId, receiverId, message });
        io.to(receiverId).emit('receiveMessage', savedMessage);
        io.to(senderId).emit('receiveMessage', savedMessage); // echo back
      } catch (err) {
        console.error('❌ Error saving message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('❎ Client disconnected');
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});