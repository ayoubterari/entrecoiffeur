import React, { useState, useRef, useEffect } from 'react'
import './VoiceRecorder.css'

const VoiceRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        setHasRecording(true)
        onRecordingComplete(blob)
        
        // Arrêter tous les tracks du stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // Arrêter automatiquement après 5 minutes
          if (newTime >= 300) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
      
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error)
      alert('Impossible d\'accéder au microphone. Veuillez vérifier vos permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setHasRecording(false)
    setRecordingTime(0)
    setIsPlaying(false)
    onRecordingComplete(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="voice-recorder">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {!hasRecording ? (
        <div className="recording-controls">
          {!isRecording ? (
            <button
              type="button"
              className="record-btn"
              onClick={startRecording}
              disabled={disabled}
              title="Commencer l'enregistrement vocal"
            >
              <span className="record-icon">🎤</span>
              <span>Enregistrer un message vocal</span>
            </button>
          ) : (
            <div className="recording-active">
              <button
                type="button"
                className="stop-btn"
                onClick={stopRecording}
                title="Arrêter l'enregistrement"
              >
                <span className="stop-icon">⏹️</span>
                <span>Arrêter</span>
              </button>
              <div className="recording-info">
                <div className="recording-indicator">
                  <span className="pulse-dot"></span>
                  <span>Enregistrement en cours...</span>
                </div>
                <div className="recording-time">{formatTime(recordingTime)}</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="recording-preview">
          <div className="recording-header">
            <span className="audio-icon">🎵</span>
            <span>Message vocal enregistré ({formatTime(recordingTime)})</span>
          </div>
          <div className="recording-actions">
            <button
              type="button"
              className="play-btn"
              onClick={playRecording}
              disabled={isPlaying}
              title="Écouter l'enregistrement"
            >
              <span>{isPlaying ? '⏸️' : '▶️'}</span>
              <span>{isPlaying ? 'Lecture...' : 'Écouter'}</span>
            </button>
            <button
              type="button"
              className="delete-btn"
              onClick={deleteRecording}
              title="Supprimer l'enregistrement"
            >
              <span>🗑️</span>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="recording-tips">
          <p>💡 Parlez clairement près du microphone. Durée max : 5 minutes.</p>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
