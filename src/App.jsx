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
    
    // ⚠️ REEMPLAZA ESTAS URLs CON LAS TUYAS DE TUS 3 SERVICIOS EN RENDER
    const urlsRender = {
      '100': 'https://model-heart-kaos-v100.onrender.com', 
      '50': 'https://model-heart-kaos-v50.onrender.com',
      '25': 'https://model-heart-kaos-v25.onrender.com'
    };
    
    const url = urlsRender[dataset];

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      })
      const data = await response.json()
      setResultado(data.prediccion_gold)
      setStatusMsg('Cálculo exitoso desde la nube (Render).')
    } catch (error) {
      setStatusMsg('Error: Asegúrate de que el Web Service en Render esté encendido y funcionando.')
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff3e0]">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full border-t-4 border-red-500">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">