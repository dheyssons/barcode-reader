"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { CiBarcode } from "react-icons/ci";

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let stopStream: (() => void) | undefined;

    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
      async (result, err, controls) => {
        if (result) {
          const barcode = result.getText();
          if (barcode !== code) {
            setCode(barcode);
            setProductName(null);
            setLoading(true);
            try {
              const res = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
              );
              const data = await res.json();

              if (data.status === 1) {
                setProductName(data.product.product_name || "Produto sem nome");
              } else {
                setProductName("Produto não encontrado");
              }
            } catch (error) {
              setProductName("Erro na busca");
            } finally {
              setLoading(false);
            }
          }
        }

        if (!stopStream) {
          stopStream = () => controls.stop();
        }
      }
    );

    return () => {
      if (stopStream) stopStream();
    };
  }, [code]);

  return (
    <main className="w-screen h-screen flex flex-col items-center gap-y-10">
      <video ref={videoRef} />
      <p>
        <strong>Código detectado:</strong> {code || "Nenhum"}
      </p>
      {loading ? (
        <p>🔎 Buscando produto...</p>
      ) : productName ? (
        <p>
          <strong>Nome do produto:</strong> {productName}
        </p>
      ) : null}

      <div>
        <button>
          <span>0</span>
          <CiBarcode size={64}></CiBarcode>
        </button>
      </div>
    </main>
  );
}
