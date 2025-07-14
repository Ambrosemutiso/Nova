import Chat from '@/components/Chat';

interface ChatPageProps {
  params: { sellerId: string };
}

const ChatPage = ({ params }: ChatPageProps) => {
  const current = JSON.parse(
    localStorage.getItem('sellerUser') || localStorage.getItem('user') || '{}'
  );
  const { sellerId } = params;

  return <Chat userId={current._id} peerId={sellerId} />;
};

export default ChatPage;
