import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CONFIG } from '@shared/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';

// Função para copiar a configuração do servidor para o state local
function copyConfigToState() {
  return {
    openai: { ...CONFIG.openai },
    azure: { ...CONFIG.azure },
    ui: { ...CONFIG.ui },
    tutoring: { ...CONFIG.tutoring }
  };
}

export default function Settings() {
  const [config, setConfig] = useState(copyConfigToState());
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Funções para atualizar configurações
  const updateOpenAIConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      openai: {
        ...prev.openai,
        [key]: value
      }
    }));
  };

  const updateAzureConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      azure: {
        ...prev.azure,
        [key]: value
      }
    }));
  };

  const updateUIConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        [key]: value
      }
    }));
  };

  const updateTutoringConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      tutoring: {
        ...prev.tutoring,
        [key]: value
      }
    }));
  };

  // Função para salvar as configurações (em produção, isso faria uma chamada API)
  const saveConfig = () => {
    // Na implementação atual, não podemos atualizar o CONFIG diretamente no cliente
    // Esta função simula o que aconteceria em uma implementação completa
    
    // Em uma implementação real, faríamos uma chamada API:
    // await fetch('/api/settings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config)
    // });
    
    toast({
      title: "Configurações atualizadas",
      description: "As configurações foram gravadas localmente. Para usar as novas configurações, você precisará reiniciar o aplicativo.",
    });

    // Retornar à página inicial
    setTimeout(() => setLocation("/"), 1500);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência de aprendizado</p>
        </div>
        <Button onClick={() => setLocation("/")}>Voltar</Button>
      </div>

      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="azure">Azure TTS</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
          <TabsTrigger value="tutoring">Tutoria</TabsTrigger>
        </TabsList>

        {/* OpenAI Settings */}
        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do OpenAI</CardTitle>
              <CardDescription>Defina os parâmetros para o modelo de linguagem e TTS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select 
                  value={config.openai.model} 
                  onValueChange={(value) => updateOpenAIConfig('model', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temperatura: {config.openai.temperature}</Label>
                <Slider 
                  min={0} 
                  max={1} 
                  step={0.1}
                  value={[config.openai.temperature]} 
                  onValueChange={(values) => updateOpenAIConfig('temperature', values[0])} 
                />
                <p className="text-xs text-muted-foreground">Valores mais baixos produzem respostas mais previsíveis, valores mais altos produzem respostas mais criativas.</p>
              </div>

              <div className="space-y-2">
                <Label>Voz para Text-to-Speech</Label>
                <Select 
                  value={config.openai.voice} 
                  onValueChange={(value) => updateOpenAIConfig('voice', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma voz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy</SelectItem>
                    <SelectItem value="echo">Echo</SelectItem>
                    <SelectItem value="fable">Fable</SelectItem>
                    <SelectItem value="onyx">Onyx</SelectItem>
                    <SelectItem value="nova">Nova</SelectItem>
                    <SelectItem value="shimmer">Shimmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Máximo de tokens: {config.openai.maxTokens}</Label>
                <Slider 
                  min={100} 
                  max={1000} 
                  step={50}
                  value={[config.openai.maxTokens]} 
                  onValueChange={(values) => updateOpenAIConfig('maxTokens', values[0])} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Azure Settings */}
        <TabsContent value="azure">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Azure TTS</CardTitle>
              <CardDescription>Configure Text-to-Speech com Azure (para uso futuro)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="azure-tts" 
                  checked={config.azure.useForTTS}
                  onCheckedChange={(checked) => updateAzureConfig('useForTTS', checked)}
                />
                <Label htmlFor="azure-tts">Usar Azure para TTS (necessita configuração adicional)</Label>
              </div>

              <div className="space-y-2">
                <Label>Nome da Voz Azure</Label>
                <Input 
                  value={config.azure.voiceName} 
                  onChange={(e) => updateAzureConfig('voiceName', e.target.value)}
                  placeholder="pt-BR-FranciscaNeural" 
                />
                <p className="text-xs text-muted-foreground">Nome da voz no formato: idioma-PAÍS-NomeNeural</p>
              </div>

              <div className="space-y-2">
                <Label>Região Azure</Label>
                <Input 
                  value={config.azure.region} 
                  onChange={(e) => updateAzureConfig('region', e.target.value)}
                  placeholder="eastus" 
                />
              </div>

              <div className="space-y-2">
                <Label>Taxa de Fala: {config.azure.rate}</Label>
                <Slider 
                  min={0.5} 
                  max={2} 
                  step={0.1}
                  value={[config.azure.rate]} 
                  onValueChange={(values) => updateAzureConfig('rate', values[0])} 
                />
                <p className="text-xs text-muted-foreground">1.0 = velocidade normal, 0.5 = mais lento, 2.0 = mais rápido</p>
              </div>

              <div className="space-y-2">
                <Label>Tom da Voz: {config.azure.pitch}</Label>
                <Slider 
                  min={-100} 
                  max={100} 
                  step={10}
                  value={[config.azure.pitch]} 
                  onValueChange={(values) => updateAzureConfig('pitch', values[0])} 
                />
                <p className="text-xs text-muted-foreground">0 = tom normal, valores negativos = tom mais baixo, valores positivos = tom mais alto</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Settings */}
        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Interface</CardTitle>
              <CardDescription>Ajuste a experiência do usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Atraso mínimo de resposta (ms): {config.ui.minResponseDelay}</Label>
                <Slider 
                  min={0} 
                  max={1000} 
                  step={50}
                  value={[config.ui.minResponseDelay]} 
                  onValueChange={(values) => updateUIConfig('minResponseDelay', values[0])} 
                />
                <p className="text-xs text-muted-foreground">Atraso mínimo antes de mostrar a resposta do tutor</p>
              </div>

              <div className="space-y-2">
                <Label>Atraso máximo de resposta (ms): {config.ui.maxResponseDelay}</Label>
                <Slider 
                  min={0} 
                  max={2000} 
                  step={100}
                  value={[config.ui.maxResponseDelay]} 
                  onValueChange={(values) => updateUIConfig('maxResponseDelay', values[0])} 
                />
                <p className="text-xs text-muted-foreground">Atraso máximo antes de mostrar a resposta do tutor</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutoring Settings */}
        <TabsContent value="tutoring">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Tutoria</CardTitle>
              <CardDescription>Personalize sua experiência de aprendizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nível de correção: {config.tutoring.correctionLevel}</Label>
                <Slider 
                  min={0} 
                  max={1} 
                  step={0.1}
                  value={[config.tutoring.correctionLevel]} 
                  onValueChange={(values) => updateTutoringConfig('correctionLevel', values[0])} 
                />
                <p className="text-xs text-muted-foreground">0 = foco na comunicação, 1 = correção rigorosa de erros</p>
              </div>

              <div className="space-y-2">
                <Label>Método de aprendizado</Label>
                <Select 
                  value={config.tutoring.learningMethod} 
                  onValueChange={(value) => updateTutoringConfig('learningMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">Conversacional</SelectItem>
                    <SelectItem value="grammar-focused">Foco na gramática</SelectItem>
                    <SelectItem value="vocabulary-focused">Foco no vocabulário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nível de dificuldade</Label>
                <Select 
                  value={config.tutoring.initialDifficulty} 
                  onValueChange={(value) => updateTutoringConfig('initialDifficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="mr-2" onClick={() => setConfig(copyConfigToState())}>
          Restaurar
        </Button>
        <Button onClick={saveConfig}>
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}