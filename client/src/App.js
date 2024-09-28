import React from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; 
import ProtectedRoute from './components/ProtectedRoute';
import YandexMap from './components/maps/YandexMap';
import './allCss/Apps.css';


function App() {
  const token = localStorage.getItem('token'); // Проверяем, есть ли токен
  const navigate = useNavigate(); // Навигация

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); // Перенаправляем на страницу входа
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <ul className="nav-list">
          {!token ? (
            <>
              <li className="nav-item">
                <Link className="login-link" to="/login">Вход</Link> {/* Класс изменен на login-link */}
              </li>
              <li className="nav-item">
                <Link className="register-link" to="/register">Регистрация</Link> {/* Класс изменен на register-link */}
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="map-link" to="/map">Карта</Link> {/* Класс изменен на map-link */}
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={handleLogout}>Выйти</button> {/* Класс изменен на logout-btn */}
              </li>
            </>
          )}
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <YandexMap />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  return (
    <div className="home-page">
      <h1>Home Page</h1>
    </div>
  );
}

export default App;
