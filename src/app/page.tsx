"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { CiBarcode } from "react-icons/ci";
import JsBarcode from "jsbarcode";

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannedProductsLength, setScannedProductsLength] = useState(0);
  const [products, setProducts] = useState(null);

  function addProduct(productBarcode: any) {
    const allCanvas = document.querySelectorAll("canvas");
    const barcodeElementLength = allCanvas.length;

    const newBarcodeElement = document.createElement("canvas");
    newBarcodeElement.setAttribute("id", `barcode${barcodeElementLength}`);
    newBarcodeElement.style.width = "100%";

    const barcodeWrapper = document.createElement("div");
    barcodeWrapper.style.height = "100vh";

    barcodeWrapper.appendChild(newBarcodeElement);
    document.querySelector(".barcodes")?.appendChild(barcodeWrapper);

    JsBarcode(`#barcode${barcodeElementLength}`, productBarcode);

    setScannedProductsLength(barcodeElementLength + 1);
  }

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
            setLoading(true);

            addProduct(barcode);
          }
        }

        if (!stopStream) {
          setTimeout(() => {
            stopStream = () => controls.stop();
          }, 2000);
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

      <div className="flex flex-col items-center">
        <p>
          <strong>Código detectado:</strong> {code || "Nenhum"}
        </p>

        <button className="flex items-center">
          <CiBarcode size={64}></CiBarcode>
          <span className="product-amount text-lg bg-white text-black p-2 rounded-full max-h-max">
            {scannedProductsLength}
          </span>
        </button>
      </div>

      {/* BARCODES */}
      <div className="barcodes flex flex-col w-[80%] mt-20"></div>
    </main>
  );
}
