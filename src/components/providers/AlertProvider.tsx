"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

type AlertType = "info" | "success" | "warning" | "error";

interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  type?: AlertType;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions | string) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | AlertOptions>({ message: "" });

  const showAlert = (opts: AlertOptions | string) => {
    if (typeof opts === "string") {
      setOptions({ message: opts, type: "info" });
    } else {
      setOptions({ ...opts, type: opts.type || "info" });
    }
    setIsConfirm(false);
    setIsOpen(true);
  };

  const showConfirm = (opts: ConfirmOptions) => {
    setOptions({ ...opts, type: opts.type || "warning" });
    setIsConfirm(true);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (isConfirm && (options as ConfirmOptions).onCancel) {
      (options as ConfirmOptions).onCancel!();
    }
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (isConfirm && (options as ConfirmOptions).onConfirm) {
      (options as ConfirmOptions).onConfirm();
    }
  };

  const getIcon = (type?: AlertType) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 mx-auto" />;
      case "warning": return <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 mx-auto" />;
      case "error": return <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />;
      case "info": 
      default: return <Info className="w-12 h-12 text-blue-500 mb-4 mx-auto" />;
    }
  };

  const { title, message, type } = options;

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false} className="sm:max-w-[400px] w-[90vw] rounded-3xl p-6 text-center border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          <div className="pt-4">
            {getIcon(type)}
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-black text-slate-900 text-center">
                {title || (isConfirm ? "Konfirmasi" : "Pemberitahuan")}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 text-center mt-2 leading-relaxed">
                {message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 bg-transparent border-none p-0 items-center justify-center">
              <Button 
                onClick={handleConfirm} 
                className={`w-full h-12 rounded-xl font-bold text-white shadow-lg ${
                  type === "error" ? "bg-red-600 hover:bg-red-700 shadow-red-200" :
                  type === "warning" ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" :
                  type === "success" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" :
                  "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {isConfirm ? "Ya, Lanjutkan" : "Mengerti"}
              </Button>
              {isConfirm && (
                <Button 
                  variant="ghost" 
                  onClick={handleClose} 
                  className="w-full h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100 mt-2"
                >
                  Batal
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AlertContext.Provider>
  );
}
