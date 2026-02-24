import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LoginPage.css';
import Logo from '../assets/vibha-logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            toast.error('Incorrect email or password');
        }
    };

    return (
        <div className="auth-screen">
            <ToastContainer />
            <div className="auth-box">
                <div className="auth-box-inner">

                    {/* ⭐ LOGO */}
                    <div className="auth-logo-box">
                        <img src={Logo} alt="Logo" className="auth-logo" />
                    </div>

                    <h4 className="auth-title">BILLING SOFTWARE</h4>

                    <div className="auth-section-title">
                        <span>LOGIN</span>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="auth-group auth-input-group">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="auth-input"
                            />
                            <label htmlFor="email" className="auth-label">
                                Email <span className="required-star">*</span>
                            </label>
                        </div>

                        <div className="auth-group auth-input-group">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="auth-input"
                            />
                            <label htmlFor="password" className="auth-label">
                                Password <span className="required-star">*</span>
                            </label>
                        </div>

                        <button type="submit" className="auth-btn">Login</button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Login;
