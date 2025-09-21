import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

type FormulaVersion = { version: string; status: string };
type FormulaDraft = { version: string; inputs?: { name: string }[]; expression?: string; allowed_symbols?: string[]; tests?: any };
type FormulaListItem = { name: string; display_name: string };

const api = async (path: string, opts: RequestInit = {}) => {
  const res = await fetch(`/api${path}`, opts);
  const text = await res.text();
  let json: any = undefined;
  try { 
    json = text ? JSON.parse(text) : undefined; 
  } catch (e) {
  }
  if (!res.ok) { throw { status: res.status, body: json || text }; }
  return json;
};

export default function FormulaEditorPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('editor');
  const [versions, setVersions] = useState<FormulaVersion[]>([]);
  const [draft, setDraft] = useState<FormulaDraft | null>(null);
  const [expr, setExpr] = useState<string>('');
  const [testsJson, setTestsJson] = useState<string>('{}');
  const [response, setResponse] = useState<any>(null);
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [pinsStatus, setPinsStatus] = useState<any>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [availableFormulas, setAvailableFormulas] = useState<FormulaListItem[]>([]);
  const formulaName = name || '';

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', 'X-User-Role': userRole }), [userRole]);

  const loadAvailableFormulas = async () => {
    try {
      const data = await api('/formulas');
      setAvailableFormulas(data.formulas || []);
    } catch (err) {
      console.error('Failed to load available formulas:', err);
    }
  };

  const handleFormulaChange = (selectedFormulaName: string) => {
    if (selectedFormulaName && selectedFormulaName !== formulaName) {
      navigate(`/formulas/${selectedFormulaName}`);
    }
  };

  const load = async () => {
    if (!formulaName) return;
    setLoading(true); setError(null);
    try {
      const data = await api(`/formulas/${formulaName}`);
      setVersions(data.versions || []);
      
      // Use draft if available, otherwise use active version
      const formulaData = data.draft || data.active;
      setDraft(formulaData || null);
      setExpr((formulaData && formulaData.expression) || '');
      setTestsJson(JSON.stringify((formulaData && formulaData.tests) || {}, null, 2));
      
      // Load pins & health
      try {
        const pins = await api(`/pins`);
        setPinsStatus(pins.validation_status || {});
      } catch {}
      try {
        const aud = await api(`/audit?limit=50&formula=${encodeURIComponent(formulaName)}`, { headers } as any);
        setAuditItems(aud.items || []);
      } catch {}
      // Load config data
      try {
        const config = await api(`/config`);
        setConfigData(config);
      } catch {}
    } catch (e: any) {
      setError(`Load error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadAvailableFormulas();
    load(); 
    /* eslint-disable-next-line */ 
  }, [formulaName]);

  const putDraft = async () => {
    if (!formulaName) return;
    setLoading(true); setError(null); setResponse(null);
    try {
      // Combine existing inputs with config parameters that are used in the expression
      const existingInputs = (draft?.inputs && draft.inputs.length) ? draft.inputs : [];
      const configInputs = configParams
        .filter(param => expr.includes(param.name))
        .map(param => ({ name: param.name }));
      
      const allInputs = [
        ...existingInputs,
        ...configInputs.filter(configInput => 
          !existingInputs.some(existing => existing.name === configInput.name)
        )
      ];
      
      const payload = { 
        version: draft?.version || '1.0.0', 
        inputs: allInputs, 
        expression: expr, 
        allowed_symbols: ['Min','Max','+','-','*','/'], 
        tests: JSON.parse(testsJson || '{}') 
      };
      const res = await api(`/formulas/${formulaName}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      setResponse(res);
      await load();
    } catch (e: any) {
      setError(`PUT error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`);
    } finally { setLoading(false); }
  };

  const postValidate = async () => {
    if (!formulaName) return;
    setLoading(true); setError(null); setResponse(null);
    try {
      const res = await api(`/validate`, { method: 'POST', headers, body: JSON.stringify({ name: formulaName, version: draft?.version || '1.0.0' }) });
      setResponse(res);
    } catch (e: any) { setError(`Validate error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`); } finally { setLoading(false); }
  };
  const postCompile = async () => {
    setLoading(true); setError(null); setResponse(null);
    try {
      const res = await api(`/compile`, { method: 'POST', headers, body: JSON.stringify({ name: formulaName, version: draft?.version || '1.0.0' }) });
      setResponse(res);
    } catch (e: any) { setError(`Compile error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`); } finally { setLoading(false); }
  };
  const postTest = async () => {
    setLoading(true); setError(null); setResponse(null);
    try {
      const res = await api(`/test`, { method: 'POST', headers, body: JSON.stringify({ name: formulaName, version: draft?.version || '1.0.0' }) });
      setResponse(res);
    } catch (e: any) { setError(`Test error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`); } finally { setLoading(false); }
  };
  const postRelease = async () => {
    setLoading(true); setError(null); setResponse(null);
    try {
      const res = await api(`/release`, { method: 'POST', headers, body: JSON.stringify({ name: formulaName, version: draft?.version || '1.0.0' }) });
      setResponse(res);
      await load();
    } catch (e: any) { setError(`Release error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`); } finally { setLoading(false); }
  };
  const putPin = async () => {
    setLoading(true); setError(null); setResponse(null);
    try {
      const res = await api(`/pins`, { method: 'PUT', headers, body: JSON.stringify({ pins: { [formulaName]: draft?.version || '1.0.0' }, reason: 'frontend pin' }) });
      setResponse(res);
    } catch (e: any) { setError(`Pin error: ${e?.status || ''} ${JSON.stringify(e?.body || e)}`); } finally { setLoading(false); }
  };

  const allowed = draft?.allowed_symbols || [];
  const varsList = draft?.inputs?.map(i => i.name) || [];
  
  // Extract relevant config parameters for formula development
  const getRelevantConfigParams = (): Array<{name: string, value: any, category: string}> => {
    if (!configData) return [];
    
    const params: Array<{name: string, value: any, category: string}> = [];
    const simParams = configData.simulation_parameters || {};
    
    // Add simulation parameters that are commonly used in formulas
    const relevantParams = [
      'base_consumption_rate',
      'zeitpraeferenz_sensitivity', 
      'risikoaversion_sensitivity',
      'default_risk_aversion',
      'default_time_preference',
      'default_political_efficacy',
      'default_mean_altruism',
      'altruism_target_crisis',
      'max_investment_rate',
      'investment_return_factor',
      'investment_success_probability',
      'wealth_threshold_cognitive_stress',
      'max_cognitive_penalty',
      'cognitive_moderator_education_weight',
      'cognitive_moderator_capacity_weight'
    ];
    
    relevantParams.forEach(param => {
      if (simParams[param] !== undefined) {
        params.push({ name: param, value: simParams[param], category: 'simulation' });
      }
    });
    
    return params;
  };
  
  const configParams = getRelevantConfigParams();

  return (
    <div style={{ display: 'flex', height: '100%', color: 'var(--fg-color)' }}>
      <div style={{ 
        width: 300, 
        padding: 12, 
        borderRight: '1px solid #444', 
        overflowY: 'auto',
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      }}>
        <div style={{ marginBottom: 12, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <label style={{ color: '#ffffff' }}>Role:&nbsp;</label>
          <select value={userRole} onChange={e=>setUserRole(e.target.value)} style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #666' }}>
            <option>editor</option>
            <option>reviewer</option>
            <option>approver</option>
            <option>operator</option>
            <option>auditor</option>
          </select>
        </div>
        
        <div style={{ marginBottom: 12, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <label style={{ color: '#ffffff' }}>Formula:&nbsp;</label>
          <select 
            value={formulaName} 
            onChange={e => handleFormulaChange(e.target.value)} 
            style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #666', width: '100%', marginTop: 4 }}
          >
            <option value="">Select a formula...</option>
            {availableFormulas.map(formula => (
              <option key={formula.name} value={formula.name}>
                {formula.display_name}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: 16, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#00ff00', margin: '0 0 8px 0' }}>Formula Inputs ({varsList.length})</h4>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#ffffff' }}>
            {varsList.map(v => <li key={v}><code style={{ backgroundColor: '#333', padding: '2px 4px', borderRadius: 2, color: '#00ffff' }}>{v}</code></li>)}
          </ul>
        </div>
        
        <div style={{ marginBottom: 16, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#9932cc', margin: '0 0 8px 0' }}>Available Variables ({varsList.length + configParams.length})</h4>
          <div style={{ maxHeight: 150, overflowY: 'auto' }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: '#888', fontSize: '11px', marginBottom: 4 }}>Formula Inputs:</div>
              {varsList.map(v => (
                <span key={v} style={{ 
                  display: 'inline-block', 
                  margin: '2px',
                  padding: '2px 6px', 
                  backgroundColor: '#333', 
                  borderRadius: 3,
                  fontSize: '11px',
                  color: '#00ffff',
                  cursor: 'pointer',
                  border: '1px solid #00ffff'
                }}
                onClick={() => {
                  // Insert variable name into expression
                  setExpr(prev => prev + v);
                }}
                >
                  {v}
                </span>
              ))}
            </div>
            
            <div>
              <div style={{ color: '#888', fontSize: '11px', marginBottom: 4 }}>Config Parameters:</div>
              {configParams.map(param => (
                <span key={param.name} style={{ 
                  display: 'inline-block', 
                  margin: '2px',
                  padding: '2px 6px', 
                  backgroundColor: '#333', 
                  borderRadius: 3,
                  fontSize: '11px',
                  color: '#ff8c00',
                  cursor: 'pointer',
                  border: '1px solid #ff8c00'
                }}
                onClick={() => {
                  // Insert config parameter name into expression
                  setExpr(prev => prev + param.name);
                }}
                title={`Value: ${param.value}`}
                >
                  {param.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: 16, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#ff8c00', margin: '0 0 8px 0' }}>Config Parameters ({configParams.length})</h4>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {configParams.map(param => (
              <div key={param.name} style={{ 
                marginBottom: 4, 
                padding: 4, 
                backgroundColor: '#333', 
                borderRadius: 2,
                fontSize: '12px'
              }}>
                <div style={{ color: '#ff8c00', fontWeight: 'bold' }}>{param.name}</div>
                <div style={{ color: '#ffffff', marginLeft: 8 }}>
                  <code style={{ color: '#90EE90' }}>{typeof param.value === 'number' ? param.value.toString() : JSON.stringify(param.value)}</code>
                  <span style={{ color: '#888', marginLeft: 8 }}>({param.category})</span>
                </div>
              </div>
            ))}
          </div>
          {configParams.length === 0 && <div style={{ color: '#888', fontSize: '12px' }}>Loading config...</div>}
        </div>
        
        <div style={{ marginBottom: 16, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#00ff00', margin: '0 0 8px 0' }}>Allowed ({allowed.length})</h4>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#ffffff' }}>
            {allowed.map(s => <li key={s}><code style={{ backgroundColor: '#333', padding: '2px 4px', borderRadius: 2, color: '#ffff00' }}>{s}</code></li>)}
          </ul>
        </div>
        
        <div style={{ marginBottom: 16, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#00ff00', margin: '0 0 8px 0' }}>Versions ({versions.length})</h4>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#ffffff' }}>
            {versions.map(v => <li key={v.version}>{v.version} <span style={{ color: '#90EE90' }}>({v.status})</span></li>)}
          </ul>
        </div>
        
        <div style={{ marginBottom: 16, backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#00ff00', margin: '0 0 8px 0' }}>Pins</h4>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            margin: 0, 
            fontSize: '12px', 
            color: '#ffffff',
            backgroundColor: '#333',
            padding: 8,
            borderRadius: 4,
            overflow: 'auto',
            maxHeight: 100
          }}>
            {pinsStatus ? JSON.stringify(pinsStatus, null, 2) : '—'}
          </pre>
        </div>
        
        <div style={{ backgroundColor: '#2a2a2a', padding: 8, borderRadius: 4 }}>
          <h4 style={{ color: '#00ff00', margin: '0 0 8px 0' }}>Audit ({auditItems.length})</h4>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#ffffff', maxHeight: 200, overflowY: 'auto' }}>
            {auditItems.map((it, idx) => (
              <li key={idx} style={{ fontSize: '12px', marginBottom: 4 }}>
                <code style={{ color: '#888' }}>{it.ts?.substring(11, 19)}</code> 
                <span style={{ color: '#ffff00' }}> {it.action}</span>
                {it.formula && <span style={{ color: '#00ffff' }}> ({it.formula}@{it.version||''})</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column' }}>
        <h3>Formula Editor: {formulaName}</h3>
        <textarea value={expr} onChange={e=>setExpr(e.target.value)} style={{ width: '100%', height: 160, fontFamily: 'monospace' }} />
        <div style={{ marginTop: 8 }}>
          <button onClick={putDraft} disabled={loading}>Save Draft</button>
          <button onClick={postValidate} disabled={loading} style={{ marginLeft: 6 }}>Validate</button>
          <button onClick={postCompile} disabled={loading} style={{ marginLeft: 6 }}>Compile</button>
          <button onClick={postTest} disabled={loading} style={{ marginLeft: 6 }}>Test</button>
          <button onClick={postRelease} disabled={loading} style={{ marginLeft: 6 }}>Release</button>
          <button onClick={putPin} disabled={loading || userRole!=='operator'} style={{ marginLeft: 6 }}>Pin (operator)</button>
        </div>
        <div style={{ display: 'flex', marginTop: 12 }}>
          <div style={{ flex: 1, marginRight: 8 }}>
            <h4>Tests (JSON)</h4>
            <textarea value={testsJson} onChange={e=>setTestsJson(e.target.value)} style={{ width: '100%', height: 220, fontFamily: 'monospace' }} />
          </div>
          <div style={{ flex: 1, marginLeft: 8 }}>
            <h4>Response</h4>
            <pre style={{ background: '#111', padding: 8, height: 220, overflow: 'auto' }}>{response ? JSON.stringify(response, null, 2) : '—'}</pre>
            {error && <div style={{ color: '#f66', marginTop: 8 }}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
