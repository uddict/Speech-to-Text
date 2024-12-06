import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const Visualizer = ({ isRecording }) => {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeWaveSurfer = async () => {
      try {
        const wavesurfer = WaveSurfer.create({
          container: containerRef.current,
          height: 100,
          waveColor: '#6781ff',
          progressColor: '#4254b5',
          cursorColor: 'transparent',
          barWidth: 2,
          barGap: 1,
          barRadius: 3,
          normalize: true,
          interact: false
        });

        wavesurferRef.current = wavesurfer;
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing WaveSurfer:', error);
      }
    };

    initializeWaveSurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const startVisualization = async () => {
      if (!isReady || !wavesurferRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Create AudioContext and Analyser
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;

        // Connect source to analyser
        source.connect(analyserRef.current);

        // Start animation
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = containerRef.current;
        const canvasCtx = canvas.getContext('2d');
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const draw = () => {
          animationRef.current = requestAnimationFrame(draw);

          analyserRef.current.getByteTimeDomainData(dataArray);
          canvasCtx.fillStyle = 'rgb(237, 245, 255)';
          canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = '#6781ff';
          canvasCtx.beginPath();

          const sliceWidth = WIDTH / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * HEIGHT) / 2;

            if (i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          canvasCtx.lineTo(WIDTH, HEIGHT / 2);
          canvasCtx.stroke();
        };

        draw();
      } catch (error) {
        console.error('Error starting visualization:', error);
      }
    };

    const stopVisualization = () => {
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } catch (error) {
        console.error('Error stopping visualization:', error);
      }
    };

    if (isRecording) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isRecording, isReady]);

  return (
    <div className="w-full min-h-[190px] flex items-center justify-center max-w-md bg-gradient-to-r from-[#9DCEFF]/30 to-[#92A3FD]/30 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
      <canvas
        ref={containerRef}
        width="500"
        height="100"
        className="w-full h-full"
      />
    </div>
  );
};

export default Visualizer; 