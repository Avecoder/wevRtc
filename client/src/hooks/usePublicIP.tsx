import { useState, useEffect } from 'react';

const usePublicIP = () => {
  const [offer, setOffer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPublicIP = async () => {
      try {
        const offer = await new Promise<any>((resolve, reject) => {
          const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun2.l.google.com:5349' }] // Используем STUN-сервер Google
          });



          peerConnection.createDataChannel('');
          peerConnection.createOffer()
            .then((offer) => resolve(offer))
            .catch((error) => reject(error));
        });

        setOffer(offer); // Устанавливаем IP-адрес
      } catch (err) {
        setError('Не удалось получить публичный IP.');
        console.error(err);
      }
    };

    getPublicIP();
  }, []);

  // Функция для извлечения IP из кандидата
  const extractIPFromCandidate = (candidate: string): string | null => {
    const match = candidate.match(/candidate:.+ (\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  };

  return { offer, error };
};

export default usePublicIP;
