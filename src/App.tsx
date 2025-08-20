import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no types available
import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';

interface Currency {
  code: string;
  symbol: string;
  label: string;
}

interface Product {
  id: number;
  brand: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteData {
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerContact: string;
  quoteNumber: string;
  quoteDate: string;
  quoteValidity: string;
  destination: string;
  currency: Currency;
  incoterm: string;
  portOfChoice: string;
  leadTime: string;
  paymentTerms: string;
  additionalConditions: string;
  products: Product[];
}

const PRODUCT_CATALOG: Record<string, string[]> = {
  "D'Aria": ['Songbird Sauvignon Blanc', 'Blush Rosé', 'Merlot'],
  Namaqua: ['Sweet Rosé', 'Dry White', 'Cabernet Sauvignon'],
  'Cape West': ['Chenin Blanc', 'Shiraz', 'Chardonnay'],
  Goiya: ['Sauvignon Blanc', 'Cabernet Sauvignon'],
};

const CURRENCIES: Currency[] = [
  { code: 'ZAR', symbol: 'R', label: 'ZAR (R)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

const fmtMoney = (cur: Currency, n: number) => `${cur.symbol}${Number(n || 0).toFixed(2)}`;

function QuotePreview({ data, onBack }: { data: QuoteData; onBack: () => void }) {
  const quoteRef = useRef<HTMLDivElement>(null);

  const handleDownloadWord = () => {
    if (!quoteRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${quoteRef.current.innerHTML}</body></html>`;
    const blob = htmlDocx.asBlob(html);
    saveAs(blob, `Quotation-${data.quoteNumber || 'Q'}.docx`);
  };

  const handleDownloadPDF = async () => {
    if (!quoteRef.current) return;
    const canvas = await html2canvas(quoteRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    let y = 0;
    while (y < imgHeight) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
      y += pageHeight;
    }
    pdf.save(`Quotation-${data.quoteNumber || 'Q'}.pdf`);
  };

  const subtotal = data.products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);

  return (
    <div className="bg-white text-zinc-900 min-h-screen">
      <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-3 flex gap-2 justify-end">
        <button
          onClick={handleDownloadWord}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-white text-amber-800 border border-amber-800 hover:bg-amber-50"
        >
          Download Word
        </button>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-700 text-white border border-amber-800 hover:bg-amber-800"
        >
          Download PDF
        </button>
        <button
          onClick={onBack}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-white text-amber-800 border border-amber-800 hover:bg-amber-50"
        >
          Back
        </button>
      </div>
      <main ref={quoteRef} className="max-w-4xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-amber-800">Quotation</h1>
          <div className="text-sm text-zinc-600">Quote #: {data.quoteNumber}</div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-1">
            <div className="font-semibold">Bill To</div>
            <div>{data.customerName}</div>
            <div>{data.customerCompany}</div>
            <div>{data.customerContact}</div>
            <div>{data.customerAddress}</div>
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-semibold">Date:</span> {data.quoteDate}
            </div>
            <div>
              <span className="font-semibold">Valid Until:</span> {data.quoteValidity}
            </div>
            <div>
              <span className="font-semibold">Destination:</span> {data.destination}
            </div>
            <div>
              <span className="font-semibold">Currency:</span> {data.currency.code}
            </div>
            <div>
              <span className="font-semibold">Incoterms:</span> {data.incoterm}
              {data.portOfChoice ? ` (${data.portOfChoice})` : ''}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-amber-100">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Brand</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit</th>
                <th className="px-3 py-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p, i) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 border-b">{i + 1}</td>
                  <td className="px-3 py-2 border-b">{p.brand || '-'}</td>
                  <td className="px-3 py-2 border-b">{p.name}</td>
                  <td className="px-3 py-2 border-b text-right">{p.quantity}</td>
                  <td className="px-3 py-2 border-b text-right">{fmtMoney(data.currency, p.unitPrice)}</td>
                  <td className="px-3 py-2 border-b text-right">
                    {fmtMoney(data.currency, p.quantity * p.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={5} className="px-3 py-2 text-right font-semibold">
                  Subtotal
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {fmtMoney(data.currency, subtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="mb-6 space-y-1 text-sm">
          {data.leadTime && (
            <div>
              <span className="font-semibold">Lead Time:</span> {data.leadTime}
            </div>
          )}
          {data.paymentTerms && (
            <div>
              <span className="font-semibold">Payment Terms:</span> {data.paymentTerms}
            </div>
          )}
          {data.additionalConditions && (
            <div>
              <div className="font-semibold">Additional Conditions</div>
              <div className="whitespace-pre-wrap">{data.additionalConditions}</div>
            </div>
          )}
        </section>

        <footer className="text-xs text-zinc-500 mt-8">Generated by Quote Generator</footer>
      </main>
    </div>
  );
}

function App() {
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerContact, setCustomerContact] = useState('');

  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState('');
  const [quoteValidity, setQuoteValidity] = useState('');
  const [destination, setDestination] = useState('');
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [incoterm, setIncoterm] = useState('EXW');
  const [portOfChoice, setPortOfChoice] = useState('');

  const [leadTime, setLeadTime] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [additionalConditions, setAdditionalConditions] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [generatedQuote, setGeneratedQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    if (incoterm === 'EXW') {
      setPortOfChoice('');
    } else {
      setPortOfChoice(destination);
    }
  }, [incoterm, destination]);

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      { id: Date.now(), brand: '', name: '', quantity: 0, unitPrice: 0 },
    ]);
  };

  const updateProduct = (id: number, field: keyof Product, value: string | number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const subtotal = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const data: QuoteData = {
      customerName,
      customerCompany,
      customerAddress,
      customerContact,
      quoteNumber: quoteNumber || `Q-${Date.now().toString().slice(-6)}`,
      quoteDate,
      quoteValidity,
      destination,
      currency,
      incoterm,
      portOfChoice,
      leadTime,
      paymentTerms,
      additionalConditions,
      products: products.filter((p) => p.name),
    };
    setGeneratedQuote(data);
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerCompany('');
    setCustomerAddress('');
    setCustomerContact('');
    setQuoteNumber('');
    setQuoteDate('');
    setQuoteValidity('');
    setDestination('');
    setCurrency(CURRENCIES[0]);
    setIncoterm('EXW');
    setPortOfChoice('');
    setLeadTime('');
    setPaymentTerms('');
    setAdditionalConditions('');
    setProducts([]);
  };

  if (generatedQuote) {
    return <QuotePreview data={generatedQuote} onBack={() => setGeneratedQuote(null)} />;
  }

  return (
    <div className="bg-amber-50 text-zinc-900 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-amber-800">Quote Generator</h1>
          <p className="text-sm text-zinc-600">Fill the form and generate a printable/exportable quote.</p>
        </header>

        <form onSubmit={handleGenerate} className="space-y-6 bg-white p-6 rounded-2xl shadow">
          <section>
            <h2 className="text-lg font-semibold text-amber-800 mb-3">Customer</h2>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 md:col-span-3">
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <label className="block text-sm font-medium mb-1">Contact</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-800 mb-3">Quote Details</h2>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Quote #</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Valid Until</label>
                <input
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={quoteValidity}
                  onChange={(e) => setQuoteValidity(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Destination</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={currency.code}
                  onChange={(e) => {
                    const cur = CURRENCIES.find((c) => c.code === e.target.value);
                    if (cur) setCurrency(cur);
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Incoterm</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                >
                  {['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Port of Choice</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={portOfChoice}
                  onChange={(e) => setPortOfChoice(e.target.value)}
                />
              </div>
            </div>
          </section>

  <section>
            <h2 className="text-lg font-semibold text-amber-800 mb-3">Products</h2>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <select
                      className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                      value={p.brand}
                      onChange={(e) => updateProduct(p.id, 'brand', e.target.value)}
                    >
                      <option value="">Select brand</option>
                      {Object.keys(PRODUCT_CATALOG).map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Product</label>
                    <select
                      className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                      value={p.name}
                      onChange={(e) => updateProduct(p.id, 'name', e.target.value)}
                      disabled={!p.brand}
                    >
                      <option value="">Select product</option>
                      {(PRODUCT_CATALOG[p.brand] || []).map((prod) => (
                        <option key={prod}>{prod}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Qty</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                      value={p.quantity}
                      onChange={(e) => updateProduct(p.id, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Unit Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                      value={p.unitPrice}
                      onChange={(e) => updateProduct(p.id, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="block text-sm font-medium mb-1 md:text-right">Total</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-right">
                        {fmtMoney(currency, p.quantity * p.unitPrice)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(p.id)}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addProduct}
              className="inline-flex items-center justify-center px-4 py-2 mt-2 rounded-lg font-medium border border-amber-800 text-amber-800 bg-white hover:bg-amber-50"
            >
              + Add Product
            </button>
            <div className="text-right font-semibold mt-2">
              Subtotal: {fmtMoney(currency, subtotal)}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-amber-800 mb-3">Terms</h2>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Lead Time</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Payment Terms</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-6">
                <label className="block text-sm font-medium mb-1">Additional Conditions</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  value={additionalConditions}
                  onChange={(e) => setAdditionalConditions(e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium border border-amber-800 text-amber-800 bg-white hover:bg-amber-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium border border-amber-800 bg-amber-700 text-white hover:bg-amber-800"
            >
              Generate Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;

