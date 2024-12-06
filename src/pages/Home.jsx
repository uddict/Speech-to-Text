import React, { useRef, useState, useEffect } from "react";
import { RecordButton } from "../components/RecordButton";
import { Alert, AlertDescription } from "../components/ui/Alert";
import Navbar from "../components/Navbar";
import Visualizer from '../components/Visualizer';

function Home() {
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [format, setFormat] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [audioData, setAudioData] = useState(new Uint8Array(0));

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript = transcript;
          } else {
            currentInterim = transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript) {
          setTranscription(prev => {
            const newText = prev ? `${prev} ${finalTranscript}` : finalTranscript;
            setInterimTranscript('');
            return newText;
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError("Speech recognition error: " + event.error);
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };
    } else {
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  const drawVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(237, 245, 255)';
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#6781ff';
      canvasCtx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(width, height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const startRecording = async () => {
    setError("");
    setInterimTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyser
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 2048;
      
      setAudioContext(audioCtx);
      analyserRef.current = analyser;
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        drawVisualization();
      }
    } catch (err) {
      setError("Error starting speech recognition: " + err.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimTranscript('');
      
      // Clean up visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleExtract = () => {
    console.log(`Extracting in ${format} format:`, transcription);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="h-[90vh] w-screen flex justify-center items-center py-6">
        <div className="mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 h-[600px]">
            {/* Visualizer Card */}
            <div className="min-w-[300px] md:min-w-[400px] border border-[#9DCEFF] bg-[#ecf5ff] bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col justify-between h-full">
              <div className="bg-gradient-to-r from-[#61b0ff] to-[#6881fd] text-white text-center py-2 rounded-md">
                <h2 className="text-xl font-semibold">Audio Recorder</h2>
              </div>
              
              {/* Audio Visualization */}
              <Visualizer isRecording={isRecording} />

              <div className="mt-2 flex flex-col items-center">
                <RecordButton
                  onClick={handleRecordToggle}
                  isRecording={isRecording}
                  disabled={isProcessing}
                />
                <p className="mt-1 italic text-sm bg-gradient-to-r from-[#0080ff] to-[#002aff] bg-clip-text text-transparent">
                  {isProcessing
                    ? "Processing..."
                    : isRecording
                    ? "Recording..."
                    : "Click to start recording"}
                </p>
              </div>
            </div>

            {/* Transcription Card */}
            <div className="min-w-[400px] md:w-[800px] bg-gradient-to-r from-[#9DCEFF]/30 to-[#92A3FD]/30 bg-opacity-80 backdrop-blur-md border border-[#9DCEFF] rounded-lg shadow-lg p-6 flex flex-col h-full">
              <div className="bg-gradient-to-r from-[#61b0ff] to-[#6881fd] text-white text-center py-2 rounded-md">
                <h2 className="text-xl font-semibold">Real-Time Transcription</h2>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <textarea
                className="w-full h-full mt-4 p-4 bg-white border border-indigo-300 rounded-lg resize-none"
                value={`${transcription}${interimTranscript ? ' ' + interimTranscript : ''}`}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Your transcription will appear here in real-time..."
                readOnly={isProcessing}
              />
              <div className="flex justify-center items-center gap-24 mt-6">
                <div className="flex items-center gap-8">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="SOAP"
                      checked={format === "SOAP"}
                      onChange={(e) => setFormat(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-gray-700 font-medium">SOAP</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="Progress"
                      checked={format === "Progress"}
                      onChange={(e) => setFormat(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-gray-700 font-medium">Progress</span>
                  </label>
                </div>
                <button 
                  onClick={handleExtract}
                  disabled={!format}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors
                    ${!format ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Extract
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 