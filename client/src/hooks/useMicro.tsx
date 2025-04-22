

import { useEffect, useState } from 'react'

export const useMicro = () => {
    const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null)

    useEffect(() => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            setAudioTrack(stream.getAudioTracks()[0])
        })
        .catch((err) => {
          console.error('Ошибка при доступе к микрофону', err)
        })
    }, [])

    return {audioTrack}
}
