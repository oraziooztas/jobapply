"use client"

import { useState, useEffect } from "react"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Upload, FileText, Send, TrendingUp, CheckCircle2, Clock, Plus, Trash2, Edit, Copy, Sparkles, Target, RefreshCw } from "lucide-react"

type Application = {
  id: string
  company: string
  position: string
  status: 'applied' | 'in_review' | 'interview' | 'offered' | 'rejected'
  applied_at: string
  notes: string | null
  cover_letters?: Array<{ content: string }>
}

type CV = {
  id: string
  file_name: string
  file_url: string
  skills: string[]
  created_at: string
}

type JobMatch = {
  id: string
  match_score: number
  job_offers: {
    id: string
    company: string
    position: string
    description: string
    url: string
  }
}

export default function Home() {
  const { isLoaded, userId } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvs, setCvs] = useState<CV[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("")
  const [stats, setStats] = useState({ total: 0, inReview: 0, responses: 0, interviews: 0 })

  const [newApplication, setNewApplication] = useState({
    company: "",
    position: "",
    job_url: "",
    notes: ""
  })

  const [coverLetterForm, setCoverLetterForm] = useState({
    company: "",
    position: "",
    job_description: ""
  })

  useEffect(() => {
    if (isLoaded && userId) {
      fetchApplications()
      fetchCVs()
      fetchJobMatches()
    }
  }, [isLoaded, userId])

  const fetchCVs = async () => {
    try {
      const res = await fetch('/api/cvs')
      if (res.ok) {
        const data = await res.json()
        setCvs(data)
      }
    } catch (error) {
      console.error('Error fetching CVs:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const fetchJobMatches = async () => {
    try {
      const res = await fetch('/api/job-matches')
      if (res.ok) {
        const data = await res.json()
        setJobMatches(data)
      }
    } catch (error) {
      console.error('Error fetching job matches:', error)
    }
  }

  const calculateStats = (apps: Application[]) => {
    const total = apps.length
    const inReview = apps.filter(a => a.status === 'in_review').length
    const responses = apps.filter(a => a.status === 'interview' || a.status === 'offered').length
    const interviews = apps.filter(a => a.status === 'interview').length
    setStats({ total, inReview, responses, interviews })
  }

  const handleCVUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cvFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', cvFile)

      const res = await fetch('/api/cvs', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setCvs([...cvs, data])
        setCvFile(null)
        alert('CV caricato con successo!')
      } else {
        const error = await res.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      alert('Errore durante il caricamento del CV')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApplication.company || !newApplication.position) return

    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication)
      })

      if (res.ok) {
        const data = await res.json()
        setApplications([data, ...applications])
        setNewApplication({ company: "", position: "", job_url: "", notes: "" })
        setActiveTab("applications")
      } else {
        alert('Errore nella creazione della candidatura')
      }
    } catch (error) {
      alert('Errore durante la creazione della candidatura')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterForm.company || !coverLetterForm.position || !coverLetterForm.job_description) {
      alert('Compila tutti i campi')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coverLetterForm)
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedCoverLetter(data.content)
      } else {
        const error = await res.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      alert('Errore durante la generazione della cover letter')
    } finally {
      setGenerating(false)
    }
  }

  const handleJobMatch = async (company: string, position: string, description: string) => {
    try {
      const res = await fetch('/api/job-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, position, jobDescription: description })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Match Score: ${data.match_score}%`)
        fetchJobMatches()
      } else {
        alert('Errore nel calcolo del match')
      }
    } catch (error) {
      alert('Errore durante il calcolo del match')
    }
  }

  const handleUpdateStatus = async (id: string, status: Application['status']) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        fetchApplications()
      }
    } catch (error) {
      alert('Errore nell\'aggiornamento dello stato')
    }
  }

  const handleDeleteApplication = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchApplications()
      }
    } catch (error) {
      alert('Errore nella cancellazione')
    }
  }

  const handleAutoFill = async (url: string) => {
    try {
      const res = await fetch('/api/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
      } else {
        alert('Errore durante l\'auto-fill')
      }
    } catch (error) {
      alert('Errore durante l\'auto-fill')
    }
  }

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'in_review': return 'bg-yellow-100 text-yellow-800'
      case 'interview': return 'bg-purple-100 text-purple-800'
      case 'offered': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'applied': return 'Candidato'
      case 'in_review': return 'In Revisione'
      case 'interview': return 'Colloquio'
      case 'offered': return 'Offerto'
      case 'rejected': return 'Rifiutato'
      default: return status
    }
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-dvh">Caricamento...</div>
  }

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold text-gray-900 dark:text-gray-100">
              JobApply
            </h1>
            <p className="text-pretty text-gray-600 dark:text-gray-400">
              Automazione candidature lavoro - Risparmia tempo e ottimizza la tua ricerca
            </p>
          </div>
          <UserButton />
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-lg grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="cover">Cover Letter</TabsTrigger>
            <TabsTrigger value="applications">Candidature</TabsTrigger>
            <TabsTrigger value="matches">Job Match</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Candidature</CardTitle>
                  <Send className="size-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Totale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Revisione</CardTitle>
                  <Clock className="size-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inReview}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">In attesa di risposta</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risposte</CardTitle>
                  <CheckCircle2 className="size-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.responses}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stats.interviews} colloqui</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Risparmiato</CardTitle>
                  <TrendingUp className="size-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total * 5}m</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">~5 min per candidatura</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Prossimi Passi</CardTitle>
                <CardDescription>
                  Continua a ottimizzare il tuo profilo per aumentare le possibilità
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cvs.length === 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Carica il tuo CV</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inizia aggiungendo il tuo CV aggiornato
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setActiveTab("cv")}>Vai</Button>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Plus className="size-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Nuova Candidatura</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aggiungi una nuova offerta di lavoro
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("applications")}>Vai</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cv" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>I tuoi CV</CardTitle>
                <CardDescription>
                  Gestisci i tuoi curriculum per le candidature
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cvs.length > 0 ? (
                  <div className="space-y-4">
                    {cvs.map((cv) => (
                      <div key={cv.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{cv.file_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {cv.skills.length} skill rilevate
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(cv.file_url, '_blank')}>
                          Visualizza
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleCVUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cv-upload">Carica CV (PDF)</Label>
                      <Input
                        id="cv-upload"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    {cvFile && (
                      <div className="flex items-center gap-2 rounded-md bg-gray-100 p-3 dark:bg-gray-900">
                        <FileText className="size-5 text-gray-600 dark:text-gray-400" />
                        <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                          {cvFile.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(cvFile.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={!cvFile || loading}>
                      {loading ? 'Caricamento...' : 'Carica CV'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cover" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Genera Cover Letter</CardTitle>
                <CardDescription>
                  Genera una cover letter personalizzata per ogni candidatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleGenerateCoverLetter() }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Azienda</Label>
                    <Input
                      id="company"
                      value={coverLetterForm.company}
                      onChange={(e) => setCoverLetterForm({ ...coverLetterForm, company: e.target.value })}
                      placeholder="Es. TechSpa srl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Posizione</Label>
                    <Input
                      id="position"
                      value={coverLetterForm.position}
                      onChange={(e) => setCoverLetterForm({ ...coverLetterForm, position: e.target.value })}
                      placeholder="Es. Full Stack Developer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-description">Descrizione Lavoro</Label>
                    <textarea
                      id="job-description"
                      className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500 md:text-sm"
                      placeholder="Incolla qui la descrizione dell'offerta di lavoro..."
                      value={coverLetterForm.job_description}
                      onChange={(e) => setCoverLetterForm({ ...coverLetterForm, job_description: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={generating}>
                    {generating ? (
                      <>
                        <RefreshCw className="mr-2 size-4 animate-spin" />
                        Generazione in corso...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 size-4" />
                        Genera Cover Letter
                      </>
                    )}
                  </Button>
                </form>

                {generatedCoverLetter && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Cover Letter Generata</Label>
                      <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(generatedCoverLetter)
                        alert('Copiato negli appunti!')
                      }}>
                        <Copy className="mr-2 size-4" />
                        Copia
                      </Button>
                    </div>
                    <textarea
                      className="flex min-h-[400px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 dark:focus-visible:ring-blue-500 md:text-sm"
                      value={generatedCoverLetter}
                      onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidature</CardTitle>
                <CardDescription>
                  Gestisci e traccia tutte le tue candidature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateApplication} className="mb-6 space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Nuova Candidatura</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="app-company">Azienda</Label>
                      <Input
                        id="app-company"
                        value={newApplication.company}
                        onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                        placeholder="Es. Google"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-position">Posizione</Label>
                      <Input
                        id="app-position"
                        value={newApplication.position}
                        onChange={(e) => setNewApplication({ ...newApplication, position: e.target.value })}
                        placeholder="Es. Software Engineer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-url">URL Offerta (opzionale)</Label>
                    <Input
                      id="app-url"
                      type="url"
                      value={newApplication.job_url}
                      onChange={(e) => setNewApplication({ ...newApplication, job_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-notes">Note</Label>
                    <textarea
                      id="app-notes"
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500 md:text-sm"
                      placeholder="Note aggiuntive..."
                      value={newApplication.notes}
                      onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      <Plus className="mr-2 size-4" />
                      Aggiungi Candidatura
                    </Button>
                    {newApplication.job_url && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAutoFill(newApplication.job_url)}
                      >
                        <Edit className="mr-2 size-4" />
                        Auto-Fill
                      </Button>
                    )}
                  </div>
                </form>

                {applications.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">
                    <Send className="mx-auto mb-4 size-12 text-gray-400 dark:text-gray-600" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Nessuna candidatura
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Inizia aggiungendo la tua prima candidatura sopra
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {app.position}
                              </h3>
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{app.company}</p>
                            {app.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {app.notes}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <select
                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900"
                                value={app.status}
                                onChange={(e) => handleUpdateStatus(app.id, e.target.value as Application['status'])}
                              >
                                <option value="applied">Candidato</option>
                                <option value="in_review">In Revisione</option>
                                <option value="interview">Colloquio</option>
                                <option value="offered">Offerto</option>
                                <option value="rejected">Rifiutato</option>
                              </select>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="size-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare questa candidatura?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata. Sei sicuro di voler eliminare la candidatura a {app.company}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteApplication(app.id)}>
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Matching</CardTitle>
                <CardDescription>
                  Calcola quanto la tua candidatura è adatta alle offerte di lavoro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleJobMatch(coverLetterForm.company, coverLetterForm.position, coverLetterForm.job_description)
                }} className="mb-6 space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Calcola Match</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="match-company">Azienda</Label>
                      <Input
                        id="match-company"
                        value={coverLetterForm.company}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, company: e.target.value })}
                        placeholder="Es. TechSpa srl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="match-position">Posizione</Label>
                      <Input
                        id="match-position"
                        value={coverLetterForm.position}
                        onChange={(e) => setCoverLetterForm({ ...coverLetterForm, position: e.target.value })}
                        placeholder="Es. Full Stack Developer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="match-description">Descrizione Lavoro</Label>
                    <textarea
                      id="match-description"
                      className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-500 md:text-sm"
                      placeholder="Incolla qui la descrizione dell'offerta di lavoro..."
                      value={coverLetterForm.job_description}
                      onChange={(e) => setCoverLetterForm({ ...coverLetterForm, job_description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Target className="mr-2 size-4" />
                    Calcola Match Score
                  </Button>
                </form>

                {jobMatches.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-800">
                    <Target className="mx-auto mb-4 size-12 text-gray-400 dark:text-gray-600" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Nessun match calcolato
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calcola il match score per vedere quanto sei adatto alle offerte
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobMatches.map((match) => (
                      <div key={match.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {match.job_offers.position}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{match.job_offers.company}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-800">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{ width: `${match.match_score}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {match.match_score}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
