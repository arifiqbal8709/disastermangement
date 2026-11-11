import React, { useState, useEffect } from 'react';
import { Database, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Layers, Landmark, Trash2, Calendar, FileJson, Info, Edit, Plus, X, Phone, Mail, Link2, Eye, EyeOff, LogOut, ShieldCheck } from 'lucide-react';
import { officialDatasetRegistry, saveIngestedDataset, getIngestedDataset, deleteIngestedDataset, parseCSV, parseGeoJSON, parsePDFMetadata, parseSheltersDataset } from '../dataSources/dataIngestion';
import { api } from '../services/api';

export default function AdminSources({ onLogout }) {
  const [datasets, setDatasets] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  
  // Ingestion form state
  const [authorityName, setAuthorityName] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [retrievedDate, setRetrievedDate] = useState(new Date().toISOString().split('T')[0]);
  const [docTitle, setDocTitle] = useState("");
  const [isPdf, setIsPdf] = useState(false);

  // Success / error alerts
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📞 QUICK RESOURCES STATE MANAGEMENT
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({ name: "", type: "link", value: "", enabled: true });
  const [isAdding, setIsAdding] = useState(false);

  // Phone masking algorithm
  const maskValue = (type, val) => {
    if (type === 'phone') {
      const str = String(val).trim();
      // Keep already masked phone numbers intact
      if (str.includes('*')) return str;
      if (str.length <= 4) return "****";
      return str.substring(0, str.length - 4) + "****";
    }
    return val;
  };

  // Load resources registry
  const loadResources = () => {
    const defaultResources = [
      { id: "1", name: "NDMA India", type: "link", value: "https://ndma.gov.in", enabled: true },
      { id: "2", name: "India Meteorological Department", type: "link", value: "https://mausam.imd.gov.in", enabled: true },
      { id: "3", name: "INCOIS Ocean Alerts", type: "link", value: "https://incois.gov.in", enabled: true },
      { id: "4", name: "Gov-Tech Support", type: "text", value: "National NIC Node", enabled: true },
      { id: "5", name: "Support Email", type: "email", value: "support.resilience-ai@nic.in", enabled: true },
      { id: "6", name: "NDMA Control", type: "phone", value: "+91-11-2670****", enabled: true },
      { id: "7", name: "Emergency Response", type: "phone", value: "1078****", enabled: true }
    ];
    const stored = localStorage.getItem("sih_quick_resources");
    if (stored) {
      setResources(JSON.parse(stored));
    } else {
      localStorage.setItem("sih_quick_resources", JSON.stringify(defaultResources));
      setResources(defaultResources);
    }
  };

  const saveResourcesToStorage = (updatedList) => {
    localStorage.setItem("sih_quick_resources", JSON.stringify(updatedList));
    setResources(updatedList);
  };

  // Reload registry status
  const loadRegistry = () => {
    const registry = officialDatasetRegistry.map(item => {
      const stored = getIngestedDataset(item.key);
      return {
        ...item,
        status: stored ? "Imported Dataset" : item.defaultStatus,
        lastUpdated: stored ? stored.metadata.lastUpdated.split('T')[0] : "Never",
        sourceName: stored ? stored.metadata.sourceName : item.authority,
        sourceURL: stored ? stored.metadata.sourceURL : "#"
      };
    });
    setDatasets(registry);
  };

  useEffect(() => {
    loadRegistry();
    loadResources();
  }, []);

  const handleSelectDataset = (key) => {
    setSelectedKey(key);
    const target = officialDatasetRegistry.find(d => d.key === key);
    if (target) {
      setAuthorityName(target.authority);
      setIsPdf(target.dataType.includes("PDF"));
      setDocTitle(target.name);
      setUploadFile(null);
      setAlert(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleDelete = (key) => {
    if (window.confirm("Are you sure you want to remove this official dataset? Visual map layers for this hazard will become unavailable.")) {
      deleteIngestedDataset(key);
      loadRegistry();
      setAlert({ type: "success", text: "Official dataset removed from database." });
    }
  };

  const handleIngest = (e) => {
    e.preventDefault();
    if (!selectedKey) return;
    
    const targetDataset = officialDatasetRegistry.find(d => d.key === selectedKey);
    if (!targetDataset) return;

    if (!uploadFile && !isPdf) {
      setAlert({ type: "error", text: "Please select a dataset file to upload." });
      return;
    }

    setLoading(true);
    setAlert(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const textContent = event.target ? event.target.result : "";
        let parsedData = null;

        if (isPdf) {
          parsedData = parsePDFMetadata(
            uploadFile ? uploadFile.name : "Manual_Document_Reference",
            docTitle,
            authorityName,
            targetDataset.hazard,
            publishedDate || new Date().getFullYear().toString()
          );
        } else {
          const isCSV = uploadFile.name.endsWith('.csv');
          const isGeoJSON = uploadFile.name.endsWith('.geojson') || (uploadFile.name.endsWith('.json') && textContent.includes('FeatureCollection'));
          
          if (selectedKey === 'official_shelters') {
            const format = isCSV ? 'csv' : (isGeoJSON ? 'geojson' : 'json');
            parsedData = parseSheltersDataset(textContent, format);
          } else {
            if (isGeoJSON) {
              parsedData = parseGeoJSON(textContent);
            } else if (isCSV) {
              parsedData = parseCSV(textContent);
            } else {
              parsedData = JSON.parse(textContent);
            }
          }
        }

        const meta = {
          sourceName: authorityName,
          sourceURL: targetDataset.dataType.includes("Atlas") ? "https://asdma.assam.gov.in/portlets/flood-hazard-atlas" : "https://mausam.imd.gov.in/",
          publishedDate: publishedDate || new Date().toISOString().split('T')[0],
          retrievedDate: retrievedDate,
          dataType: targetDataset.dataType,
          fileName: uploadFile ? uploadFile.name : "Manual_Import"
        };

        saveIngestedDataset(selectedKey, parsedData, meta);
        
        // Also persist shelters directly to Supabase Backend
        if (selectedKey === 'official_shelters' && Array.isArray(parsedData)) {
          api.resources.batchImportShelters(parsedData).catch(err => {
            console.warn('Backend sync notice:', err.message);
          });
        }

        loadRegistry();
        
        setAlert({
          type: "success",
          text: `Success: ${targetDataset.name} imported. File "${uploadFile ? uploadFile.name : 'Metadata'}" parsed and registered.`
        });
        
        setSelectedKey("");
        setUploadFile(null);
      } catch (err) {
        setAlert({ type: "error", text: `Ingestion Failed: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setAlert({ type: "error", text: "Error reading the uploaded file." });
      setLoading(false);
    };

    if (isPdf && !uploadFile) {
      setTimeout(() => {
        const meta = {
          sourceName: authorityName,
          sourceURL: "https://asdma.assam.gov.in/",
          publishedDate: publishedDate || new Date().toISOString().split('T')[0],
          retrievedDate: retrievedDate,
          dataType: targetDataset.dataType,
          fileName: "ASDMA_DDMP_Report.pdf"
        };
        const parsed = parsePDFMetadata("ASDMA_DDMP_Report.pdf", docTitle, authorityName, targetDataset.hazard, publishedDate || "2023");
        saveIngestedDataset(selectedKey, parsed, meta);
        loadRegistry();
        setAlert({ type: "success", text: `Success: manual metadata import registered for ${targetDataset.name}.` });
        setSelectedKey("");
        setLoading(false);
      }, 1000);
    } else if (uploadFile) {
      if (isPdf) {
        reader.readAsDataURL(uploadFile);
      } else {
        reader.readAsText(uploadFile);
      }
    }
  };

  // Ingestion helper UI badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Imported Dataset':
        return <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold uppercase tracking-wider">Imported</span>;
      case 'Connected':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold uppercase tracking-wider">Connected Feed</span>;
      case 'Update Required':
        return <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-[9px] font-bold uppercase tracking-wider">Update Required</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-450 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider">Unavailable</span>;
    }
  };

  // HELPLINE MANAGEMENT CRUD
  const handleAddResource = (e) => {
    e.preventDefault();
    const resource = {
      id: Date.now().toString(),
      name: newResource.name,
      type: newResource.type,
      value: maskValue(newResource.type, newResource.value),
      enabled: newResource.enabled
    };
    const updated = [...resources, resource];
    saveResourcesToStorage(updated);
    setNewResource({ name: "", type: "link", value: "", enabled: true });
    setIsAdding(false);
    setAlert({ type: "success", text: "New administrative resource added." });
  };

  const handleStartEdit = (resource) => {
    setEditingResource({ ...resource });
    setIsAdding(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = resources.map(r => {
      if (r.id === editingResource.id) {
        return {
          ...editingResource,
          value: maskValue(editingResource.type, editingResource.value)
        };
      }
      return r;
    });
    saveResourcesToStorage(updated);
    setEditingResource(null);
    setAlert({ type: "success", text: "Helpline resource configurations saved." });
  };

  const handleDeleteResource = (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      const updated = resources.filter(r => r.id !== id);
      saveResourcesToStorage(updated);
      setAlert({ type: "success", text: "Helpline resource deleted." });
    }
  };

  const handleToggleResource = (id) => {
    const updated = resources.map(r => {
      if (r.id === id) {
        return { ...r, enabled: !r.enabled };
      }
      return r;
    });
    saveResourcesToStorage(updated);
  };

  return (
    <div className="bg-[#F4F7FA] min-h-screen py-8 px-4 sm:px-6 lg:px-8 page-fade-in text-left font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-navy-800" />
              <span>Database Ingest Panel</span>
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-800 border border-green-200">
                <ShieldCheck className="h-3 w-3 text-green-600" />
                Verified Admin Session
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy-900 font-display">
              Admin Data Sources & Intelligence Hub
            </h1>
            <p className="text-slate-500 text-sm font-semibold">
              Connect and upload verified GeoJSON, CSV, or PDF datasets directly into Supabase PostgreSQL & Storage.
            </p>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow flex items-center gap-2 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Admin
            </button>
          )}
        </div>

        {/* Global Alert Notification */}
        {alert && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 page-fade-in ${
            alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-xs font-bold leading-normal">
              {alert.text}
            </div>
          </div>
        )}

        {/* Ingestion Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Table: Datasets list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                  Official Ingestion Status Registry
                </span>
                <button 
                  onClick={loadRegistry} 
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                  title="Reload registry"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* Ingestion Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-semibold text-slate-650">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Dataset Name</th>
                      <th className="px-6 py-3">Authority</th>
                      <th className="px-6 py-3">Hazard</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Last Updated</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {datasets.map((dataset) => (
                      <tr 
                        key={dataset.key} 
                        className={`hover:bg-slate-50/50 transition-colors ${selectedKey === dataset.key ? 'bg-blue-50/20' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-navy-950">{dataset.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{dataset.dataType}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-bold">{dataset.sourceName}</td>
                        <td className="px-6 py-4">{dataset.hazard}</td>
                        <td className="px-6 py-4">{getStatusBadge(dataset.status)}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{dataset.lastUpdated}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleSelectDataset(dataset.key)}
                            className="px-3 py-1 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
                          >
                            Import
                          </button>
                          {dataset.status === "Imported Dataset" && (
                            <button
                              onClick={() => handleDelete(dataset.key)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded transition-colors inline-flex items-center"
                              title="Delete dataset"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Ingestion Information card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-3">
              <Info className="h-5.5 w-5.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 font-semibold text-slate-650">
                <h4 className="font-bold text-navy-955 uppercase tracking-wide">Data Driven Dashboard Rules:</h4>
                <p className="leading-relaxed">
                  Hazard indicators and map layers are generated directly from imported coordinate files. If a dataset is marked as "Unavailable", that layer will show a "GIS dataset not loaded" alert in the dashboard and legend views. No arbitrary fallback paths will render.
                </p>
              </div>
            </div>
          </div>

          {/* Right Col: Ingestion Import Form */}
          <div className="space-y-6">
            {selectedKey ? (
              <form onSubmit={handleIngest} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 page-fade-in">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="h-4.5 w-4.5 text-brand-orange-500" />
                    Ingest Dataset
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setSelectedKey("")}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-semibold text-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Target Dataset</span>
                    <strong className="text-navy-955 text-left block mt-0.5">
                      {officialDatasetRegistry.find(d => d.key === selectedKey)?.name}
                    </strong>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Source Authority</label>
                    <input
                      type="text"
                      value={authorityName}
                      onChange={(e) => setAuthorityName(e.target.value)}
                      required
                      placeholder="e.g. ASDMA, GSI, BMTPC, IMD"
                      className="w-full text-xs font-bold border border-slate-350 rounded p-2 focus:border-navy-900 focus:ring-navy-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Published Date</label>
                      <input
                        type="date"
                        value={publishedDate}
                        onChange={(e) => setPublishedDate(e.target.value)}
                        required
                        className="w-full text-xs border border-slate-350 rounded p-2 focus:border-navy-900 focus:ring-navy-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Retrieved Date</label>
                      <input
                        type="date"
                        value={retrievedDate}
                        onChange={(e) => setRetrievedDate(e.target.value)}
                        required
                        className="w-full text-xs border border-slate-350 rounded p-2 focus:border-navy-900 focus:ring-navy-900"
                      />
                    </div>
                  </div>

                  {isPdf && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Document Title</label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        required
                        placeholder="e.g. Guwahati Urban Flood Plan 2024"
                        className="w-full text-xs font-bold border border-slate-355 rounded p-2 focus:border-navy-900 focus:ring-navy-900"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isPdf ? "Upload Report PDF (Optional for Demo)" : "Upload Geometry File (.geojson, .json, .csv)"}
                    </label>
                    <input
                      type="file"
                      id="dataset-file"
                      accept={isPdf ? ".pdf" : ".geojson,.json,.csv"}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="dataset-file"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 hover:bg-slate-50 hover:border-brand-orange-400 cursor-pointer transition-all duration-150"
                    >
                      {uploadFile ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#071B33]">
                          <FileJson className="h-5 w-5 text-brand-orange-500" />
                          <span>{uploadFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-slate-400 text-xs">
                          <Upload className="h-6 w-6 mx-auto mb-1" />
                          <span className="font-bold text-[10px] block text-navy-955 uppercase tracking-wider">Drag & drop or click</span>
                          <span>Max 4MB upload size</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#071B33] hover:bg-navy-950 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      IMPORT OFFICIAL DATASET
                    </>
                  )}
                </button>

              </form>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 space-y-3 shadow-sm h-64 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-navy-900">Ingestion Inactive</h4>
                  <p className="text-[10px] max-w-[200px] mx-auto text-slate-500 font-semibold leading-relaxed">
                    Click the "Import" action button on any dataset row in the registry to launch the file parsing dialog.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 📞 QUICK RESOURCES SECTION */}
        <div className="border-t border-slate-200 pt-8 mt-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-navy-900 font-display uppercase tracking-wider flex items-center gap-2">
              <Landmark className="h-5.5 w-5.5 text-navy-800" />
              Quick Resources Management
            </h2>
            <p className="text-slate-550 text-xs font-semibold">
              Manage authoritative helpline numbers, support emails, and official website links. Any phone number displayed inside this section is partially masked using ** for data security.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Resources List (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Helpline Node Directory</span>
                {!isAdding && !editingResource && (
                  <button
                    onClick={() => {
                      setIsAdding(true);
                      setNewResource({ name: "", type: "link", value: "", enabled: true });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded text-[10px] uppercase tracking-wider transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Resource
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-semibold text-slate-650">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Resource Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Value / Link</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-navy-950">{res.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold uppercase">
                            {res.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 max-w-[200px] truncate">
                          {res.value}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleResource(res.id)}
                            className={`px-2 py-0.5 border text-[9px] font-bold rounded uppercase tracking-wider transition-all flex items-center gap-1 ${
                              res.enabled 
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/50' 
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50'
                            }`}
                          >
                            {res.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            <span>{res.enabled ? "Enabled" : "Disabled"}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleStartEdit(res)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors inline-flex items-center"
                            title="Edit resource"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded transition-colors inline-flex items-center"
                            title="Delete resource"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ingestion/Form Input Card (1 col) */}
            <div className="lg:col-span-1">
              {isAdding || editingResource ? (
                <form 
                  onSubmit={isAdding ? handleAddResource : handleSaveEdit}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs font-semibold text-slate-705 text-left page-fade-in"
                >
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider flex items-center gap-1">
                      <Edit className="h-4.5 w-4.5 text-brand-orange-500" />
                      <span>{isAdding ? "Add Resource" : "Edit Resource"}</span>
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => { setIsAdding(false); setEditingResource(null); }}
                      className="text-xs text-slate-400 hover:text-slate-650 font-bold uppercase"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-3 text-slate-650">
                    {/* Resource Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block">Resource Title</label>
                      <input
                        type="text"
                        value={isAdding ? newResource.name : editingResource.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isAdding) setNewResource(prev => ({ ...prev, name: val }));
                          else setEditingResource(prev => ({ ...prev, name: val }));
                        }}
                        required
                        placeholder="e.g. NDMA Support Office"
                        className="w-full text-xs font-bold border border-slate-350 rounded p-2 focus:border-navy-900 focus:ring-navy-900"
                      />
                    </div>

                    {/* Resource Type */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block">Resource Type</label>
                      <select
                        value={isAdding ? newResource.type : editingResource.type}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isAdding) setNewResource(prev => ({ ...prev, type: val }));
                          else setEditingResource(prev => ({ ...prev, type: val }));
                        }}
                        className="w-full text-xs font-bold border border-slate-350 rounded p-2 focus:border-navy-900 focus:ring-navy-900 cursor-pointer"
                      >
                        <option value="link">Official Website Link</option>
                        <option value="phone">Helpline Phone Number</option>
                        <option value="email">Support Email</option>
                        <option value="text">General Support Text</option>
                      </select>
                    </div>

                    {/* Resource Value */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block">
                        {(isAdding ? newResource.type : editingResource.type) === 'phone' 
                          ? "Phone Number (Masks last 4 digits)" 
                          : "URL Link / Value Content"}
                      </label>
                      <input
                        type="text"
                        value={isAdding ? newResource.value : editingResource.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isAdding) setNewResource(prev => ({ ...prev, value: val }));
                          else setEditingResource(prev => ({ ...prev, value: val }));
                        }}
                        required
                        placeholder={
                          (isAdding ? newResource.type : editingResource.type) === 'phone' 
                            ? "e.g. +91-11-26701700"
                            : "e.g. https://ndma.gov.in"
                        }
                        className="w-full text-xs font-bold border border-slate-350 rounded p-2 focus:border-navy-900 focus:ring-navy-900"
                      />
                    </div>

                    {/* Enable Checkbox */}
                    <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold text-navy-900">
                      <input
                        type="checkbox"
                        checked={isAdding ? newResource.enabled : editingResource.enabled}
                        onChange={(e) => {
                          const val = e.target.checked;
                          if (isAdding) setNewResource(prev => ({ ...prev, enabled: val }));
                          else setEditingResource(prev => ({ ...prev, enabled: val }));
                        }}
                        className="rounded border-slate-300 text-navy-800 focus:ring-navy-800 w-4 h-4 cursor-pointer"
                      />
                      <span>Enable Resource</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#071B33] hover:bg-navy-950 text-white font-bold rounded text-xs transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-brand-green-500" />
                    <span>{isAdding ? "Create Resource" : "Save Resource"}</span>
                  </button>

                </form>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 space-y-3 shadow-sm h-64 flex flex-col items-center justify-center">
                  <Landmark className="h-8 w-8 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-navy-900">Resource Control Inactive</h4>
                    <p className="text-[10px] max-w-[200px] mx-auto text-slate-500 font-semibold leading-relaxed">
                      Click "Add Resource" or the edit pencil icon on any list item to configure helpline nodes.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
