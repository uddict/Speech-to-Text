import React, { useRef, useState } from "react";
import { RecordButton } from "../components/RecordButton";

const VoiceInput = () => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const startRecording = async () => {
    setError("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          // Here you would normally send the audio for transcription
          // For now, we'll just simulate it
          setTimeout(() => {
            setTranscription("This is a sample transcription. Replace this with actual transcription logic.");
            setIsProcessing(false);
          }, 1000);
        } catch (err) {
          setError("Failed to transcribe audio: " + err.message);
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (err) {
      setError("Error accessing microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="bg-white min-h-screen w-full flex justify-center items-center py-6">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Recorder Card */}
          <div className="min-w-[300px] md:min-w-[400px] border border-[#9DCEFF] bg-[#ecf5ff] bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col justify-between">
            <div className="bg-gradient-to-r from-[#61b0ff] to-[#6881fd] text-white text-center py-2 rounded-md">
              <h2 className="text-xl font-semibold">Audio Recorder</h2>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <RecordButton
                onClick={handleRecordToggle}
                isRecording={isRecording}
                disabled={isProcessing}
              />
              <p className="mt-2 italic text-sm bg-gradient-to-r from-[#0080ff] to-[#002aff] bg-clip-text text-transparent">
                {isProcessing ? "Processing..." : isRecording ? "Recording..." : "Click to start recording"}
              </p>
            </div>
          </div>

          {/* Transcription Card */}
          <div className="min-w-[400px] md:w-[800px] bg-gradient-to-r from-[#9DCEFF]/30 to-[#92A3FD]/30 bg-opacity-80 backdrop-blur-md border border-[#9DCEFF] rounded-lg shadow-lg p-6 flex flex-col">
            <div className="bg-gradient-to-r from-[#61b0ff] to-[#6881fd] text-white text-center py-2 rounded-md">
              <h2 className="text-xl font-semibold">Real-Time Transcription</h2>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <textarea
              className="w-full h-40 mt-4 p-4 bg-white border border-indigo-300 rounded-lg resize-none"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Your transcription will appear here in real-time..."
              readOnly={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput; 