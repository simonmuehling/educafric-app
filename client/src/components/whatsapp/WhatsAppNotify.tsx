/**
 * WhatsApp Click-to-Chat Component
 * Shows a button to open WhatsApp with prefilled message
 * On desktop, also shows a QR code for mobile scanning
 */

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WhatsAppNotifyProps {
  token: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  showQR?: boolean;
}

export default function WhatsAppNotify({
  token,
  label = 'Ouvrir WhatsApp',
  className = '',
  variant = 'default',
  showQR = true
}: WhatsAppNotifyProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const link = `/wa/${token}`;

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const mobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(ua);
    setIsMobile(mobile);

    // Generate QR code for desktop
    if (!mobile && showQR) {
      const fullUrl = `${window.location.origin}${link}`;
      QRCode.toDataURL(fullUrl, { 
        margin: 1,
        width: 200,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    }
  }, [link, showQR]);

  return (
    <div className={`flex items-center gap-4 ${className}`} data-testid="whatsapp-notify-container">
      <Button
        asChild
        variant={variant}
        className="gap-2"
        data-testid="button-open-whatsapp"
      >
        <a href={link} rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
          {label}
        </a>
      </Button>

      {!isMobile && qrDataUrl && showQR && (
        <Card className="flex items-center gap-3 p-3 bg-muted/50" data-testid="qr-code-container">
          <img 
            src={qrDataUrl} 
            alt="Scannez pour ouvrir WhatsApp" 
            className="w-24 h-24 rounded border bg-white p-1"
            data-testid="img-qr-code"
          />
          <div className="text-sm text-muted-foreground max-w-[200px]">
            <p className="font-medium">Sur mobile ?</p>
            <p>Scannez ce code QR avec votre téléphone</p>
          </div>
        </Card>
      )}
    </div>
  );
}
