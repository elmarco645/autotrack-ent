
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';
import { Vehicle } from '../types';

interface LiveAssistantProps {
  onSearch: (plate: string) => Vehicle | undefined;
  onAdd: (v: Omit<Vehicle, 'id'>) => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ onSearch, onAdd }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef<string[]>([]);

  const searchVehicleTool: FunctionDeclaration = {
    name: 'searchVehicle',
    parameters: {
      type: Type.OBJECT,
      description: 'Find a vehicle by its number plate.',
      properties: {
        plate: { type: Type.STRING, description: 'The number plate to search for.' }
      },
      required: ['plate']
    }
  };

  const addVehicleTool: FunctionDeclaration = {
    name: 'addVehicle',
    parameters: {
      type: Type.OBJECT,
      description: 'Register a new vehicle to the database.',
      properties: {
        plate: { type: Type.STRING },
        vin: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Car', 'Truck', 'Bus', 'Motorcycle'] },
        model: { type: Type.STRING },
        year: { type: Type.STRING },
        color: { type: Type.STRING },
        owner: { type: Type.STRING },
        history: { type: Type.STRING }
      },
      required: ['plate', 'vin', 'type', 'model', 'year', 'color', 'owner']
    }
  };

  const handleStop = useCallback(() => {
    setIsActive(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    for (const s of sourcesRef.current) s.stop();
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const handleStart = async () => {
    if (isActive) {
      handleStop();
      return;
    }

    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                if (isActive) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev.slice(-4), `AI: ${text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev.slice(-4), `You: ${text}`]);
            }

            // Handle Tools
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                let result = "Not executed";
                if (fc.name === 'searchVehicle') {
                  const v = onSearch(fc.args.plate as string);
                  result = v ? JSON.stringify(v) : "Vehicle not found";
                } else if (fc.name === 'addVehicle') {
                  onAdd(fc.args as any);
                  result = "Vehicle registered successfully";
                }
                
                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result }
                    }
                  });
                });
              }
            }

            // Handle Audio
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(ctx.destination);
              sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            handleStop();
          },
          onclose: () => {
            handleStop();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: 'You are the AutoTrack Pro Voice Assistant. You help users search for vehicles or register new ones. You are efficient, professional, and friendly. When searching, if a vehicle is found, describe its key details. If not found, offer to help them register it.',
          tools: [{ functionDeclarations: [searchVehicleTool, addVehicleTool] }]
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      handleStop();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {isActive && (
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl w-64 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-blue-400 animate-bounce delay-75"></div>
              <div className="w-1 h-5 bg-blue-500 animate-bounce delay-150"></div>
              <div className="w-1 h-3 bg-blue-400 animate-bounce delay-75"></div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Live AI Session</span>
          </div>
          <div className="text-[11px] space-y-2 opacity-80 min-h-[100px] flex flex-col justify-end">
            {transcript.map((line, idx) => (
              <p key={idx} className={line.startsWith('You:') ? 'text-slate-300' : 'text-blue-300'}>{line}</p>
            ))}
            {transcript.length === 0 && <p className="italic">"Search for plate KAB123X..."</p>}
          </div>
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={isConnecting}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-2xl
          ${isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'}
          ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isActive ? "End AI Assistant" : "Talk to AutoTrack AI"}
      >
        {isConnecting ? (
          <i className="fa-solid fa-spinner fa-spin"></i>
        ) : isActive ? (
          <i className="fa-solid fa-microphone-slash"></i>
        ) : (
          <i className="fa-solid fa-microphone"></i>
        )}
        
        {!isActive && !isConnecting && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-bounce shadow-md">
            NEW
          </span>
        )}
      </button>
    </div>
  );
};

export default LiveAssistant;
