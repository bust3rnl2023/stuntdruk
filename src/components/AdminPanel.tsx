import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  Eye, 
  Briefcase, 
  Check, 
  X, 
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';

interface AdminPanelProps {
  currentUser: any;
  onBackToShopping: () => void;
}

export function AdminPanel({ currentUser, onBackToShopping }: AdminPanelProps) {
  // Authorization Gate on client side
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'bastiaanh79@gmail.com' || currentUser.email === 'admin@stuntdruk.nl');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'customers' | 'orders'>('dashboard');

  // Metrics Dashboard State
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Products catalogs definitions
  const [productsData, setProductsData] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Customers & User Logs State
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  // General Orders List State
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Modal / Form triggers for Dynamic Catalog Management
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit'>('create');
  
  // Custom Product spec form state fields
  const [prodKey, setProdKey] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodSizes, setProdSizes] = useState<any[]>([]);
  const [prodPaperTypes, setProdPaperTypes] = useState<any[]>([]);
  const [prodPrintings, setProdPrintings] = useState<any[]>([]);
  const [prodFinishings, setProdFinishings] = useState<any[]>([]);
  const [prodQuantities, setProdQuantities] = useState<any[]>([]);

  // Individual attribute add temporary states
  const [newSizeId, setNewSizeId] = useState('');
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeSurcharge, setNewSizeSurcharge] = useState(0);

  const [newPaperId, setNewPaperId] = useState('');
  const [newPaperName, setNewPaperName] = useState('');
  const [newPaperWeight, setNewPaperWeight] = useState(300);
  const [newPaperSurcharge, setNewPaperSurcharge] = useState(0);

  const [newPrintId, setNewPrintId] = useState('');
  const [newPrintName, setNewPrintName] = useState('');
  const [newPrintSurcharge, setNewPrintSurcharge] = useState(0);

  const [newFinishId, setNewFinishId] = useState('');
  const [newFinishName, setNewFinishName] = useState('');
  const [newFinishSurcharge, setNewFinishSurcharge] = useState(0);

  const [newQuantId, setNewQuantId] = useState('');
  const [newQuantValue, setNewQuantValue] = useState(100);
  const [newQuantBasePrice, setNewQuantBasePrice] = useState(25);

  // Loading error states
  const [errorMessage, setErrorMessage] = useState('');
  const [operationMessage, setOperationMessage] = useState('');

  // Fetch admin logs and data on demand
  const loadDashboardMetrics = async () => {
    if (!isAdmin) return;
    setMetricsLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.error) {
        setMetrics(data);
      } else {
        setErrorMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Fout bij laden van dashboards.');
    } finally {
      setMetricsLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductsData(data);
      } else {
        setErrorMessage(data.error || 'Kon producten niet laden');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Producten synchronisatie is mislukt.');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadCustomers = async () => {
    if (!isAdmin) return;
    setCustomersLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomersData(data);
      } else {
        setErrorMessage(data.error || 'Kon klanten niet laden');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Laden van klanten mislukt.');
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!isAdmin) return;
    setOrdersLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrdersData(data);
      } else {
        setErrorMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Fout bij laden bestellingen.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardMetrics();
      loadProducts();
      loadCustomers();
      loadOrders();
    }
  }, [currentUser, activeTab]);

  // Handle product deletion
  const handleDeleteProduct = async (key: string) => {
    if (!window.confirm(`Weet je zeker dat je het product "${key}" permanent wilt verwijderen uit de configurator?`)) {
      return;
    }
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/admin/products/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOperationMessage(`Product ${key} succesvol verwijderd.`);
        loadProducts();
        setTimeout(() => setOperationMessage(''), 3000);
      } else {
        alert(data.error || 'Fout bij verwijderen');
      }
    } catch (err) {
      console.error(err);
      alert('Product verwijderen mislukt.');
    }
  };

  // Change individual order status
  const handleChangeOrderStatus = async (orderId: number, status: string) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOperationMessage(`Bestelling #${orderId} status gewijzigd naar '${status}'.`);
        loadOrders();
        loadCustomers();
        loadDashboardMetrics();
        setTimeout(() => setOperationMessage(''), 3000);
      } else {
        alert(data.error || 'Kon status niet bijwerken');
      }
    } catch (err) {
      console.error(err);
      alert('Status aanpassen mislukt.');
    }
  };

  // Open product form (Create)
  const handleOpenCreateProduct = () => {
    setProductFormMode('create');
    setProdKey('');
    setProdName('');
    setProdSizes([
      { id: 'standard', name: 'Standaard (85x55mm)', surcharge: 0 }
    ]);
    setProdPaperTypes([
      { id: 'mc_mat', name: '350g Silk Mat MC', weight: 350, surcharge: 0 }
    ]);
    setProdPrintings([
      { id: '4_4', name: '4/4 Full Color Dubbelzijdig', surcharge: 0 }
    ]);
    setProdFinishings([
      { id: 'none', name: 'Geen afwerking', surcharge: 0 }
    ]);
    setProdQuantities([
      { id: '250', value: 250, basePrice: 25 }
    ]);
    setProductFormOpen(true);
  };

  // Open product form (Edit / Adjust details)
  const handleOpenEditProduct = (prod: any) => {
    setProductFormMode('edit');
    setEditingProduct(prod);
    setProdKey(prod.key);
    setProdName(prod.name);
    setProdSizes(prod.sizes || []);
    setProdPaperTypes(prod.paperTypes || []);
    setProdPrintings(prod.printings || []);
    setProdFinishings(prod.finishings || []);
    setProdQuantities(prod.quantities || []);
    setProductFormOpen(true);
  };

  // Submit Product Spec Block (Postgres-Backed configurations)
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodKey || !prodName) {
      alert('Sleutel en productnaam zijn verplichte velden.');
      return;
    }

    const payload = {
      key: prodKey,
      name: prodName,
      sizes: prodSizes,
      paperTypes: prodPaperTypes,
      printings: prodPrintings,
      finishings: prodFinishings,
      quantities: prodQuantities
    };

    try {
      const token = await currentUser.getIdToken();
      const url = productFormMode === 'create' ? '/api/admin/products' : `/api/admin/products/${prodKey}`;
      const method = productFormMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setOperationMessage(`Product specs succesvol ${productFormMode === 'create' ? 'toegevoegd' : 'bijgewerkt'}.`);
        setProductFormOpen(false);
        loadProducts();
        setTimeout(() => setOperationMessage(''), 3000);
      } else {
        alert(data.error || 'Er is een fout opgetreden.');
      }
    } catch (err) {
      console.error(err);
      alert('Systeemfout bij opslaan product catalog.');
    }
  };

  // Inline specs compilers
  const addSize = () => {
    if (!newSizeId || !newSizeName) return;
    setProdSizes([...prodSizes, { id: newSizeId, name: newSizeName, surcharge: Number(newSizeSurcharge) }]);
    setNewSizeId('');
    setNewSizeName('');
    setNewSizeSurcharge(0);
  };

  const addPaper = () => {
    if (!newPaperId || !newPaperName) return;
    setProdPaperTypes([...prodPaperTypes, { id: newPaperId, name: newPaperName, weight: Number(newPaperWeight), surcharge: Number(newPaperSurcharge) }]);
    setNewPaperId('');
    setNewPaperName('');
    setNewPaperWeight(300);
    setNewPaperSurcharge(0);
  };

  const addPrint = () => {
    if (!newPrintId || !newPrintName) return;
    setProdPrintings([...prodPrintings, { id: newPrintId, name: newPrintName, surcharge: Number(newPrintSurcharge) }]);
    setNewPrintId('');
    setNewPrintName('');
    setNewPrintSurcharge(0);
  };

  const addFinish = () => {
    if (!newFinishId || !newFinishName) return;
    setProdFinishings([...prodFinishings, { id: newFinishId, name: newFinishName, surcharge: Number(newFinishSurcharge) }]);
    setNewFinishId('');
    setNewFinishName('');
    setNewFinishSurcharge(0);
  };

  const addQuant = () => {
    if (!newQuantId) return;
    setProdQuantities([...prodQuantities, { id: newQuantId, value: Number(newQuantValue), basePrice: Number(newQuantBasePrice) }]);
    setNewQuantId('');
    setNewQuantValue(100);
    setNewQuantBasePrice(25);
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-200 mb-6">
          <AlertCircle className="h-8 w-8 shrink-0" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-950">Toegang Geweigerd (403 Forbidden)</h2>
        <p className="mt-2 text-xs text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
          U dient geautoriseerd te zijn als 'admin' om het interne beheerdersdashboard te kunnen bekijken of om productieflows aan te kunnen passen. Let op: uw e-mailadres moet geregistreerd staan met beheerdersrechten.
        </p>
        <button
          onClick={onBackToShopping}
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-900 text-white px-5 py-3 text-xs font-bold leading-none hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Terug naar Winkelshop</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      
      {/* Action Notice toast */}
      {operationMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-emerald-600 text-white px-4 py-3 font-semibold text-xs shadow-lg flex items-center space-x-2 animate-bounce-short">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>{operationMessage}</span>
        </div>
      )}

      {/* Admin header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Settings className="h-7 w-7 text-indigo-600 shrink-0" />
            <span>Stuntdruk.nl Beheerderspaneel</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 max-w-2xl font-medium leading-relaxed">
            Realtime overzicht van bestellingen, actieve klantenbestanden en direct beheer van producteigenschappen gekoppeld aan de SQL pricing engines.
          </p>
        </div>

        <button
          onClick={onBackToShopping}
          className="self-start md:self-center inline-flex items-center space-x-2 rounded-xl bg-white border border-slate-200 hover:border-slate-350 text-slate-700 px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Terug naar Webshop</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex space-x-1.5 border-b border-slate-200 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="inline-block h-4 w-4 mr-1.5 shrink-0" />
          Dashboard Metrics
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package className="inline-block h-4 w-4 mr-1.5 shrink-0" />
          Product Management
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="inline-block h-4 w-4 mr-1.5 shrink-0" />
          Klanten & Bestelhistorie
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="inline-block h-4 w-4 mr-1.5 shrink-0" />
          Bestellingen Overzicht
        </button>
      </div>

      {/* Tab Panels */}

      {/* Tab Panel 1: Dashboard Metrics */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {metricsLoading ? (
            <div className="py-20 text-center text-xs text-slate-400 font-bold">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2 shrink-0" />
              <span>Metrics laden uit PostgreSQL...</span>
            </div>
          ) : metrics ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                
                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <DollarSign className="h-6 w-6 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Totale Omzet (Gross)</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">€{metrics.totalSales?.toFixed(2)}</h3>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    <ShoppingBag className="h-6 w-6 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Aantal Orders</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{metrics.totalOrders}</h3>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      {metrics.completedOrders} afgerond / {metrics.processingOrders} in behandeling
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                    <Users className="h-6 w-6 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Nieuwe Gebruikers</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{metrics.totalUsers}</h3>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150 bg-white p-5 shadow-xs flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                    <Package className="h-6 w-6 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Catalogus Producten</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{metrics.totalProductsCount}</h3>
                  </div>
                </div>

              </div>

              {/* Chart section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Area Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-150 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">Shop Omzettrend (Laatste 7 Dagen)</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Inclusief BTW en eventuele spoedtoeslagen</p>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={metrics.chartsData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                        <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="sales" name="Omzet (€)" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders volume bar chart */}
                <div className="lg:col-span-1 rounded-2xl border border-slate-150 bg-white p-6 shadow-xs">
                  <div className="mb-6">
                    <h3 className="text-sm font-extrabold text-slate-800">Bestelvolumes</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Aantal geplaatste opdrachten per dag</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.chartsData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                        <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="orders" name="Orders" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-rose-500 font-bold border rounded-2xl bg-white">
              Kon dashboardsstatistieken niet inladen. Probeer de pagina te vernieuwen.
            </div>
          )}
        </div>
      )}

      {/* Tab Panel 2: Product Catalog Specification Management */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <div>
              <h3 className="text-xs font-black text-slate-800">Dynamische Drukwerk Specificaties</h3>
              <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-lg">
                Hier kun je bestaande specificaties (zoals papiersoorten, formaten, afwerkingen, startprijzen) van de website aanpassen of nieuwe drukwerkcategorieën introduceren in de SQL database.
              </p>
            </div>
            <button
              onClick={handleOpenCreateProduct}
              className="inline-flex items-center space-x-1 border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="h-4.5 w-4.5 shrink-0" />
              <span>Nieuw Product Toevoegen</span>
            </button>
          </div>

          {productsLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2 shrink-0" />
              <span>Productcatalogus laden...</span>
            </div>
          ) : (
            <div className="border border-slate-205 rounded-xl bg-white shadow-xs overflow-hidden">
              <table className="min-w-full divide-y divide-slate-150 text-[11px] text-left">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Product ID / Sleutel</th>
                    <th className="px-5 py-3.5">Naam</th>
                    <th className="px-5 py-3.5">Formaten</th>
                    <th className="px-5 py-3.5">Papier Opties</th>
                    <th className="px-5 py-3.5">Afwerkingen</th>
                    <th className="px-5 py-3.5">Aantallen</th>
                    <th className="px-5 py-3.5 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {productsData.map((p) => (
                    <tr key={p.key} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-mono text-indigo-600 font-bold text-[10.5px]">
                        {p.key}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-800">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-slate-500 leading-normal max-w-[150px] truncate" title={p.sizes?.map((s: any) => s.name).join(', ')}>
                        {p.sizes?.length} formaten: <br />
                        <span className="text-[10px] text-slate-400 font-semibold">{p.sizes?.map((s: any) => s.id).join(', ')}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 leading-normal max-w-[150px] truncate" title={p.paperTypes?.map((pa: any) => pa.name).join(', ')}>
                        {p.paperTypes?.length} papiersoorten: <br />
                        <span className="text-[10px] text-slate-400 font-semibold">{p.paperTypes?.map((pa: any) => pa.id).join(', ')}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {p.finishings?.length} opties
                      </td>
                      <td className="px-5 py-3 text-slate-500 leading-normal max-w-[140px] truncate">
                        {p.quantities?.length} staffels: <br />
                        <span className="text-[10px] font-bold text-emerald-600 font-mono">Min. €{p.quantities ? Math.min(...p.quantities.map((q: any) => q.basePrice || 0)) : 0}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1 px-2.5 bg-slate-105 border border-slate-200 text-slate-700 rounded-md font-bold text-[10.5px] hover:border-slate-350 transition-colors"
                          >
                            <Edit3 className="inline-block h-3.5 w-3.5 mr-1 shrink-0" />
                            Aanpassen
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(p.key)}
                            className="p-1 px-2 bg-rose-50 border border-thin border-rose-150 hover:bg-rose-100/70 text-rose-700 rounded-md font-bold transition-colors"
                            aria-label="Verwijderen"
                          >
                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tab Panel 3: Customer Portal and Purchase Order History Logs */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <h3 className="text-xs font-black text-slate-800">Geregistreerde Klantendossiers</h3>
            <p className="text-[10px] text-slate-500 leading-normal mt-0.5 max-w-2xl font-medium">
              Bekijk geregistreerde klantgegevens, hun totale bestedingen in de webshop en vouw specifieke dossiers open om hun orderlogs in te zien.
            </p>
          </div>

          {customersLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2 shrink-0" />
              <span>Klantbestanden laden...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {customersData.map((customer) => (
                <div key={customer.id} className="border border-slate-150 rounded-2xl bg-white shadow-xs overflow-hidden">
                  
                  {/* Customer summary card strip */}
                  <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 border-b border-slate-100 gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 font-bold text-slate-700 text-sm shadow-xs shrink-0">
                        {customer.fullName?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 flex items-center mb-0.5">
                          <span>{customer.fullName}</span>
                          {customer.role === 'admin' && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-120 text-indigo-800 font-bold text-[8.5px] rounded-full shrink-0 border border-indigo-200">
                              Beheerder
                            </span>
                          )}
                        </h4>
                        <p className="text-[10.5px] font-mono text-slate-400">{customer.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Geregistreerd</span>
                        <span className="font-bold text-slate-700 text-[10.5px]">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('nl-NL') : 'Onbekend'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Orders</span>
                        <span className="font-bold text-slate-700 text-[10.5px]">{customer.ordersCount} bestellingen</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Totaal Besteed</span>
                        <span className="font-black text-emerald-600 text-[11px]">€{customer.totalSpent?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer personal details and Order history */}
                  <div className="p-4 md:p-5 bg-white space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10.5px] text-slate-600 border-b border-slate-100 pb-4">
                      <div>
                        <strong>Telefoonnummer:</strong> <br />
                        <span className="font-bold text-slate-800">{customer.phone || 'Niet ingevuld'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <strong>Verzendadres / Factuuradres:</strong> <br />
                        <span className="font-bold text-slate-800">
                          {customer.address ? `${customer.address}, ${customer.postalCode || ''} ${customer.city || ''} (${customer.country || 'Nederland'})` : 'Niet ingevuld'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Order history */}
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Bestelhistorie van deze klant</h5>
                      
                      {customer.orderHistory?.length === 0 ? (
                        <p className="text-[10.5px] font-medium text-slate-400 py-2">Deze klant heeft nog geen bestellingen geplaatst.</p>
                      ) : (
                        <div className="space-y-3">
                          {customer.orderHistory?.map((order: any) => (
                            <div key={order.id} className="rounded-xl border border-slate-151 bg-slate-50/20 p-4 shrink-0 transition-all hover:bg-slate-50/50">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-[11px] mb-3 border-b border-dashed border-slate-200 pb-2.5">
                                <div className="font-bold">
                                  <span className="text-indigo-650">Bestelling #{order.id}</span>
                                  <span className="mx-2 text-slate-300">|</span>
                                  <span className="text-slate-400 text-[10px]">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('nl-NL') : ''}</span>
                                </div>

                                <div className="flex items-center space-x-3 text-[10px]">
                                  <span className="font-mono text-slate-550">Betaling: <strong>{order.paymentMethod || 'iDEAL'}</strong></span>
                                  
                                  {/* Select menu to adjust status */}
                                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                    <span className="font-semibold text-slate-400">Status:</span>
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
                                      className="font-black text-indigo-700 bg-transparent border-none focus:ring-0 p-0 text-[10px] select-none cursor-pointer"
                                    >
                                      <option value="processing">In behandeling</option>
                                      <option value="completed">Afgerond (Betaald)</option>
                                      <option value="shipped">Verzonden (Track & Trace)</option>
                                    </select>
                                  </div>

                                  <span className="font-black text-emerald-600 text-[11.5px]">€{order.total?.toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Order items lists */}
                              <ul className="space-y-1.5 pl-1.5">
                                {order.items?.map((item: any, idx: number) => (
                                  <li key={idx} className="text-[10.5px] leading-relaxed flex items-start justify-between">
                                    <div className="flex items-start space-x-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                                      <div>
                                        <p className="font-extrabold text-slate-850">
                                          {item.productName || 'Drukwerk'} • {item.config?.quantity || item.quantity || '1'} stuks
                                        </p>
                                        <p className="text-[10px] text-slate-405 font-medium leading-normal mt-0.5">
                                          Formaat: {item.config?.size} • Papier: {item.config?.paperType} • Printing: {item.config?.printing} • Finishing: {item.config?.finishing}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="font-mono text-slate-500 hover:text-slate-800">€{item.price?.toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>

                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Tab Panel 4: Clean general orders list overview */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <h3 className="text-xs font-black text-slate-800">Systeem Bestellingen Overzicht</h3>
            <p className="text-[10px] text-slate-500 leading-normal mt-0.5 max-w-2xl font-medium">
              Eenvoudige platte lijst van alle geplaatste opdrachten in de shop. Wijzig de status direct om klanten via hun order-tracking module op de hoogte te stellen.
            </p>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500 mb-2 shrink-0" />
              <span>Bestellingen synchroniseren...</span>
            </div>
          ) : (
            <div className="border border-slate-205 rounded-xl bg-white shadow-xs overflow-hidden">
              <table className="min-w-full divide-y divide-slate-150 text-[10.5px] text-left">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Bestel ID</th>
                    <th className="px-5 py-3.5">Klant</th>
                    <th className="px-5 py-3.5">Aankoopdatum</th>
                    <th className="px-5 py-3.5">Item(s)</th>
                    <th className="px-5 py-3.5">Totaal (Bruto)</th>
                    <th className="px-5 py-3.5">Leveringsstatus</th>
                    <th className="px-5 py-3.5 text-right">Pas Status Aan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {ordersData.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        #{order.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-850">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{order.customerEmail}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('nl-NL') : 'Onbekend'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-650 max-w-[200px] truncate leading-normal">
                        {order.items?.map((it: any) => `${it.productName || 'Drukwerk'} (${it.config?.quantity || '1'})`).join(', ')}
                      </td>
                      <td className="px-5 py-3.5 font-black text-emerald-600 text-[11px]">
                        €{order.total ? parseFloat(order.total).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-805 border-amber-200'
                        }`}>
                          {order.status === 'completed' ? 'In productie / Betaald' : order.status === 'shipped' ? 'Verzonden' : 'In behandeling'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
                          className="font-bold text-indigo-700 bg-white border border-slate-200 py-1 px-2.5 rounded-md text-[10px] select-none cursor-pointer focus:ring-1 focus:ring-indigo-300"
                        >
                          <option value="processing">In behandeling</option>
                          <option value="completed">Afgerond (Betaald)</option>
                          <option value="shipped">Verzonden</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Product Spec Creator and Edit Dialog Modal */}
      {productFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-150 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            
            {/* Modal Heading */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {productFormMode === 'create' ? 'Drukwerk Product Toevoegen' : `Drukwerk Eigenschappen Aanpassen (${editingProduct?.key})`}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                  Alle configureerbare velden worden realtime geconverteerd en in de SQL database opgeslagen.
                </p>
              </div>

              <button
                onClick={() => setProductFormOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Sluiten"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Scroll area */}
            <form onSubmit={handleProductFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-[11px]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Unieke Product Sleutel (ID)</label>
                  <input
                    type="text"
                    value={prodKey}
                    onChange={(e) => setProdKey(e.target.value)}
                    placeholder="E.g. business_card (sleutel uit URL/database)"
                    disabled={productFormMode === 'edit'}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505"
                  />
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-1">Typ de lagere_kast_identifikator (zoals poster of flyer) die de url-match regelt.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Product Display Naam</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="E.g. Premium Visitekaartjes"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505"
                  />
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-1">De naam van het product zoals zichtbaar voor consumenten.</p>
                </div>
              </div>

              {/* Attributes block: Formaten (Sizes) */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40">
                <h4 className="text-[10px] font-extrabold text-indigo-750 uppercase tracking-wider border-b border-indigo-100/50 pb-2 mb-3">
                  1. Formaten en Afmetingen (Sizes)
                </h4>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prodSizes.map((sz: any) => (
                    <span key={sz.id} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-bold shrink-0">
                      <span>{sz.name} (surcharge: +€{sz.surcharge || 0})</span>
                      <button
                        type="button"
                        onClick={() => setProdSizes(prodSizes.filter(s => s.id !== sz.id))}
                        className="text-rose-500 hover:text-rose-700 font-black cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {prodSizes.length === 0 && <span className="text-slate-400 py-1 font-semibold">Geen formaten toegevoegd.</span>}
                </div>

                {/* Adding mini form inline */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">ID / Code</label>
                    <input type="text" value={newSizeId} onChange={(e) => setNewSizeId(e.target.value)} placeholder="E.g. a5" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Naamsomschrijving</label>
                    <input type="text" value={newSizeName} onChange={(e) => setNewSizeName(e.target.value)} placeholder="E.g. A5 Formaat (148x210mm)" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Volumetoeslag (€)</label>
                    <div className="flex space-x-2">
                      <input type="number" step="0.01" value={newSizeSurcharge} onChange={(e) => setNewSizeSurcharge(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                      <button type="button" onClick={addSize} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-2.5 cursor-pointer">Voeg toe</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributes block: Papier Opties (PaperTypes) */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40">
                <h4 className="text-[10px] font-extrabold text-indigo-750 uppercase tracking-wider border-b border-indigo-100/50 pb-2 mb-3">
                  2. Papiersoorten en Gewichtsklassen
                </h4>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prodPaperTypes.map((pa: any) => (
                    <span key={pa.id} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-bold shrink-0">
                      <span>{pa.name} ({pa.weight || 135}g, +€{pa.surcharge || 0})</span>
                      <button
                        type="button"
                        onClick={() => setProdPaperTypes(prodPaperTypes.filter(p => p.id !== pa.id))}
                        className="text-rose-500 hover:text-rose-700 font-black cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {prodPaperTypes.length === 0 && <span className="text-slate-400 py-1 font-semibold">Geen papiersoorten toegevoegd.</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">ID</label>
                    <input type="text" value={newPaperId} onChange={(e) => setNewPaperId(e.target.value)} placeholder="E.g. raw_recycled" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Omschrijving</label>
                    <input type="text" value={newPaperName} onChange={(e) => setNewPaperName(e.target.value)} placeholder="E.g. 300g Natuurkarton / Recycled" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Gewicht (grams)</label>
                    <input type="number" value={newPaperWeight} onChange={(e) => setNewPaperWeight(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Toeslag (€)</label>
                    <div className="flex space-x-2">
                      <input type="number" step="0.01" value={newPaperSurcharge} onChange={(e) => setNewPaperSurcharge(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                      <button type="button" onClick={addPaper} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-2.5 cursor-pointer">Voeg toe</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributes block: Printbedrukkingen (Printings) */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40">
                <h4 className="text-[10px] font-extrabold text-indigo-750 uppercase tracking-wider border-b border-indigo-100/50 pb-2 mb-3">
                  3. Bedrukkingen (Printings)
                </h4>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prodPrintings.map((pr: any) => (
                    <span key={pr.id} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-bold shrink-0">
                      <span>{pr.name} (surcharge: +€{pr.surcharge || 0})</span>
                      <button
                        type="button"
                        onClick={() => setProdPrintings(prodPrintings.filter(p => p.id !== pr.id))}
                        className="text-rose-500 hover:text-rose-700 font-black cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {prodPrintings.length === 0 && <span className="text-slate-400 py-1 font-semibold">Geen bedrukkingsopties toegevoegd.</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">ID</label>
                    <input type="text" value={newPrintId} onChange={(e) => setNewPrintId(e.target.value)} placeholder="E.g. 4_0" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Omschrijving</label>
                    <input type="text" value={newPrintName} onChange={(e) => setNewPrintName(e.target.value)} placeholder="E.g. 4/0 Enkelzijdig Full Color" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Toeslag (€)</label>
                    <div className="flex space-x-2">
                      <input type="number" step="0.01" value={newPrintSurcharge} onChange={(e) => setNewPrintSurcharge(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                      <button type="button" onClick={addPrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-2.5 cursor-pointer">Voeg toe</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributes block: Afwerkingen (Finishings) */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40">
                <h4 className="text-[10px] font-extrabold text-indigo-750 uppercase tracking-wider border-b border-indigo-100/50 pb-2 mb-3">
                  4. Verdelingen en Luxe Afwerkingen (Finishings)
                </h4>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prodFinishings.map((f: any) => (
                    <span key={f.id} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-bold shrink-0">
                      <span>{f.name} (surcharge: +€{f.surcharge || 0})</span>
                      <button
                        type="button"
                        onClick={() => setProdFinishings(prodFinishings.filter(fItem => fItem.id !== f.id))}
                        className="text-rose-500 hover:text-rose-700 font-black cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {prodFinishings.length === 0 && <span className="text-slate-400 py-1 font-semibold">Geen afwerkingen toegevoegd.</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">ID</label>
                    <input type="text" value={newFinishId} onChange={(e) => setNewFinishId(e.target.value)} placeholder="E.g. foil_gold" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Omschrijving</label>
                    <input type="text" value={newFinishName} onChange={(e) => setNewFinishName(e.target.value)} placeholder="E.g. Eenzijdig Goudfolie Reliëf" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Toeslag (€)</label>
                    <div className="flex space-x-2">
                      <input type="number" step="0.01" value={newFinishSurcharge} onChange={(e) => setNewFinishSurcharge(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                      <button type="button" onClick={addFinish} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-2.5 cursor-pointer">Voeg toe</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributes block: Staffelprijzen (Quantities & Base Prices) */}
              <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40">
                <h4 className="text-[10px] font-extrabold text-indigo-750 uppercase tracking-wider border-b border-indigo-100/50 pb-2 mb-3">
                  5. Oplaag Volumes / Staffels & Starttarieven
                </h4>

                <div className="flex flex-wrap gap-2 mb-4">
                  {prodQuantities.map((qu: any) => (
                    <span key={qu.id} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-705 font-bold shrink-0">
                      <span>Staffel: {qu.value} (Basis: €{qu.basePrice || 0})</span>
                      <button
                        type="button"
                        onClick={() => setProdQuantities(prodQuantities.filter(q => q.id !== qu.id))}
                        className="text-rose-500 hover:text-rose-700 font-black cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {prodQuantities.length === 0 && <span className="text-slate-400 py-1 font-semibold">Geen staffels geconfigureerd.</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Sleutel (ID)</label>
                    <input type="text" value={newQuantId} onChange={(e) => setNewQuantId(e.target.value)} placeholder="E.g. staffel_100" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Aantal stuks / Oplage</label>
                    <input type="number" value={newQuantValue} onChange={(e) => setNewQuantValue(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-slate-400 font-semibold mb-1">Basisprijs (€)</label>
                    <div className="flex space-x-2">
                      <input type="number" step="0.01" value={newQuantBasePrice} onChange={(e) => setNewQuantBasePrice(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10.5px]" />
                      <button type="button" onClick={addQuant} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-2.5 cursor-pointer">Voeg toe</button>
                    </div>
                  </div>
                </div>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setProductFormOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-105 cursor-pointer text-xs"
              >
                Annuleer
              </button>
              
              <button
                onClick={handleProductFormSubmit}
                className="py-2.5 px-6 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-md text-xs"
              >
                Opslaan in SQL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
