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

  function addProduct(productName: any, productBarcode: any) {
    const allCanvas = document.querySelectorAll("canvas");
    const barcodeElementLength = allCanvas.length;

    const newBarcodeElement = document.createElement("canvas");
    newBarcodeElement.setAttribute("id", `barcode${barcodeElementLength}`);

    document.querySelector(".barcodes")?.appendChild(newBarcodeElement);
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
            setProductName(null);
            setLoading(true);
            try {
              const res = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
              );
              const data = await res.json();

              if (data.status === 1) {
                setProductName(data.product.product_name || "Produto sem nome");
                addProduct(data.product.product_name, barcode);
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
        {loading ? (
          <p>🔎 Buscando produto...</p>
        ) : productName ? (
          <p>
            <strong>Nome do produto:</strong> {productName}
          </p>
        ) : null}
        <button>
          <span className="product-amount">{scannedProductsLength}</span>
          <CiBarcode size={64}></CiBarcode>
        </button>

        {/* BARCODES */}
        <div className="barcodes"></div>
      </div>
    </main>
  );
}
