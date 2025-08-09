import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function ChatList() {
    const navigate = useNavigate();
    const { wa_id, receiver_wa_id } = useParams();
    const [chatList, setChatList] = useState([]);
    const [hovered, setHovered] = useState(false);
    const handleClick = () => {
        navigate('/');
    };
    useEffect(() => {
        const storedNumber = localStorage.getItem("wa_id");

        if (!storedNumber || storedNumber !== wa_id) {
            // No login session → send to login
            navigate("/home");
            return;
        }

    }, [wa_id, navigate]);
    useEffect(() => {
        if (wa_id) {
            axios.get(`https://whatsapp-backend-24ry.onrender.com/chats/${wa_id}`)
                .then((res) => {
                    setChatList(res.data);
                })
                .catch((err) => {
                    console.error('Failed to load chats', err);
                });
        }
    }, [wa_id]);

    const handleChatClick = (receiverId, receiverName) => {
        const encodedName = encodeURIComponent(receiverName);
        navigate(`/chat/${wa_id}/${receiverId}/${encodedName}`);
    };

    return (
        <div className="w-full   h-full overflow-y-auto bg-white">

            <div
                className="p-4 border-b bg-green-600 text-white text-lg font-bold flex gap-3 items-center cursor-pointer"

            >
                <img onClick={handleClick}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="Chat Application Logo"
                    className="w-10 h-10 opacity-70 transition-opacity duration-300 hover:opacity-90"
                />
                {hovered ? 'Navigate to Home' : 'Chats'}
            </div>
            {chatList.length === 0 ? (
                <p className="p-4 text-center text-gray-600">No chats available</p>
            ) : (
                chatList.map((chat) => (
                    <div
                        key={chat.receiver_wa_id}
                        onClick={() => handleChatClick(chat.receiver_wa_id, chat.name)}
                        className={`px-2 py-4 cursor-pointer border-b hover:bg-gray-100 flex gap-2 items-start ${chat.receiver_wa_id === receiver_wa_id ? 'bg-gray-200' : ''
                            }`}
                    >
                        {/* Initial Logo */}
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-green-600 font-bold text-lg uppercase flex-shrink-0">
                            {chat.name?.charAt(0)}
                        </div>

                        {/* Name and Message */}
                        <div className="flex-1 min-w-0">
                            {/* Name + Time */}
                            <div className="flex justify-between items-center min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                                <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                                    {chat.timestamp
                                        ? new Date(chat.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : ''}
                                </span>
                            </div>

                            {/* Last Message */}
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                        </div>
                    </div>

                ))
            )}
        </div>
    );
}

export default ChatList;
