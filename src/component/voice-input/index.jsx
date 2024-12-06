import React, { useState } from "react";
import useSpeechToText from "../../hooks/useSpeechToText";

const VoiceInput = () => {
  const [textInput, setTextInput] = useState("");
  const { isListening, transcript, startListening, stopListening } =
    useSpeechToText({ continuous: true });

  const startStopListening = () => {
    isListening ? stopListening() : startListening();
  };

  const stopVoiceInput = () => {
    setTextInput(
      (preVal) =>
        preVal +
        (transcript.length ? (preVal.length ? " " : "") + transcript : "")
    );
    stopListening();
  };

  return (
    <div className="block mx-auto w-[400px] text-center mt-[200px]">
      <button
        onClick={() => {
          startStopListening();
        }}
        className={`${
          isListening ? "bg-[#d62d20]" : "bg-[#008744]"
        } text-white px-5 py-2.5 border-none rounded cursor-pointer transition-colors duration-300`}
      >
        {isListening ? "Stop Listening" : "Speak"}
      </button>
      <textarea
        className="mt-5 w-full h-[150px] p-2.5 border border-[#ccc] rounded 
        transition-colors duration-300 resize-none bg-[#f8f8f8] text-[#333]
        disabled:opacity-75"
        disabled={isListening}
        value={
          isListening
            ? textInput +
              (transcript.length
                ? (textInput.length ? " " : "") + transcript
                : "")
            : textInput
        }
        onChange={(e) => {
          setTextInput(e.target.value);
        }}
      />
    </div>
  );
};

export default VoiceInput;
