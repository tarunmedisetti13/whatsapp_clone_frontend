import ChatList from './ChatList';
import MessageArea from './MessageArea';
import { useParams } from 'react-router-dom';

function ChatPage() {
    const { receiver_wa_id, receiver_name } = useParams();
    const decodedName = decodeURIComponent(receiver_name || '');

    return (
        <div className="h-screen flex flex-col md:flex-row">
            {/* ChatList Section */}
            <div
                className={`h-full w-full md:w-1/3 bg-gray-50 border-r-[1.4px] border-gray-300  ${receiver_wa_id ? 'hidden md:block' : 'block'
                    } md:flex md:flex-col`}
            >
                <div className="w-full h-full">
                    <ChatList className="w-full h-full" />
                </div>
            </div>

            {/* MessageArea Section */}
            <div
                className={`h-full w-full md:w-2/3 ${receiver_wa_id ? 'block' : 'hidden md:block'
                    } md:flex md:flex-col`}
            >
                {receiver_wa_id ? (
                    <MessageArea
                        receiverId={receiver_wa_id}
                        receiverName={decodedName}
                    />
                ) : (
                    <div className="flex  flex-col items-center justify-center text-gray-500 text-xl bg-gray-50 h-full">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            alt="Chat Application Logo"
                            className="w-20 2-10 opacity-70 transition-opacity duration-300 hover:opacity-90"
                        />
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
