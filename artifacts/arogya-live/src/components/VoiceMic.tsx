import { useState, useRef, useEffect } from "react";
import { Mic, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParseVoiceCommand } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSettings } from "@/contexts/LanguageContext";

export function VoiceMic({ facilityId }: { facilityId: number }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  
  const { language } = useAppSettings();
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  
  const parseCommand = useParseVoiceCommand();

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        // Map language code to speech recognition language
        let langCode = 'en-IN';
        if (language === 'hi') langCode = 'hi-IN';
        if (language === 'bn') langCode = 'bn-IN';
        
        recognition.lang = langCode;

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          if (currentTranscript) {
            setTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            toast({
              title: "Microphone Error",
              description: `Could not hear you: ${event.error}`,
              variant: "destructive",
            });
          }
        };

        recognition.onend = () => {
          if (isListening) {
            setIsListening(false);
            processTranscript();
          }
        };

        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Your browser does not support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      processTranscript();
    } else {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const processTranscript = () => {
    // Need to use the latest transcript state
    setTranscript((current) => {
      if (current.trim()) {
        parseCommand.mutate({
          data: {
            transcript: current,
            facilityId,
            language
          }
        }, {
          onSuccess: (result) => {
            if (result.action !== "unknown") {
              setParsedResult(result);
              setShowConfirm(true);
            } else {
              toast({
                title: "Command not recognized",
                description: "Try saying something like 'Log 10 paracetamol' or 'Add 5 to OPD'",
                variant: "destructive",
              });
            }
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to parse voice command.",
              variant: "destructive",
            });
          }
        });
      }
      return current;
    });
  };

  const confirmAction = () => {
    // This would ideally call the specific mutation based on the action
    // For now we just show a toast as requested in the design task
    toast({
      title: "Action Confirmed",
      description: `Executed: ${parsedResult?.action.replace('_', ' ')}`,
    });
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg"
            >
              Listening...
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-teal-600 hover:bg-teal-700"
          }`}
          onClick={toggleListening}
          data-testid="btn-voice-mic"
        >
          {parseCommand.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : isListening ? (
            <div className="flex gap-1 items-center justify-center">
              <span className="w-1.5 h-1.5 bg-card rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-card rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-card rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              We heard: "{transcript}"
            </DialogDescription>
          </DialogHeader>
          <div className="bg-background p-4 rounded-lg border my-2">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Parsed Command:</h4>
            {parsedResult && (
              <ul className="space-y-1 text-sm">
                <li><strong>Action:</strong> <span className="capitalize">{parsedResult.action.replace('_', ' ')}</span></li>
                {parsedResult.medicineName && <li><strong>Medicine:</strong> {parsedResult.medicineName}</li>}
                {parsedResult.quantity && <li><strong>Quantity:</strong> {parsedResult.quantity}</li>}
                {parsedResult.department && <li><strong>Department:</strong> {parsedResult.department}</li>}
                {parsedResult.count && <li><strong>Count:</strong> {parsedResult.count}</li>}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={confirmAction} className="bg-teal-600 hover:bg-teal-700">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
