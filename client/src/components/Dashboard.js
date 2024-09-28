import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import Cards from 'react-credit-cards';
import '../allCss/Dashboard.css'; // Подключаем стили
import 'react-phone-input-2/lib/style.css';
import 'react-credit-cards/es/styles-compiled.css';

function Dashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [bookedTransports, setBookedTransports] = useState([]);

  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [showCardForm, setShowCardForm] = useState(false);

  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser._id) {
          const response = await axios.get(`http://localhost:5000/api/users/${storedUser._id}`);
          const updatedUser = response.data;
          setUser(updatedUser);
          setPhone(updatedUser.phone || '');
          setEmail(updatedUser.email || '');

          if (updatedUser.cardDetails) {
            setCardDetails({
              number: updatedUser.cardDetails.cardNumber || '',
              name: updatedUser.cardDetails.cardName || '',
              expiry: updatedUser.cardDetails.cardExpiry || '',
              cvc: updatedUser.cardDetails.cardCvc || '',
            });
          }

          const transportResponse = await axios.get(`http://localhost:5000/api/transports/booked/${updatedUser._id}`);
          setBookedTransports(transportResponse.data);

          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleCancelBooking = async (transportId) => {
    try {
      const userId = user._id;
      await axios.post(`http://localhost:5000/api/transports/cancel/${transportId}`, { userId });
      const transportResponse = await axios.get(`http://localhost:5000/api/transports/booked/${userId}`);
      setBookedTransports(transportResponse.data);
    } catch (error) {
      console.error('Ошибка при отмене бронирования', error);
      alert('Ошибка при отмене бронирования');
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user._id) {
        alert('Ошибка: ID пользователя отсутствует.');
        return;
      }

      const updatedUser = { ...user, phone, email };
      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, updatedUser);

      setUser(response.data);
      setPhone(response.data.phone || '');
      localStorage.setItem('user', JSON.stringify(response.data));
      alert('Профиль обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      alert('Ошибка при сохранении данных.');
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleSaveCard = async () => {
    try {
      const updatedCardDetails = {
        cardNumber: cardDetails.number,
        cardExpiry: cardDetails.expiry,
        cardCvc: cardDetails.cvc,
        cardName: cardDetails.name,
      };

      await axios.put(`http://localhost:5000/api/users/updateCard/${user._id}`, updatedCardDetails);
      alert('Данные карты успешно сохранены!');
    } catch (error) {
      console.error('Ошибка при сохранении данных карты:', error);
      alert('Ошибка при сохранении данных карты.');
    }
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    const newBalance = balance + parseInt(depositAmount, 10);
    setBalance(newBalance);
    setDepositAmount('');
    localStorage.setItem('balance', newBalance);
  };

  return (
    <div className="dashboard-container">
      <h2 className='title'>Личный кабинет</h2>
      {user && (
        <div className="dashboard-content">
          <div className="left-section">
            <p className="dashboard-user-info"><strong>Имя:</strong> {user.name}</p>
  
            {/* Редактирование email */}
            <div className="dashboard-section">
              <p><strong>Email:</strong> {email}</p>
              {isEditingEmail ? (
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button onClick={handleSaveProfile}>Сохранить</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingEmail(true)}>Изменить</button>
              )}
            </div>
  
            {/* Редактирование телефона */}
            <div className="dashboard-section">
              <p><strong>Телефон:</strong> {phone || 'Нет данных'}</p>
              {isEditingPhone ? (
                <div>
                  <PhoneInput country={'ru'} value={phone} onChange={setPhone} />
                  <button onClick={handleSaveProfile}>Сохранить</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingPhone(true)}>Изменить</button>
              )}
            </div>
  
            {/* Привязка карты */}
            <h3 className="dashboard-section-header" onClick={() => setShowCardForm(!showCardForm)}>
              Привязка банковской карты
            </h3>
            {showCardForm && (
              <div className="dashboard-card-section">
                <Cards
                  number={cardDetails.number}
                  name={cardDetails.name}
                  expiry={cardDetails.expiry}
                  cvc={cardDetails.cvc}
                />
                <form className="dashboard-card-form">
                  <input
                    type="text"
                    name="number"
                    placeholder="Номер карты"
                    value={cardDetails.number}
                    onChange={handleCardInputChange}
                    maxLength="16"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Имя владельца"
                    value={cardDetails.name}
                    onChange={handleCardInputChange}
                  />
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MMYY"
                    value={cardDetails.expiry}
                    onChange={handleCardInputChange}
                    maxLength="4"
                  />
                  <input
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardDetails.cvc}
                    onChange={handleCardInputChange}
                    maxLength="3"
                  />
                  <button type="button" onClick={handleSaveCard}>Привязать карту</button>
                </form>
              </div>
            )}
          </div>
  
          <div className="right-section">
            {/* Кошелек */}
            <h3 className="dashboard-section-header">Ваш кошелек</h3>
            <p>Текущий баланс: {balance} руб.</p>
            <form onSubmit={handleDeposit} className="dashboard-deposit-form">
              <label>Сумма пополнения:</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button type="submit">Пополнить баланс</button>
            </form>
  
            {/* Забронированный транспорт */}
            <h3 className="dashboard-section-header">Ваш забронированный транспорт</h3>
            {bookedTransports.length > 0 ? (
              bookedTransports.map((transport) => (
                <div key={transport._id} className="dashboard-transport-item">
                  <p>{transport.name}</p>
                  <button onClick={() => handleCancelBooking(transport._id)}>Отменить бронирование</button>
                </div>
              ))
            ) : (
              <p>Нет забронированного транспорта.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;

