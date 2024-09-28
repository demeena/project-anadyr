import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token'); // Проверяем, есть ли токен

  return token ? children : <Navigate to="/login" />; // Если токен есть, показываем контент, иначе перенаправляем на логин
}

export default ProtectedRoute;
