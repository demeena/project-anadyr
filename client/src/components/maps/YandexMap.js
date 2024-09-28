import React, { useEffect, useCallback, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../allCss/YandexMap.css'; // Путь от папки components/maps до allCss


const socket = io('http://localhost:5000'); // Подключаемся к серверу

const loadYandexMaps = () => {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('yandex-maps-script');

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'yandex-maps-script';
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=08ba13f5-9c1f-4096-a883-a491a452d2c3'; // Вставь свой API ключ
      script.onload = () => {
        if (window.ymaps) {
          resolve(window.ymaps);
        } else {
          reject('ymaps не определён');
        }
      };
      script.onerror = () => reject('Ошибка загрузки скрипта ymaps');
      document.head.appendChild(script);
    } else {
      if (window.ymaps) {
        resolve(window.ymaps);
      } else {
        existingScript.addEventListener('load', () => {
          if (window.ymaps) {
            resolve(window.ymaps);
          } else {
            reject('ymaps не определён после загрузки существующего скрипта');
          }
        });
      }
    }
  });
};

const YandexMap = () => {
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  const [transports, setTransports] = useState([]);
  const mapRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);

  const fetchTransports = useCallback(() => {
    axios.get('http://localhost:5000/api/transports')
      .then(({ data }) => {
        const availableTransports = data.filter(transport => transport.status === 'available');
        setTransports(availableTransports);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке транспортных средств:', error);
      });
  }, []);

  const handleBooking = useCallback(async (transportId) => {
    try {
      await axios.post(`http://localhost:5000/api/transports/book/${transportId}`, { userId });
      fetchTransports();
      alert('Транспорт успешно забронирован');
    } catch (error) {
      console.error('Ошибка при бронировании:', error);
      alert('Ошибка при бронировании транспорта');
    }
  }, [userId, fetchTransports]);

  const updateMapPlacemarks = useCallback((allTransports) => {
    if (mapRef.current) {
      mapRef.current.geoObjects.removeAll(); // Удаляем все предыдущие точки

      allTransports.forEach((transport) => {
        if (transport.status === 'available') {
          const placemark = new window.ymaps.Placemark(transport.coords, {
            balloonContent: `
              <strong>${transport.name}</strong><br/>
              ${transport.description}<br/>
              <button id="book-transport-${transport._id}" class="booking-button">Забронировать</button>
            `,
          });

          placemark.transportId = transport._id;

          placemark.events.add('balloonopen', () => {
            const button = document.getElementById(`book-transport-${transport._id}`);
            if (button) {
              button.addEventListener('click', () => {
                handleBooking(transport._id);
              });
            }
          });

          mapRef.current.geoObjects.add(placemark);
        }
      });
    }
  }, [handleBooking]);

  useEffect(() => {
    loadYandexMaps()
      .then((ymaps) => {
        ymaps.ready(() => {
          if (!mapRef.current) {
            mapRef.current = new ymaps.Map('map', {
              center: [64.7333, 177.5167],
              zoom: 13,
            });
          }
          fetchTransports();
        });
      })
      .catch((error) => {
        console.error('Ошибка при загрузке API Яндекс.Карт:', error);
      });
  }, [fetchTransports]);

  useEffect(() => {
    if (selectedType && mapRef.current) {
      const filteredTransports = transports.filter(transport => transport.name === selectedType);
      updateMapPlacemarks(filteredTransports);

      if (filteredTransports.length > 0) {
        mapRef.current.setCenter(filteredTransports[0].coords, 13);
      }
    }
  }, [transports, selectedType, handleBooking, updateMapPlacemarks]);

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  useEffect(() => {
    socket.on('transportUpdated', (updatedTransport) => {
      setTransports((prevTransports) => {
        const updatedTransports = prevTransports.map((transport) =>
          transport._id === updatedTransport._id ? updatedTransport : transport
        );

        const availableTransports = updatedTransports.filter(transport => transport.status === 'available');
        updateMapPlacemarks(availableTransports);

        return updatedTransports;
      });
    });

    return () => {
      socket.off('transportUpdated');
    };
  }, [updateMapPlacemarks]);

  return (
    <div className="map-container">
      <div id="map"></div>

      <div className="map-filters">
        <div
          className={`map-filter-item ${selectedType === 'Автомобиль' ? 'active' : ''}`}
          onClick={() => handleTypeClick('Автомобиль')}
        >
          <h3>Автомобили</h3>
          <p>Доступно: {transports.filter(transport => transport.name === 'Автомобиль' && transport.status === 'available').length} шт.</p>
        </div>
        <div
          className={`map-filter-item ${selectedType === 'Велосипед' ? 'active' : ''}`}
          onClick={() => handleTypeClick('Велосипед')}
        >
          <h3>Велосипеды</h3>
          <p>Доступно: {transports.filter(transport => transport.name === 'Велосипед' && transport.status === 'available').length} шт.</p>
        </div>
      </div>
    </div>
  );
};

export default YandexMap;
