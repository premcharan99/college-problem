import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error message
    setErrorMessage('');

    // Validate form fields
    if (!username || !fullName || !universityName || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, universityName, password }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Registration successful!');
        navigate('/login'); // Navigate to login page after successful registration
      } else {
        setErrorMessage('Registration failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const cursor = document.querySelector('.custom-cursor');
    
    const handleMouseMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="sun-container">
        <div className="sun sun-1"></div>
        <div className="sun sun-2"></div>
        <div className="sun sun-3"></div>
        <div className="sun sun-4"></div>
        <div className="sun sun-5"></div>
        <div className="sun sun-6"></div>
        <div className="sun sun-7"></div>
        <div className="sun sun-8"></div>
        <div className="sun sun-9"></div>
        <div className="sun sun-10"></div>
        <div className="sun sun-11"></div>
        <div className="sun sun-12"></div>
        <div className="sun sun-13"></div>
        <div className="sun sun-14"></div>
        <div className="sun sun-15"></div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <label htmlFor="universityName">University Name:</label>
          <input
            type="text"
            id="universityName"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            placeholder="Enter your university name"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" className="register-button">Register</button>
      </form>
      <div className="cursor-container">
        <div className="custom-cursor"></div>
      </div>
    </div>
  );
}

export default Register;
