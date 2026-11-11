import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import DistrictAnalysis from './pages/DistrictAnalysis';
import Dashboard from './pages/Dashboard';
import ActionPlan from './pages/ActionPlan';
import About from './pages/About';
import MapPage from './pages/MapPage';
import AdminSources from './pages/AdminSources';
import { districts } from './data/mockData';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedDistrictId, setSelectedDistrictId] = useState(districts[0].id);
  const [selectedDisasterType, setSelectedDisasterType] = useState(districts[0].primaryHazard);
  const [simulationMode, setSimulationMode] = useState(null);
  const [showSheltersOnMap, setShowSheltersOnMap] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <Landing 
            setActivePage={setActivePage} 
            setSelectedDistrictId={setSelectedDistrictId} 
            selectedDisasterType={selectedDisasterType}
            setSelectedDisasterType={setSelectedDisasterType}
          />
        );
      case 'analyze':
        return (
          <DistrictAnalysis 
            selectedDistrictId={selectedDistrictId}
            setSelectedDistrictId={setSelectedDistrictId}
            selectedDisasterType={selectedDisasterType}
            setSelectedDisasterType={setSelectedDisasterType}
            setActivePage={setActivePage}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            selectedDistrictId={selectedDistrictId} 
            selectedDisasterType={selectedDisasterType}
            setActivePage={setActivePage}
            simulationMode={simulationMode}
            showSheltersOnMap={showSheltersOnMap}
            setShowSheltersOnMap={setShowSheltersOnMap}
          />
        );
      case 'actionplan':
        return (
          <ActionPlan 
            selectedDistrictId={selectedDistrictId} 
            selectedDisasterType={selectedDisasterType}
            simulationMode={simulationMode}
          />
        );
      case 'about':
        return <About />;
      case 'admin':
        return <AdminSources />;
      case 'map':
        return (
          <MapPage 
            selectedDistrictId={selectedDistrictId}
            setSelectedDistrictId={setSelectedDistrictId}
            setActivePage={setActivePage}
            simulationMode={simulationMode}
            setSimulationMode={setSimulationMode}
            showSheltersOnMap={showSheltersOnMap}
            setShowSheltersOnMap={setShowSheltersOnMap}
          />
        );
      default:
        return (
          <Landing 
            setActivePage={setActivePage} 
            setSelectedDistrictId={setSelectedDistrictId} 
            selectedDisasterType={selectedDisasterType}
            setSelectedDisasterType={setSelectedDisasterType}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-blue-100">
      {/* Top Navigation */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Page Area */}
      <main className="flex-grow">
        {renderActivePage()}
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
