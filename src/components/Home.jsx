// src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [waId, setWaId] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (waId.trim() === '') return;

        try {
            const response = await fetch(`https://whatsapp-backend-24ry.onrender.com/check-user/${waId}`);
            const data = await response.json();

            if (response.ok && data.exists) {
                localStorage.setItem('wa_id', waId);
                localStorage.setItem('name', data.name);
                navigate(`/chat/${waId}`);
            } else {
                setError('WA ID not found. Please enter a valid one.');
            }
        } catch (err) {
            console.error('Error checking WA ID:', err);
            setError('Something went wrong. Try again later.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <form
                onSubmit={handleSubmit}
                className="bg-blue-50 p-6 rounded shadow-md space-y-4 w-full max-w-sm"
            >
                <h2 className="text-xl font-bold text-center">
                    Enter your Whatsapp No.
                    <p className="text-sm font-normal text-gray-600 mt-1">
                        (For demo, try <span className="font-semibold text-black">9999900001</span>)
                    </p>
                </h2>


                <input
                    type="text"
                    placeholder="Enter WA ID"
                    value={waId}
                    onChange={(e) => {
                        setWaId(e.target.value);
                        setError('');
                    }}
                    className="border p-2 rounded w-full"
                    required
                />
                <button
                    type="submit"
                    className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                >
                    Go to WhatsApp Web
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </form>
        </div>
    );
}

export default Home;
