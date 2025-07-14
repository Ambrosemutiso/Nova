import Chat from '@/components/Chat';

interface ChatPageProps {
  params: { userId: string };
}

const ChatPage = ({ params }: ChatPageProps) => {
  const current = JSON.parse(
    localStorage.getItem('sellerUser') || localStorage.getItem('user') || '{}'
  );
  const { userId } = params;

  return <Chat userId={current._id} peerId={userId} />;
};

export default ChatPage;
