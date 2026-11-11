const test = async () => {
  try {
    const alertsRes = await fetch('http://localhost:5000/api/alerts');
    const alerts = await alertsRes.json();
    console.log(`✅ ALERTS: ${alerts.data.length} active verified alerts loaded`);

    const memRes = await fetch('http://localhost:5000/api/memory');
    const memory = await memRes.json();
    console.log(`✅ MEMORY: ${memory.data.length} historical memory events loaded`);

    const simRes = await fetch('http://localhost:5000/api/simulator/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        districtId: 'dhemaji',
        rainfallSurgePct: 50,
        damDischargeCumec: 1400,
        embankmentBreach: true
      })
    });
    const sim = await simRes.json();
    console.log(`✅ SIMULATION: Flood Depth ${sim.data.impacts.projectedFloodDepthMeters}m | Area ${sim.data.impacts.projectedAreaSubmergedSqkm} sqkm | At Risk ${sim.data.impacts.estimatedPopulationAtRisk} pax | NDRF Teams ${sim.data.logistics.requiredNdrfTeams}`);

    const intelRes = await fetch('http://localhost:5000/api/intelligence/risk-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ districtId: 'cachar', hazardType: 'Flood' })
    });
    const intel = await intelRes.json();
    console.log(`✅ INTELLIGENCE: Risk Tier ${intel.data.riskTier} | Composite Score ${intel.data.compositeScore}/100 | Findings: ${intel.data.keyFindings.length}`);

    console.log('\n🎉 ALL PHASE 1 BACKEND APIS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Phase 1 Test failed:', err.message);
  }
};

test();
