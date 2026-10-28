import { useState } from 'react'

function App() {
  const [dataset, setDataset] = useState('100')
  const [githubToken, setGithubToken] = useState('')
  const [inputs, setInputs] = useState({
    natural_gas: 2.17,
    wti_crude: 25.55,
    copper: 0.84,
    silver: 5.37
  })
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')


  const cloudinaryUrls = {
    '25': 'https://res.cloudinary.com/dhrrvvuux/raw/upload/v1792588846/dataset_25_whjiud.csv',
    '50': 'https://res.cloudinary.com/dhrrvvuux/raw/upload/v1792588846/dataset_50_fvrqcv.csv',
    '100': 'https://res.cloudinary.com/dhrrvvuux/raw/upload/v1792588847/dataset_100_xdbepj.csv'
  }  
  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) })
  }

  const handlePredict = async () => {
    setLoading(true)
    setStatusMsg('')
    setResultado(null)
    
    // Aquí defines a dónde va cada modelo
    let url = '';
    if (dataset === '100') {
      // Este ya está en la nube para el cliente
      url = 'https://api-oro-100.onrender.com/predict';
    } else if (dataset === '50') {
      url = 'http://localhost:8050/predict';
    } else if (dataset === '25') {
      url = 'http://localhost:8025/predict';
    }

    try {
      const response = await fetch(url, {
//... el resto del código se queda igual
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      })
      const data = await response.json()
      setResultado(data.prediccion_gold)
    } catch (error) {
      setStatusMsg('Error: Asegúrate de que el contenedor Docker esté corriendo en el puerto ' + puertos[dataset])
    }
    setLoading(false)
  }

  const handleRetrain = async () => {
    if (!githubToken) {
      alert("Por favor ingresa tu Token de GitHub para re-entrenar.")
      return
    }

    setLoading(true)
    setStatusMsg('Disparando GitHub Actions...')

    const payload = {
      event_type: "ml_ci_cd",
      client_payload: {
        dataseturl: cloudinaryUrls[dataset],
        MODEL_NAME: "model-heart-kaos",
        sha: `version-${dataset}-pct`
      }
    }

    try {
      const response = await fetch('https://api.github.com/repos/kaos-gl/heart-model-kaos/dispatches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.status === 204) {
        setStatusMsg(`¡Workflow disparado exitosamente para el dataset ${dataset}%! Revisa GitHub Actions.`)
      } else {
        setStatusMsg(`Error al disparar: ${response.status}`)
      }
    } catch (error) {
      setStatusMsg('Error de red al conectar con GitHub API.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff3e0]"> {/* Naranja pastel muy suave */}
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full border-t-4 border-red-500">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📈 Predicción del Oro</h1>
          <p className="text-gray-500 text-sm mt-2">Módulo de MLOps: Consulta de predicciones y Re-entrenamiento remoto.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">🎯 Modelo a consultar / re-entrenar:</label>
            <select 
              className="w-full border border-orange-200 rounded-md p-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-700 shadow-sm"
              value={dataset} 
              onChange={(e) => setDataset(e.target.value)}
            >
              <option value="100">Versión 100% Dataset (Local: Puerto 8100)</option>
              <option value="50">Versión 50% Dataset (Local: Puerto 8050)</option>
              <option value="25">Versión 25% Dataset (Local: Puerto 8025)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
              <label className="block text-sm font-bold text-gray-700">🔥 Gas Natural</label>
              <p className="text-xs text-gray-500 mb-2">Precio del millón de BTU.</p>
              <input 
                type="number" step="0.01" name="natural_gas" value={inputs.natural_gas} onChange={handleInputChange} 
                className="w-full border border-gray-300 rounded p-3 text-lg font-medium focus:ring-red-500 focus:border-red-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0" 
              />
            </div>
            
            <div className="p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
              <label className="block text-sm font-bold text-gray-700">🛢️ Petróleo WTI</label>
              <p className="text-xs text-gray-500 mb-2">Crudo West Texas (Barril).</p>
              <input 
                type="number" step="0.01" name="wti_crude" value={inputs.wti_crude} onChange={handleInputChange} 
                className="w-full border border-gray-300 rounded p-3 text-lg font-medium focus:ring-red-500 focus:border-red-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0" 
              />
            </div>
            
            <div className="p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
              <label className="block text-sm font-bold text-gray-700">🥉 Cobre (Copper)</label>
              <p className="text-xs text-gray-500 mb-2">Precio por libra (Metal industrial).</p>
              <input 
                type="number" step="0.01" name="copper" value={inputs.copper} onChange={handleInputChange} 
                className="w-full border border-gray-300 rounded p-3 text-lg font-medium focus:ring-red-500 focus:border-red-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0" 
              />
            </div>
            
            <div className="p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
              <label className="block text-sm font-bold text-gray-700">🪙 Plata (Silver)</label>
              <p className="text-xs text-gray-500 mb-2">Precio por onza (Metal precioso).</p>
              <input 
                type="number" step="0.01" name="silver" value={inputs.silver} onChange={handleInputChange} 
                className="w-full border border-gray-300 rounded p-3 text-lg font-medium focus:ring-red-500 focus:border-red-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0" 
              />
            </div>
          </div>


          <button 
            onClick={handlePredict} 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-[1.02]">
            📊 Calcular Predicción
          </button>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-1">🔑 GitHub Token (Seguridad Cliente):</label>
            <p className="text-xs text-gray-500 mb-3">Requerido para autorizar la orden de re-entrenamiento remoto.</p>
            <input 
              type="password" 
              placeholder="ghp_..." 
              value={githubToken} 
              onChange={(e) => setGithubToken(e.target.value)} 
              className="w-full border border-gray-300 rounded-md p-3 mb-3 text-sm focus:ring-orange-400" 
            />
            <button 
              onClick={handleRetrain} 
              disabled={loading}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors">
              ⚙️ Re-entrenar Modelo ({dataset}%)
            </button>
          </div>

          {statusMsg && (
            <div className="mt-4 p-4 bg-orange-100 text-orange-800 rounded-lg border border-orange-200 text-center text-sm font-semibold">
              {statusMsg}
            </div>
          )}

          {resultado !== null && (
            <div className="mt-4 p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center shadow-inner">
              <p className="text-sm text-red-800 font-bold mb-2 uppercase tracking-wide">Precio Estimado (Modelo {dataset}%):</p>
              <p className="text-4xl font-extrabold text-red-600">${resultado.toFixed(2)} USD</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App