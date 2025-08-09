import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatbg from '../images/chatbg.png';
import axios from 'axios';
import { FaArrowLeft, FaPaperPlane, FaSmile, FaPaperclip, FaCheck, FaCheckDouble } from "react-icons/fa";
import Picker from 'emoji-picker-react';
function MessageArea({ receiverId, receiverName }) {
    const { wa_id, receiver_wa_id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    useEffect(() => {
        const storedNumber = localStorage.getItem("wa_id");

        if (!storedNumber || storedNumber !== wa_id) {
            // No login session → send to login
            navigate("/home");
            return;
        }

    }, [wa_id, navigate]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                !event.target.closest(".emoji-toggle-btn")
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (wa_id && receiver_wa_id) {
            axios.get(`https://whatsapp-backend-24ry.onrender.com/conversation/${wa_id}/${receiver_wa_id}`)
                .then((res) => {
                    setMessages(res.data);
                })
                .catch((err) => {
                    console.error('Error fetching conversation:', err);
                });
        }
    }, [wa_id, receiver_wa_id]);

    // Function to update message status on backend
    const updateMessageStatus = async (messageId, newStatus) => {
        try {
            await axios.put(`https://whatsapp-backend-24ry.onrender.com/update-message/${messageId}`, {
                status: newStatus
            });
        } catch (error) {
            console.error(`Error updating message status to ${newStatus}:`, error);
        }
    };

    // Function to update message status in local state
    const updateLocalMessageStatus = (messageId, newStatus) => {
        setMessages(prev => prev.map(msg =>
            msg._id === messageId ? { ...msg, status: newStatus } : msg
        ));
    };

    const handleBack = () => {
        navigate(`/chat/${wa_id}`);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        // Declare tempMessage outside try block so it's accessible in catch block
        let tempMessage;
        let messageId;

        try {
            const senderName = localStorage.getItem('name'); // from localStorage
            const timestamp = new Date().toISOString();
            const messageData = {
                wa_id: wa_id,
                name: senderName,
                receiver_wa_id: receiver_wa_id,
                receiver_name: receiverName,
                content: newMessage.trim(),
                timestamp: timestamp,
                status: "sent",
            };

            // Add message to local state immediately for better UX
            tempMessage = {
                ...messageData,
                _id: `temp-${Date.now()}` // Temporary ID until we get the real one from backend
            };
            setMessages(prev => [...prev, tempMessage]);

            // Clear input immediately for better UX
            setNewMessage('');

            // Send to backend
            const response = await axios.post('https://whatsapp-backend-24ry.onrender.com/send-message', messageData);

            // Get the real message ID from backend response
            messageId = response.data._id || response.data.id;
            // Update the temporary message with the real ID
            if (messageId) {
                setMessages(prev => prev.map(msg =>
                    msg._id === tempMessage._id ? { ...msg, _id: messageId } : msg
                ));

                // Set up automatic status updates
                // After 1.5 seconds: sent -> delivered
                setTimeout(() => {
                    updateLocalMessageStatus(messageId, "delivered");
                }, 1500);

                // After 3 seconds total: delivered -> read
                setTimeout(() => {
                    updateLocalMessageStatus(messageId, "read");
                    updateMessageStatus(messageId, "read");
                }, 3000);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            // Remove the failed message from local state
            if (tempMessage) {
                setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
            }
            // Restore the message in input if sending failed
            setNewMessage(newMessage);
        } finally {
            setIsSending(false);
        }

        // Play sound
        const audio = new Audio('/send-tone.mp3');
        audio.play();

        // Your send logic here...
        console.log("Message Sent");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size must be less than 10MB');
                return;
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sender_wa_id', wa_id);
            formData.append('receiver_wa_id', receiver_wa_id);

            event.target.value = '';
        }
    };

    return (
        <div
            className="w-full h-full flex flex-col bg-cover bg-center"
            style={{ backgroundImage: `url(${chatbg})` }}
        >
            {/* WhatsApp-style Header with Initial Logo */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#f0f2f5] border-b border-gray-300 shadow-sm sticky top-0 z-10">
                {/* Back Button (only on mobile) */}
                <button
                    onClick={handleBack}
                    className="cursor-pointer md:hidden text-gray-600 hover:text-gray-800 text-xl"
                >
                    <FaArrowLeft />
                </button>

                {/* Logo: First Letter of Name */}
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg uppercase">
                    {receiverName?.charAt(0)}
                </div>

                {/* Name and ID */}
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{receiverName}</span>
                    <span className="text-xs text-gray-600">+91 {receiverId}</span>
                </div>
            </div>



            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, index) => {
                    const isSender = msg.wa_id === wa_id; // ✅ Sender is current user

                    return (
                        <div
                            key={msg._id || `${msg.wa_id}-${msg.timestamp || index}`}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`p-3 rounded-lg max-w-xs lg:max-w-md relative ${isSender
                                    ? 'bg-[#dcf8c6] text-gray-800' // Right side (sender)
                                    : 'bg-white text-gray-800 shadow-sm' // Left side (receiver)
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div className="text-xs text-gray-500 text-right mt-1 flex justify-end items-center gap-1">
                                    <span>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isSender && (
                                        <>
                                            {msg.status === "read" ? (
                                                <div>
                                                    <span className="inline-block w-3 h-2 border-r-2 border-b-2 scale-x-[-1] transform -rotate-45 ml-1 border-blue-500 "></span>
                                                    <span className="inline-block w-3 h-2 border-r-2 border-b-2 scale-x-[-1] transform -rotate-45 ml-1 border-blue-500 "></span>
                                                </div>
                                            ) : msg.status === "delivered" ? (
                                                <div>
                                                    <span className="inline-block w-3 h-2 border-r-2 border-b-2 scale-x-[-1] transform -rotate-45 ml-1 border-gray-500"></span>
                                                    <span className="inline-block w-3 h-2 border-r-2 border-b-2 scale-x-[-1] transform -rotate-45 ml-1 border-gray-500"></span>
                                                </div>) : (
                                                <span className="inline-block w-3 h-2 border-r-2 border-b-2 scale-x-[-1] transform -rotate-45 ml-1 border-gray-500"></span>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>



            {/* Chat Input Bar */}
            <div className="p-2 sm:p-4 bg-[#f0f2f5] border-t border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="*/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {/* Attachment Button */}
                    <button
                        onClick={handleFileButtonClick}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Attach file"
                    >
                        <FaPaperclip className="text-lg sm:text-xl cursor-pointer" />
                    </button>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);

                                // Typing sound
                                const typingAudio = new Audio('/mixkit-hard-single-key-press-in-a-laptop-2542.wav');
                                typingAudio.volume = 0.2;
                                typingAudio.play().catch(() => { });
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 bg-white rounded-full border border-gray-300 focus:outline-none focus:border-green-500 resize-none max-h-32 min-h-[40px] text-sm sm:text-base"
                            rows="1"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                        />

                        {/* Emoji Picker Popup */}
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
                                className="absolute bottom-12 right-0 z-50 w-70 sm:w-auto"
                            >
                                {/* Mobile full width picker */}
                                <div className="sm:hidden fixed bottom-80 w-70 mx-2 left-0  max-h-50  place-items-center rounded-2xl  bg-white border border-gray-100 z-[999]">
                                    <Picker
                                        width="100%"
                                        onEmojiClick={(emojiData) => {
                                            setNewMessage((prev) => prev + emojiData.emoji);
                                        }}
                                    />
                                </div>

                                {/* Desktop floating picker */}
                                <div className="hidden sm:block">
                                    <Picker
                                        onEmojiClick={(emojiData) => {
                                            setNewMessage((prev) => prev + emojiData.emoji);
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Emoji Button */}
                        <button
                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors emoji-toggle-btn"
                        >
                            <FaSmile className="text-lg sm:text-xl cursor-pointer" />
                        </button>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={() => {
                            handleSendMessage();
                            setShowEmojiPicker(false); // close picker on send
                        }}
                        disabled={!newMessage.trim() || isSending}
                        className={`p-2 sm:p-3 rounded-full transition-all ${newMessage.trim() && !isSending
                            ? 'bg-[#25d366] hover:bg-[#1da851] text-white shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <FaPaperPlane className="text-base sm:text-lg cursor-pointer rotate-45 transform translate-x-[1px] translate-y-[-1px]" />
                    </button>
                </div>
            </div>



        </div>
    );
}

export default MessageArea;